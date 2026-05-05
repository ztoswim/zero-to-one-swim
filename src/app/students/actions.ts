'use server';

import { db } from "@/db";
import { students } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const parentName = formData.get('parentName') as string;
  const coachId = formData.get('coachId') as string || null;
  const gender = formData.get('gender') as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.insert(students).values({
      name,
      phone,
      parentName,
      gender,
      coachId: coachId === 'none' ? null : coachId,
      status: 'active',
    });
    revalidatePath('/students');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add student." };
  }
}
