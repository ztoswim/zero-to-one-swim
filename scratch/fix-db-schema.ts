import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function fixDatabaseSchema() {
  try {
    console.log("Adding transport_fee column to packages table...");
    await db.execute(sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS transport_fee DECIMAL(10, 2) DEFAULT '0.00'`);
    
    console.log("Adding transport_fee column to invoices table...");
    await db.execute(sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transport_fee DECIMAL(10, 2) DEFAULT '0.00'`);
    
    console.log("Database schema fixed successfully!");
  } catch (error) {
    console.error("Error fixing database schema:", error);
  }
}

fixDatabaseSchema();
