import { db } from "../src/db";
import { coaches, locations, students } from "../src/db/schema";

async function main() {
  const allCoaches = await db.select().from(coaches);
  const allLocations = await db.select().from(locations);
  const allStudents = await db.select().from(students);

  console.log("--- COACHES ---");
  allCoaches.forEach(c => console.log(`${c.id}: ${c.name}`));
  
  console.log("\n--- LOCATIONS ---");
  allLocations.forEach(l => console.log(`${l.id}: ${l.name}`));

  console.log("\n--- STUDENTS ---");
  allStudents.forEach(s => console.log(`${s.id}: ${s.name}`));
}

main().catch(console.error);
