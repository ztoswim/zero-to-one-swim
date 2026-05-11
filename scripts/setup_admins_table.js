const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Creating admins table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        nickname TEXT,
        gender TEXT,
        dob DATE,
        ic TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        join_date DATE,
        bank_name TEXT,
        bank_account TEXT,
        emergency_name TEXT,
        emergency_phone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('Admins table created or already exists.');

    console.log('Adding linked_admin_id to users table...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS linked_admin_id UUID REFERENCES admins(id)
    `;
    console.log('Successfully updated users table.');

  } catch (e) {
    console.error('Error during database update:', e);
  } finally {
    process.exit();
  }
}

run();
