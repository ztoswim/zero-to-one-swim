import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Renaming tables and columns...");
  try {
    // Rename tables
    await db.execute(sql`ALTER TABLE venues RENAME TO locations`);
    await db.execute(sql`ALTER TABLE venue_routes RENAME TO location_routes`);
    
    // Rename columns in location_routes
    await db.execute(sql`ALTER TABLE location_routes RENAME COLUMN from_venue_id TO from_location_id`);
    await db.execute(sql`ALTER TABLE location_routes RENAME COLUMN to_venue_id TO to_location_id`);
    
    // Rename column in students
    await db.execute(sql`ALTER TABLE students RENAME COLUMN venue_id TO location_id`);
    
    console.log("Migration successful!");
  } catch (e) {
    console.error("Migration failed:", e);
  }
  process.exit(0);
}

migrate();
