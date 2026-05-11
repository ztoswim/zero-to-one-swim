import { db } from "@/db";
import { coaches, students } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Container } from "@/components/Container";
import { FixedScheduleView } from "./FixedScheduleView";

export const dynamic = 'force-dynamic';

async function getData() {
  const coachesData = await db.query.coaches.findMany({
    orderBy: [asc(coaches.name)]
  });
  
  const studentsData = await db.query.students.findMany({
    where: (students, { eq }) => eq(students.status, 'active'),
    with: {
      fixedSlots: true
    }
  });

  // Flatten the data for the view
  const flattenedSlots = studentsData.flatMap(student => 
    student.fixedSlots.map(slot => ({
      id: slot.id,
      name: student.name,
      coachId: slot.coachId,
      classDay: slot.day,
      classTime: slot.time,
      lessonDuration: slot.duration
    }))
  );

  return { 
    coaches: coachesData, 
    slots: flattenedSlots,
    allStudents: studentsData.map(s => ({ id: s.id, name: s.name }))
  };
}

import { getTranslations } from "@/lib/i18n";

export default async function FixedSchedulePage() {
  const data = await getData();
  const dict = await getTranslations();

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {dict.nav.fixedSchedule}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {dict.common.recurringLessons}
          </p>
        </div>
      </div>

      <FixedScheduleView 
        coaches={data.coaches} 
        students={data.slots} 
        allStudents={data.allStudents} 
      />
    </>
  );
}
