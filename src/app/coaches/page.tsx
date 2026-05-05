import { Container } from "@/components/Container";
import { db } from "@/db";
import { coaches } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Medal, Plus, Mail, Phone } from "lucide-react";

import { AddCoachDialog } from "./AddCoachDialog";

export const dynamic = 'force-dynamic';

async function getCoaches() {
  const data = await db.query.coaches.findMany({
    orderBy: [asc(coaches.name)]
  });
  return { coaches: data };
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
          <AddCoachDialog />
        </div>
      </div>


      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Coach Information</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.coaches.map((coach: any) => (
                <tr key={coach.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg shrink-0"
                        style={{ backgroundColor: coach.color || '#3b82f6' }}
                      >
                        {coach.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-base leading-none mb-1">{coach.name}</div>
                        <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{coach.nickname || 'No Nickname'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-300" />
                        {coach.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                        <Mail className="w-3.5 h-3.5 text-gray-300" />
                        {coach.email || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-1">
                        {coach.level || 'Junior'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        Joined: {coach.joinDate || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <div className="text-sm font-black text-gray-900">RM {coach.cost || '0.00'}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Per Session</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-all">
                      <Plus className="w-5 h-5 rotate-45" />
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
