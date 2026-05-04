import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Medal, Plus, Mail, Phone } from "lucide-react";

async function getCoaches() {
  try {
    const coaches = await prisma.coach.findMany({
      orderBy: { name: 'asc' }
    });
    return { coaches };
  } catch (e) {
    return { coaches: [], error: "Database connection needed." };
  }
}

export default async function CoachesPage() {
  const data = await getCoaches();

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Academy <span className="text-primary-500">Coaches</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Manage Staff</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2">
            Add Coach <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run Prisma migrations.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in" style={{ animationDelay: '0.1s' }}>
        {data.coaches.map((coach) => (
          <div key={coach.id} className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-900 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <Medal className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
                  style={{ backgroundColor: coach.color || '#3b82f6', '--tw-shadow-color': coach.color || '#3b82f6' } as React.CSSProperties}
                >
                  {coach.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900 leading-none">{coach.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 block">Head Coach</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {coach.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    {coach.phone}
                  </div>
                )}
                {coach.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    {coach.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
