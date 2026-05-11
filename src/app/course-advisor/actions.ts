'use server';

import { db } from "@/db";
import { admins as adminsSchema } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUserProfile } from "@/app/staff-access/actions";

export async function getAdmins() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'root' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    return [];
  }
  
  return await db.query.admins.findMany({
    orderBy: [asc(adminsSchema.name)]
  });
}

export async function addCourseAdvisorAction(data: any) {
  try {
    const user = await getCurrentUserProfile();
    if (!user || (user.role !== 'root' && user.role !== 'super_admin' && user.role !== 'admin')) {
      return { error: 'Unauthorized' };
    }

    await db.insert(adminsSchema).values({
      ...data,
      updatedAt: new Date().toISOString()
    });

    revalidatePath('/course-advisor');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to add course advisor' };
  }
}

export async function deleteCourseAdvisorAction(id: string) {
  try {
    const user = await getCurrentUserProfile();
    if (!user || (user.role !== 'root' && user.role !== 'super_admin' && user.role !== 'admin')) {
      return { error: 'Unauthorized' };
    }

    await db.delete(adminsSchema).where(eq(adminsSchema.id, id));

    revalidatePath('/course-advisor');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete course advisor' };
  }
}

export async function updateCourseAdvisorAction(id: string, data: any) {
  try {
    const user = await getCurrentUserProfile();
    if (!user || (user.role !== 'root' && user.role !== 'super_admin' && user.role !== 'admin')) {
      return { error: 'Unauthorized' };
    }

    await db.update(adminsSchema)
      .set({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .where(eq(adminsSchema.id, id));

    revalidatePath('/course-advisor');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to update course advisor' };
  }
}
