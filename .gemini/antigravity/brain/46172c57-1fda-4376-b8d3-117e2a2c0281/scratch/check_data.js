const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });
  await client.connect();
  
  const tables = ['lessons', 'invoices', 'students', 'coaches', 'packages'];
  for (const table of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`${table}: ${res.rows[0].count} rows`);
  }
  
  await client.end();
}

main().catch(console.error);
