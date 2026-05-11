import { db } from "../src/db";
import { locations } from "../src/db/schema";

async function checkLocations() {
  try {
    const allLocations = await db.select().from(locations);
    console.log('--- ALL LOCATIONS ---');
    console.log(JSON.stringify(allLocations, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

checkLocations();
