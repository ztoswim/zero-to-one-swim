import { Container } from "@/components/Container";
import { db } from "@/db";
import { lessons, coaches, students } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { ScheduleView } from "./ScheduleView";

export const dynamic = 'force-dynamic';

async function getScheduleData() {
  try {
    const lessonsData = await db.query.lessons.findMany({
      orderBy: [
        asc(lessons.date),
        asc(lessons.time)
      ],
      with: {
        student: true,
        coach: true,
      }
    });

    const coachesData = await db.query.coaches.findMany();
    const studentsData = await db.query.students.findMany();

    return { 
      lessons: lessonsData,
      coaches: coachesData,
      students: studentsData
    };
  } catch (e) {
    console.error(e);
    return { lessons: [], coaches: [], students: [], error: "Database connection needed." };
  }
}

export default async function SchedulePage() {
  const data = await getScheduleData();

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Lesson <span className="text-primary-500">Schedule</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Manage upcoming and past sessions</p>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run database push.
        </div>
      )}

      <ScheduleView 
        initialLessons={data.lessons} 
        coaches={data.coaches} 
        students={data.students} 
      />
    </Container>
  );
}
