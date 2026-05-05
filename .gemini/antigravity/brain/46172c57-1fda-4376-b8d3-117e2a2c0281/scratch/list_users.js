const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query('SELECT id, email, role FROM users');
    console.log('Current Users:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
