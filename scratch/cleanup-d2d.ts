import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

async function cleanupAndFix() {
  try {
    // 1. Delete recent duplicates (created in the last 10 minutes)
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    console.log("Cleaning up recent duplicates...");
    await db.delete(packages).where(gt(packages.createdAt, tenMinsAgo));

    // 2. Update existing D2D packages with transport fees
    console.log("Updating transport fees for existing D2D packages...");
    const allPkgs = await db.select().from(packages).where(eq(packages.type, "Door to Door"));
    
    for (const pkg of allPkgs) {
      let fee = "0.00";
      if (pkg.lessonCount === 1) fee = "30.00";
      else if (pkg.lessonCount === 4) fee = "100.00";
      else if (pkg.lessonCount === 10) fee = "200.00";
      
      if (fee !== "0.00") {
        await db.update(packages)
          .set({ transportFee: fee })
          .where(eq(packages.id, pkg.id));
        console.log(`Updated ${pkg.name}: +RM${fee} transport fee`);
      }
    }
    
    console.log("Cleanup and fix completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

cleanupAndFix();
