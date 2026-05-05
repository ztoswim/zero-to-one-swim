const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });
  await client.connect();
  
  const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log('Tables in public schema:');
  res.rows.forEach(row => console.log(`- ${row.table_name}`));
  
  await client.end();
}

main().catch(console.error);
