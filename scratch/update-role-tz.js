const postgres = require('postgres');
require('dotenv').config();

async function updateTz() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql`ALTER ROLE postgres SET timezone TO 'Asia/Kuala_Lumpur'`;
    console.log('✅ Role timezone updated to Asia/Kuala_Lumpur');
    
    // Check session
    await sql`SET timezone TO 'Asia/Kuala_Lumpur'`; // Force for this session too
    const res = await sql`SHOW TIMEZONE`;
    console.log('📊 Current Session Timezone:', res);
  } catch (e) {
    console.error('❌ Failed to update role timezone:', e);
  } finally {
    await sql.end();
  }
}

updateTz();
