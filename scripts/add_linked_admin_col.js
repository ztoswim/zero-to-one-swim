const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Adding linked_admin_id to users table...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS linked_admin_id UUID REFERENCES admins(id)
    `;
    console.log('Successfully added linked_admin_id column.');
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    process.exit();
  }
}

run();
