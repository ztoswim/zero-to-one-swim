import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Users, UserPlus, Phone, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { created_at: 'desc' }
    });
    return { students };
  } catch (e) {
    return { students: [], error: "Database connection needed." };
  }
}

export default async function StudentsPage() {
  const data = await getStudents();

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
          <button className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2">
            Add Student <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run Prisma migrations.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in" style={{ animationDelay: '0.1s' }}>
        {data.students.map((student: any) => (
          <div key={student.id} className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center font-black text-xl">
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-gray-900 leading-none">{student.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${student.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {student.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {student.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {student.phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
