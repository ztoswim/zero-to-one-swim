import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";

async function checkPackages() {
  try {
    const allPackages = await db.select().from(packages);
    console.log("Current Packages in Database:");
    console.table(allPackages.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      pax: p.pax,
      lessonCount: p.lessonCount,
      price: p.price
    })));
  } catch (error) {
    console.error("Error fetching packages:", error);
  }
}

checkPackages();
