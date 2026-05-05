const postgres = require('postgres');
require('dotenv').config();

const sql_conn = postgres(process.env.DIRECT_URL);

async function sync() {
  try {
    console.log("Adding columns to coaches...");
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS nickname text`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS gender text`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS ic text`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS cost numeric(10, 2) DEFAULT '50.00'`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS bank_name text`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS bank_account text`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS emergency_name text`;
    await sql_conn`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS emergency_phone text`;

    console.log("Adding columns to students...");
    await sql_conn`ALTER TABLE students ADD COLUMN IF NOT EXISTS email text`;
    await sql_conn`ALTER TABLE students ADD COLUMN IF NOT EXISTS same_area text`;
    await sql_conn`ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_name text`;
    await sql_conn`ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_phone text`;
    await sql_conn`ALTER TABLE students ADD COLUMN IF NOT EXISTS notes text`;
    
    console.log("Checking emergency_contact column...");
    const cols = await sql_conn`SELECT column_name FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'emergency_contact'`;
    if (cols.length > 0) {
        console.log("Dropping emergency_contact from students...");
        await sql_conn`ALTER TABLE students DROP COLUMN emergency_contact`;
    }

    console.log("Database synced successfully!");
  } catch (e) {
    console.error("Sync failed:", e.message);
  }
  process.exit();
}

sync();
