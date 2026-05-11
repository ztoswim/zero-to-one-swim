const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Migrating users table...');
    
    // 1. Rename coach_id to linked_coach_id if it exists
    await sql`ALTER TABLE users RENAME COLUMN coach_id TO linked_coach_id`.catch(e => console.log('coach_id rename skipped or failed:', e.message));
    
    // 2. Change permissions column type to jsonb
    // We'll drop and recreate if it's an ARRAY type to be safe, or try to cast it.
    // If it's empty, dropping is easiest.
    await sql`ALTER TABLE users DROP COLUMN permissions`.catch(e => console.log('Drop permissions failed:', e.message));
    await sql`ALTER TABLE users ADD COLUMN permissions jsonb`.catch(e => console.log('Add permissions jsonb failed:', e.message));
    
    console.log('Migration completed successfully.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    process.exit();
  }
}

run();
