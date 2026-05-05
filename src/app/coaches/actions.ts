'use server';

import { db } from "@/db";
import { coaches } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addCoach(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const color = formData.get('color') as string || '#3b82f6';

  if (!name) return { error: "Name is required" };

  try {
    await db.insert(coaches).values({
      name,
      email,
      phone,
      color,
    });
    revalidatePath('/coaches');
    return { success: true };
  } catch (e) {
    return { error: "Failed to add coach." };
  }
}
