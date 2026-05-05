const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    const res = await client.query("UPDATE users SET role = 'super_admin' WHERE email = 'xmrxperfectx@gmail.com' RETURNING *");
    console.log('Update Success:', res.rows);
  } catch (err) {
    console.error('Update Error:', err);
  } finally {
    await client.end();
  }
}

run();
