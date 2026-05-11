import * as dotenv from "dotenv";
dotenv.config();
import { db } from "../src/db";
import { students } from "../src/db/schema";
import { isNull, eq, or } from "drizzle-orm";

async function fixStudentStatus() {
  console.log("Fixing student status...");
  
  const results = await db.update(students)
    .set({ status: 'active' })
    .where(
      or(
        isNull(students.status),
        eq(students.status, "")
      )
    )
    .returning();
    
  console.log(`Updated ${results.length} students to 'active'.`);
  results.forEach(s => console.log(`- ${s.name}`));
  
  process.exit(0);
}

fixStudentStatus().catch(console.error);
