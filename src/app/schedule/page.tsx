import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getSchedule() {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lessons = await prisma.lesson.findMany({
      where: {
        date: {
          gte: today,
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      include: {
        student: true,
        coach: true,
      },
      take: 20
    });
    return { lessons };
  } catch (e) {
    return { lessons: [], error: "Database connection needed." };
  }
}

export default async function SchedulePage() {
  const data = await getSchedule();

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Class <span className="text-primary-500">Schedule</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Upcoming Sessions</p>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run Prisma migrations.
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="space-y-4">
          {data.lessons.length === 0 && !data.error && (
            <div className="text-center py-12 text-gray-400 font-bold">No upcoming classes scheduled.</div>
          )}
          {data.lessons.map((lesson: any) => (
            <div key={lesson.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-primary-100 hover:bg-primary-50/30 transition-all gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center w-16">
                  <div className="text-sm font-black text-primary-500 uppercase tracking-widest">{lesson.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-2xl font-black text-gray-900 leading-none mt-1">{lesson.date.getDate()}</div>
                </div>
                <div className="w-px h-12 bg-gray-100 hidden md:block"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{lesson.time}</span>
                    <span className="text-xs font-bold text-gray-400 ml-2">({lesson.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <User className="w-4 h-4" /> {lesson.student?.name || 'Unknown Student'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coach</span>
                  <span className="font-bold text-gray-900">{lesson.coach?.name || 'Unassigned'}</span>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md"
                  style={{ backgroundColor: lesson.coach?.color || '#3b82f6' }}
                >
                  {lesson.coach?.name?.charAt(0) || '?'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
