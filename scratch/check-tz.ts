import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function checkTimezone() {
  try {
    const result = await db.execute(sql`SHOW TIMEZONE`);
    console.log('Database Timezone:', result);
  } catch (err) {
    console.error('Error fetching timezone:', err);
  }
}

checkTimezone();
