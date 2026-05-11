'use server';

import { db } from "@/db";
import { studentFixedSlots } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addFixedSlotAction(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const coachId = formData.get('coachId') as string;
  const day = formData.get('day') as string;
  const time = formData.get('time') as string;
  const duration = parseInt(formData.get('duration') as string || '45');

  if (!studentId || !day || !time) {
    return { error: "Missing required fields" };
  }

  try {
    await db.insert(studentFixedSlots).values({
      studentId,
      coachId: coachId || null,
      day,
      time,
      duration,
    });

    revalidatePath('/fixed-schedule');
    revalidatePath('/students');
    return { success: true };
  } catch (e) {
    console.error("Failed to add fixed slot:", e);
    return { error: "Failed to add fixed slot" };
  }
}

export async function deleteFixedSlotAction(id: string) {
  try {
    await db.delete(studentFixedSlots).where(eq(studentFixedSlots.id, id));
    revalidatePath('/fixed-schedule');
    revalidatePath('/students');
    return { success: true };
  } catch (e) {
    console.error("Failed to delete fixed slot:", e);
    return { error: "Failed to delete fixed slot" };
  }
}
