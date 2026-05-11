const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    console.log('Columns in public.users table:', cols);
  } catch (e) {
    console.error('Error fetching columns:', e);
  } finally {
    process.exit();
  }
}

run();
