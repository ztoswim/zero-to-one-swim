const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Adding created_by to invoices table...');
    await sql`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id)
    `;
    console.log('Successfully added created_by column to invoices.');
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    process.exit();
  }
}

run();
