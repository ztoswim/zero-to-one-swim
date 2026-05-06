const postgres = require('postgres');
const sql = postgres("postgresql://postgres:5ktOo4Z78aOa1GjK@db.oboozzgxwqowqahutwas.supabase.co:5432/postgres");

async function fix() {
  try {
    console.log('Adding google_embed_code column...');
    await sql`ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_embed_code text;`;
    
    console.log('Adding waze_embed_code column...');
    await sql`ALTER TABLE venues ADD COLUMN IF NOT EXISTS waze_embed_code text;`;
    
    console.log('Database updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating database:', err);
    process.exit(1);
  }
}

fix();
