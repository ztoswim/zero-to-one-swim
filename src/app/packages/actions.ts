'use server';

import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPackages() {
  try {
    return await db.query.packages.findMany({
      orderBy: (packages, { desc }) => [desc(packages.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

export async function upsertPackage(data: any) {
  try {
    const { id, ...rest } = data;
    
    if (id) {
      await db.update(packages)
        .set(rest)
        .where(eq(packages.id, id));
    } else {
      await db.insert(packages).values(rest);
    }
    
    revalidatePath("/packages");
    revalidatePath("/create-invoice");
    return { success: true };
  } catch (error) {
    console.error("Error saving package:", error);
    return { success: false, error: "Failed to save package" };
  }
}

export async function deletePackage(id: string) {
  try {
    await db.delete(packages).where(eq(packages.id, id));
    revalidatePath("/packages");
    revalidatePath("/create-invoice");
    return { success: true };
  } catch (error) {
    console.error("Error deleting package:", error);
    return { success: false, error: "Failed to delete package" };
  }
}
