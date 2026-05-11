import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function fixV3Prices() {
  try {
    console.log("Fixing D2D A 1v3 prices based on image...");

    // 1 Session: Total 300 (270 + 30)
    await db.update(packages)
      .set({ price: "270.00", transportFee: "30.00" })
      .where(and(eq(packages.type, "Door to Door"), eq(packages.pax, 3), eq(packages.lessonCount, 1)));

    // 4 Sessions: Total 960 (861 + 99)
    await db.update(packages)
      .set({ price: "861.00", transportFee: "99.00" })
      .where(and(eq(packages.type, "Door to Door"), eq(packages.pax, 3), eq(packages.lessonCount, 4)));

    // 10 Sessions: Total 2160 (1962 + 198)
    await db.update(packages)
      .set({ price: "1962.00", transportFee: "198.00" })
      .where(and(eq(packages.type, "Door to Door"), eq(packages.pax, 3), eq(packages.lessonCount, 10)));

    console.log("D2D A 1v3 prices updated successfully!");
  } catch (error) {
    console.error("Error fixing prices:", error);
  }
}

fixV3Prices();
