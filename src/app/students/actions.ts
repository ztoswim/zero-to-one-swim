'use server';

import { db } from "@/db";
import { students, studentFixedSlots } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const gender = formData.get('gender') as string;
  const dob = formData.get('dob') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const parentName = formData.get('parentName') as string;
  const sameArea = formData.get('sameArea') as string;
  const emergencyName = formData.get('emergencyName') as string;
  const emergencyPhone = formData.get('emergencyPhone') as string;
  const address = formData.get('address') as string;
  const notes = formData.get('notes') as string;
  const coachId = formData.get('coachId') as string || null;
  const startDate = formData.get('startDate') as string;
  const lessonDuration = formData.get('lessonDuration') as string;
  const locationInfo = formData.get('locationInfo') as string;
  const locationId = formData.get('locationId') as string;
  const classDay = formData.get('classDay') as string;
  const classTime = formData.get('classTime') as string;
  const fixedSlotsJson = formData.get('fixedSlots') as string;

  if (!name) return { error: "Name is required" };

  try {
    const [newStudent] = await db.insert(students).values({
      name,
      gender,
      dob: dob ? dob : null,
      phone,
      email,
      parentName,
      sameArea,
      emergencyName,
      emergencyPhone,
      address,
      notes,
      startDate: startDate ? startDate : null,
      lessonDuration: lessonDuration ? parseInt(lessonDuration) : 45,
      locationId: locationId ? locationId : null,
      coachId: coachId === 'none' ? null : coachId,
      classDay,
      classTime,
      status: 'active',
    }).returning();

    // Handle Fixed Slots
    if (fixedSlotsJson) {
      const slots = JSON.parse(fixedSlotsJson);
      if (slots.length > 0) {
        await db.insert(studentFixedSlots).values(
          slots.map((s: any) => ({
            studentId: newStudent.id,
            coachId: s.coachId || newStudent.coachId,
            day: s.day,
            time: s.time,
            duration: s.duration || 45,
          }))
        );
      }
    }

    revalidatePath('/students');
    revalidatePath('/fixed-schedule');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add student." };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const gender = formData.get('gender') as string;
  const dob = formData.get('dob') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const parentName = formData.get('parentName') as string;
  const sameArea = formData.get('sameArea') as string;
  const emergencyName = formData.get('emergencyName') as string;
  const emergencyPhone = formData.get('emergencyPhone') as string;
  const address = formData.get('address') as string;
  const notes = formData.get('notes') as string;
  const coachId = formData.get('coachId') as string || null;
  const startDate = formData.get('startDate') as string;
  const lessonDuration = formData.get('lessonDuration') as string;
  const locationId = formData.get('locationId') as string;
  const status = formData.get('status') as string;

  if (!name) return { error: "Name is required" };

  try {
    const fixedSlotsJson = formData.get('fixedSlots') as string;

    const updateData: any = {
      name,
      gender,
      dob: dob ? dob : null,
      phone,
      email,
      parentName,
      sameArea,
      emergencyName,
      emergencyPhone,
      address,
      notes,
      startDate: startDate ? startDate : null,
      lessonDuration: lessonDuration ? parseInt(lessonDuration) : 45,
      locationId: locationId ? locationId : null,
      coachId: coachId === 'none' ? null : coachId,
    };

    if (status) {
      updateData.status = status;
    }

    await db.update(students).set(updateData).where(eq(students.id, id));

    // Update Fixed Slots
    if (fixedSlotsJson) {
      const slots = JSON.parse(fixedSlotsJson);
      // Delete old slots
      await db.delete(studentFixedSlots).where(eq(studentFixedSlots.studentId, id));
      // Insert new ones
      if (slots.length > 0) {
        await db.insert(studentFixedSlots).values(
          slots.map((s: any) => ({
            studentId: id,
            coachId: s.coachId || coachId,
            day: s.day,
            time: s.time,
            duration: s.duration || 45,
          }))
        );
      }
    }

    revalidatePath('/students');
    revalidatePath('/fixed-schedule');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update student." };
  }
}

export async function deleteStudentAction(id: string) {
  try {
    await db.delete(students).where(eq(students.id, id));
    revalidatePath('/students');
    revalidatePath('/fixed-schedule');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete student." };
  }
}
