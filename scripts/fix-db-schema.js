require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DIRECT_URL);

async function fixSchema() {
  console.log('🚀 Running database schema fixes...');
  
  try {
    // 1. Add pax column if it doesn't exist
    await sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS pax INTEGER DEFAULT 1;`;
    console.log('✅ Added pax column.');

    // 2. Drop duration column if it exists
    await sql`ALTER TABLE packages DROP COLUMN IF EXISTS duration;`;
    console.log('✅ Dropped duration column.');

    console.log('✅ Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await sql.end();
  }
}

fixSchema();
