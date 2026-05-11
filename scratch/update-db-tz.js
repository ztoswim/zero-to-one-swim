const postgres = require('postgres');
require('dotenv').config();

async function updateTz() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql`ALTER DATABASE postgres SET timezone TO 'Asia/Kuala_Lumpur'`;
    console.log('✅ Database timezone updated to Asia/Kuala_Lumpur');
    
    // Verify
    const res = await sql`SHOW TIMEZONE`;
    console.log('📊 Current Timezone:', res);
  } catch (e) {
    console.error('❌ Failed to update timezone:', e);
  } finally {
    await sql.end();
  }
}

updateTz();
