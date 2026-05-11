const postgres = require('postgres');
require('dotenv').config();

async function checkColumns() {
  const sql = postgres(process.env.DIRECT_URL, { ssl: 'require' });
  try {
    const columns = await sql`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY table_schema;
    `;
    console.log('Columns for table "users":');
    columns.forEach(col => {
      console.log(`- [${col.table_schema}] ${col.column_name} (${col.data_type})`);
    });
  } catch (err) {
    console.error('Error checking columns:', err);
  } finally {
    await sql.end();
  }
}

checkColumns();
