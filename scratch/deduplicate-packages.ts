import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function deduplicatePackages() {
  try {
    console.log("Starting aggressive deduplication...");

    // Find groups of duplicates
    const allPackages = await db.select().from(packages);
    const seen = new Set();
    const toDelete = [];

    for (const pkg of allPackages) {
      // Create a unique key for each package based on its core properties
      const key = `${pkg.name}-${pkg.pax}-${pkg.lessonCount}-${pkg.price}-${pkg.transportFee}`;
      
      if (seen.has(key)) {
        toDelete.push(pkg.id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicates. Deleting...`);
      for (const id of toDelete) {
        await db.delete(packages).where(eq(packages.id, id));
      }
      console.log("Duplicates deleted successfully!");
    } else {
      console.log("No duplicates found.");
    }

  } catch (error) {
    console.error("Error during deduplication:", error);
  }
}

deduplicatePackages();
