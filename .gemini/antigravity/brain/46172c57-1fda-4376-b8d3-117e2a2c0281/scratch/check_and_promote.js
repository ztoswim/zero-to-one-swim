const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

// Simple bcrypt-like hashing is not enough for Supabase (it uses Go-based bcrypt)
// But we can use a pre-computed hash for 'Swim888888' if we had one.
// Alternatively, we can use the Supabase Auth API if we find the service key.

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    // Check if user already exists in auth.users
    const check = await client.query("SELECT id FROM auth.users WHERE email = 'xmrxperfectx@gmail.com'");
    if (check.rows.length > 0) {
       console.log('User already exists in auth.users. Promoting...');
       await client.query("INSERT INTO users (id, email, role) VALUES ($1, $2, 'super_admin') ON CONFLICT (id) DO UPDATE SET role = 'super_admin'", [check.rows[0].id, 'xmrxperfectx@gmail.com']);
       console.log('Promotion complete!');
       return;
    }

    // Since manual SQL insertion into auth.users is extremely complex (due to triggers and specific hashing),
    // I will instead try to find the service role key to use the API.
    console.log('User not found. I need to find the Service Role Key to create it via API.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
