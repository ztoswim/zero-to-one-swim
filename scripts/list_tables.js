const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();
