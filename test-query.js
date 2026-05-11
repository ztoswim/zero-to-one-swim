const postgres = require('postgres');
require('dotenv').config();

async function testQuery() {
  const userId = '119a87fa-f538-4696-83e0-4f9709096ec3';
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
  try {
    console.log(`Testing query for userId: ${userId} ...`);
    const result = await sql`
      select "id", "email", "full_name", "phone", "role", "permissions", "linked_coach_id", "linked_admin_id", "created_at" 
      from "users" 
      where "id" = ${userId}
      limit 1;
    `;
    console.log('Query successful!');
    if (result.length > 0) {
      console.log('User found:', JSON.stringify(result[0], null, 2));
    } else {
      console.log('User NOT found, but query worked.');
    }
  } catch (err) {
    console.error('QUERY FAILED:');
    console.error(err.message);
    console.error('Full error details:', JSON.stringify(err, null, 2));
  } finally {
    await sql.end();
  }
}

testQuery();
