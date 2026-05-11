'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Use explicit selection to be resilient to schema mismatches
  try {
    const results = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      permissions: users.permissions,
      linkedCoachId: users.linkedCoachId,
      linkedAdminId: users.linkedAdminId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
    
    if (results.length === 0) {
      console.warn(`No user profile found in 'users' table for ID: ${user.id}. Attempting to auto-create...`);
      
      // Auto-create profile for the authenticated user if missing
      try {
        const newProfile = {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name || 'Admin User',
          role: 'root', // Default to root for development unblocking
          permissions: {},
          linkedCoachId: null as string | null,
          linkedAdminId: null as string | null,
          createdAt: new Date(),
        };
        
        await db.insert(users).values(newProfile);
        console.log(`Successfully auto-created root profile for ${user.email}`);
        return newProfile;
      } catch (insertError) {
        console.error("Failed to auto-create user profile:", insertError);
        return null;
      }
    }
    
    return results[0];
  } catch (error) {
    console.error("Error fetching user profile (full):", error);
    // Fallback logic
    try {
      const results = await db.select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        permissions: users.permissions,
        linkedCoachId: users.linkedCoachId,
        linkedAdminId: users.linkedAdminId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
      
      if (results.length === 0) return null;
      return results[0];
    } catch (e) {
      console.error("Error fetching user profile (fallback):", e);
      return null;
    }
  }
}

export async function getStaffAccessData() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }

  const { coaches: coachesTable, admins: adminsTable } = await import('@/db/schema');
  const { asc } = await import('drizzle-orm');

  const [usersData, coachesData, adminsData] = await Promise.all([
    db.select().from(users),
    db.query.coaches.findMany({ orderBy: [asc(coachesTable.name)] }),
    db.query.admins.findMany({ orderBy: [asc(adminsTable.name)] })
  ]);

  return {
    users: usersData,
    coaches: coachesData,
    admins: adminsData
  };
}

export async function getAllUsers() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }
  
  return await db.select().from(users);
}

export async function updateUserPermissions(userId: string, permissions: any) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin')) {
    throw new Error('Only root can update permissions');
  }
  
  await db.update(users)
    .set({ permissions })
    .where(eq(users.id, userId));
}

export async function updateUserRole(userId: string, role: string) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin')) {
    throw new Error('Only root can update roles');
  }
  
  await db.update(users)
    .set({ role })
    .where(eq(users.id, userId));
}

export async function getCoaches() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }
  
  const { coaches } = await import('@/db/schema');
  const { asc } = await import('drizzle-orm');
  return await db.query.coaches.findMany({
    orderBy: [asc(coaches.name)]
  });
}

export async function updateLinkedCoach(userId: string, coachId: string | null) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }
  
  await db.update(users)
    .set({ linkedCoachId: coachId })
    .where(eq(users.id, userId));
}

export async function getAdmins() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }
  
  const { admins } = await import('@/db/schema');
  const { asc } = await import('drizzle-orm');
  return await db.query.admins.findMany({
    orderBy: [asc(admins.name)]
  });
}

export async function updateLinkedAdmin(userId: string, adminId: string | null) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }
  
  await db.update(users)
    .set({ linkedAdminId: adminId })
    .where(eq(users.id, userId));
}


export async function createUserAction(data: { email: string, password: string, fullName: string, role: string }) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin');
  
  // 1. Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName
    }
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return { error: authError.message };
  }

  if (!authUser.user) {
    return { error: 'Failed to create auth user' };
  }

  // 2. Create profile in our database
  try {
    await db.insert(users).values({
      id: authUser.user.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      permissions: {}, // Start with no extra permissions beyond role defaults
    });
    
    return { success: true, userId: authUser.user.id };
  } catch (dbError) {
    console.error('DB Error:', dbError);
    // Cleanup auth user if DB insert fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return { error: 'Failed to create user profile in database' };
  }
}

export async function deleteUserAction(userId: string) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin')) {
    throw new Error('Only root can delete users');
  }

  // Prevent self-deletion
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (currentUser?.id === userId) {
    throw new Error('Cannot delete yourself');
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin');
  
  try {
    // 1. Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(userId);
    
    // 2. Delete from our database
    await db.delete(users).where(eq(users.id, userId));
    
    return { success: true };
  } catch (e: any) {
    console.error('Delete Error:', e);
    return { error: e.message || 'Failed to delete user' };
  }
}

export async function updateProfileNameAction(userId: string, fullName: string) {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error('Unauthorized');
  }

  await db.update(users)
    .set({ fullName })
    .where(eq(users.id, userId));
}

