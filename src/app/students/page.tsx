import { Container } from "@/components/Container";
import { db } from "@/db";
import { students } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Users, UserPlus, Phone, MapPin } from "lucide-react";

import { AddStudentDialog } from "./AddStudentDialog";
import { coaches, venues as venuesSchema } from "@/db/schema";

export const dynamic = 'force-dynamic';

async function getInitialData() {
  const studentsData = await db.query.students.findMany({
    orderBy: [desc(students.createdAt)],
    with: {
      venue: true
    }
  });
  const coachesData = await db.query.coaches.findMany();
  const venuesData = await db.query.venues.findMany();
  return { students: studentsData, coaches: coachesData, venues: venuesData };
}

export default async function StudentsPage() {
  const data = await getInitialData();

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Academy <span className="text-primary-500">Students</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Manage Roster</p>
        </div>
        <div className="flex items-center gap-4">
          <AddStudentDialog coaches={data.coaches} venues={data.venues} />
        </div>
      </div>


      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Information</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent / Contact</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lesson Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.students.map((student: any) => (
                <tr key={student.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center font-black text-lg shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-base leading-none mb-1">{student.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {student.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-600">{student.parentName || 'No Parent Name'}</div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <Phone className="w-3 h-3" /> {student.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        {student.venue?.name || student.venueInfo || 'General Venue'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        Duration: {student.lessonDuration || '45'} mins
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${student.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {student.status}
                      </span>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block ml-0.5">
                        Since: {student.startDate || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-all">
                      <Users className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
