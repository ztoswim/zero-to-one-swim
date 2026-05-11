const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL);

async function run() {
  try {
    await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS start_date date`;
    await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS lesson_duration integer DEFAULT 45`;
    console.log("Database updated successfully");
  } catch (e) {
    console.error("Update failed:", e.message);
  }
  process.exit();
}

run();
