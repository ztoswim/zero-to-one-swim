import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function promoteFelix() {
  try {
    const result = await db.update(users)
      .set({ role: 'root' })
      .where(eq(users.email, 'xmrxperfectx@gmail.com'))
      .returning();
    
    console.log('--- PROMOTED USER ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

promoteFelix();
