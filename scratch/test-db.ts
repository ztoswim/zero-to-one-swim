import { db } from "../src/db/index";
import { users } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function test() {
  try {
    console.log("Testing connection...");
    const result = await db.execute(sql`SELECT 1`);
    console.log("Connection successful:", result);
    
    console.log("Testing users table...");
    const allUsers = await db.select().from(users);
    console.log("Users count:", allUsers.length);
  } catch (e) {
    console.error("TEST FAILED:", e);
  }
}

test();
