import { db } from "../src/db";
import { students } from "../src/db/schema";

async function listVenues() {
  try {
    const allStudents = await db.query.students.findMany();
    const venues = [...new Set(allStudents.map(s => s.venueInfo).filter(Boolean))];
    console.log('--- FOUND VENUES ---');
    venues.forEach(v => console.log(v));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

listVenues();
