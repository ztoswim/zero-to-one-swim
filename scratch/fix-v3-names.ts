import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function fixV3Names() {
  try {
    console.log("Updating D2D A 1v3 names to match image...");

    await db.update(packages)
      .set({ name: "DOOR 2 DOOR (A) 1V3 - 1 LESSON / PERSON" })
      .where(and(eq(packages.type, "Door to Door"), eq(packages.pax, 3), eq(packages.lessonCount, 1)));

    await db.update(packages)
      .set({ name: "DOOR 2 DOOR (A) 1V3 - 4 LESSON / PERSON" })
      .where(and(eq(packages.type, "Door to Door"), eq(packages.pax, 3), eq(packages.lessonCount, 4)));

    await db.update(packages)
      .set({ name: "DOOR 2 DOOR (A) 1V3 - 10 LESSON / PERSON" })
      .where(and(eq(packages.type, "Door to Door"), eq(packages.pax, 3), eq(packages.lessonCount, 10)));

    console.log("Names updated successfully!");
  } catch (error) {
    console.error("Error updating names:", error);
  }
}

fixV3Names();
