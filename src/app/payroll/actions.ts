'use server';

import { db } from '@/db';
import { invoices, users, coaches, students, packages } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getCurrentUserProfile } from '@/app/staff-access/actions';

export async function getPayrollData() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    throw new Error('Unauthorized');
  }

  const isAdmin = profile.role === 'root' || profile.role === 'course_advisor';
  const isCoach = profile.role === 'coach';

  if (!isAdmin && !isCoach) {
    throw new Error('Unauthorized');
  }

  // Define where clause for filtering
  let condition = undefined;
  if (isCoach && profile.linkedCoachId) {
    condition = eq(invoices.coachId, profile.linkedCoachId);
  }

  // Get invoices with related data
  const allInvoices = await db.query.invoices.findMany({
    where: condition,
    with: {
      student: true,
      coach: true,
      package: true,
      creator: true,
    },
    orderBy: [desc(invoices.createdAt)],
  });

  // For the 'Active Staff' count, we can just get all users if admin,
  // but let's see if we can just return what's needed.
  const allUsers = isAdmin ? await db.select({
    id: users.id,
    email: users.email,
    fullName: users.fullName,
    role: users.role,
  }).from(users) : [];

  return {
    invoices: allInvoices,
    users: isAdmin ? allUsers : [profile]
  };
}
