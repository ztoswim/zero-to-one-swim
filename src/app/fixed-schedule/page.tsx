import { db } from "@/db";
import { coaches, students } from "@/db/schema";
import { asc } from "drizzle-orm";
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

  return { coaches: coachesData, students: flattenedSlots };
}

export default async function FixedSchedulePage() {
  const { coaches, students } = await getData();

  return (
    <main className="py-12 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-6 mb-12">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
          Fixed <span className="text-primary-500">Schedule</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Slot Management & Weekly Overview</p>
      </div>
      
      <FixedScheduleView coaches={coaches} students={students} />
    </main>
  );
}
