const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL);

async function run() {
  try {
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS dob date`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS address text`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS level text`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS join_date date`;
    console.log("Database updated successfully");
  } catch (e) {
    console.error("Update failed:", e.message);
  }
  process.exit();
}

run();
