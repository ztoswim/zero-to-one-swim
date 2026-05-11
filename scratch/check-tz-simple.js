const postgres = require('postgres');
require('dotenv').config();

async function check() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    const res = await sql`SHOW TIMEZONE`;
    console.log('Database Timezone:', res);
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

check();
