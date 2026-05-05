'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch user role from database
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, data.user.id),
  });

  if (!userProfile) {
    // If no profile exists, this is an error state for this specific app's RBAC
    await supabase.auth.signOut();
    return { error: "User profile not found. Please contact admin." };
  }

  revalidatePath('/', 'layout');
  
  // Redirect based on role
  if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
    redirect('/admin/dashboard');
  } else if (userProfile.role === 'coach') {
    redirect('/coach/dashboard');
  } else if (userProfile.role === 'parent') {
    redirect('/parent/dashboard');
  }

  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
