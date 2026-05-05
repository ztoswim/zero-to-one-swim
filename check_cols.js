const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL);

async function run() {
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'students'`;
  console.log(cols.map(c => c.column_name));
  process.exit();
}

run();
