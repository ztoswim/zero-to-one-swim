'use server';

import { db } from "@/db";
import { coaches } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addCoach(formData: FormData) {
  const name = formData.get('name') as string;
  const nickname = formData.get('nickname') as string;
  const gender = formData.get('gender') as string;
  const dob = formData.get('dob') as string;
  const ic = formData.get('ic') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const color = formData.get('color') as string || '#3b82f6';
  const cost = formData.get('cost') as string || '50.00';
  const level = formData.get('level') as string;
  const joinDate = formData.get('joinDate') as string;
  const bankName = formData.get('bankName') as string;
  const bankAccount = formData.get('bankAccount') as string;
  const emergencyName = formData.get('emergencyName') as string;
  const emergencyPhone = formData.get('emergencyPhone') as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.insert(coaches).values({
      name,
      nickname,
      gender,
      dob: dob ? dob : null,
      ic,
      email,
      phone,
      address,
      color,
      cost,
      level,
      joinDate: joinDate ? joinDate : null,
      bankName,
      bankAccount,
      emergencyName,
      emergencyPhone,
    });
    revalidatePath('/coaches');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add coach." };
  }
}
