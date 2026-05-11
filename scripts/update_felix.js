const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Updating Felix user profile...');
    
    const result = await sql`
      UPDATE users 
      SET role = 'root', full_name = 'FELIX'
      WHERE id = '119a87fa-f538-4696-83e0-4f9709096ec3'
      RETURNING *
    `;
    
    console.log('Update result:', result);
    console.log('FELIX is now Root.');
  } catch (e) {
    console.error('Update failed:', e);
  } finally {
    process.exit();
  }
}

run();
