const { db } = require('./src/db');
const { students } = require('./src/db/schema');

async function listVenues() {
  const allStudents = await db.query.students.findMany();
  const venues = [...new Set(allStudents.map(s => s.venueInfo).filter(Boolean))];
  console.log('--- FOUND VENUES ---');
  venues.forEach(v => console.log(v));
  process.exit(0);
}

listVenues();
