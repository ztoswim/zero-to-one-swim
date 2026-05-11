const { db } = require('./src/db');
const { sql } = require('drizzle-orm');

async function check() {
  try {
    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log("Tables in public schema:", tables.rows);
    
    const coachesCols = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'coaches'`);
    console.log("Coaches columns:", coachesCols.rows);
    
    const studentsCols = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'students'`);
    console.log("Students columns:", studentsCols.rows);
  } catch (e) {
    console.error("Query failed:", e.message);
  }
  process.exit();
}

check();
