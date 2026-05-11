import { db } from "../src/db";

async function listLocations() {
  try {
    const allStudents = await db.query.students.findMany({
      with: {
        location: true
      }
    });
    const locations = [...new Set(allStudents.map(s => (s as any).location?.name).filter(Boolean))];
    console.log('--- FOUND LOCATIONS ---');
    locations.forEach(v => console.log(v));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

listLocations();
