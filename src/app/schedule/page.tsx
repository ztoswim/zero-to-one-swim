import { Container } from "@/components/Container";
import { db } from "@/db";
import { lessons, coaches, students } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { ScheduleView } from "./ScheduleView";

import { getTranslations } from "@/lib/i18n";

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
  const dict = await getTranslations();

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {dict.nav.schedule}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {dict.common.upcomingPast}
          </p>
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
    </>
  );
}
