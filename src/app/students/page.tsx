import { Container } from "@/components/Container";
import { db } from "@/db";
import { students as studentsSchema, locations as locationsSchema, coaches as coachesSchema } from "@/db/schema";
import { desc, eq, asc } from "drizzle-orm";
import { Users, UserPlus, Phone, MapPin, Pencil, Trash2 } from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUserProfile } from "@/app/staff-access/actions";

import { AddStudentDialog } from "./AddStudentDialog";
import { StudentsListClient } from "./StudentsListClient";

import { getTranslations } from "@/lib/i18n";

export const dynamic = 'force-dynamic';

async function getInitialData() {
  try {
    const studentsData = await db.query.students.findMany({
      with: {
        location: true,
        fixedSlots: true,
      },
      orderBy: [desc(studentsSchema.createdAt)]
    });

    const locationsData = await db.select().from(locationsSchema).orderBy(asc(locationsSchema.name));
    const coachesData = await db.select().from(coachesSchema).orderBy(asc(coachesSchema.name));
    
    return { students: studentsData, locations: locationsData, coaches: coachesData };
  } catch (error: any) {
    console.error("Failed to fetch students data:", error);
    throw error;
  }
}

export default async function StudentsPage() {
  const [data, user, dict] = await Promise.all([
    getInitialData(),
    getCurrentUserProfile(),
    getTranslations()
  ]);

  const canCreate = hasPermission(user, 'create_student');
  const canEdit = hasPermission(user, 'edit_student');
  const canDelete = hasPermission(user, 'delete_student');

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {dict.nav.students}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {dict.common.manageRoster}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {canCreate && <AddStudentDialog coaches={data.coaches} locations={data.locations} />}
        </div>
      </div>

      <StudentsListClient 
        students={data.students}
        locations={data.locations}
        coaches={data.coaches}
        canEdit={canEdit}
        canDelete={canDelete}
        dict={dict}
      />
    </>
  );
}

