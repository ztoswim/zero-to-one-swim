const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    // 1. Try to find the user in auth.users
    const authRes = await client.query("SELECT id FROM auth.users WHERE email = 'xmrxperfectx@gmail.com'");
    
    if (authRes.rows.length === 0) {
      console.error('User not found in auth.users. Please make sure you have signed up/logged in first.');
      return;
    }
    
    const userId = authRes.rows[0].id;
    
    // 2. Insert or Update in public.users
    const upsertRes = await client.query(`
      INSERT INTO users (id, email, role) 
      VALUES ($1, $2, 'super_admin')
      ON CONFLICT (id) DO UPDATE SET role = 'super_admin'
      RETURNING *
    `, [userId, 'xmrxperfectx@gmail.com']);
    
    console.log('Successfully promoted user to super_admin:', upsertRes.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
