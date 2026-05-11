import { db } from "../src/db";
import { users } from "../src/db/schema";

async function checkUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log('--- ALL USERS ---');
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

checkUsers();
