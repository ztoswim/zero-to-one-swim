const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function checkTable(tableName) {
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = ${tableName}
    `;
    console.log(`Columns in public.${tableName} table:`, cols.map(c => c.column_name));
  } catch (e) {
    console.error(`Error fetching columns for ${tableName}:`, e);
  }
}

async function run() {
  await checkTable('invoices');
  await checkTable('students');
  await checkTable('coaches');
  await checkTable('packages');
  process.exit();
}

run();
