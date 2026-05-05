'use client';

import React, { useState, useMemo } from 'react';
import { Container } from '@/components/Container';
import { Calendar, User, Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle, Search } from 'lucide-react';

interface Coach {
  id: string;
  name: string;
  color: string;
}

interface Student {
  id: string;
  name: string;
  coachId: string | null;
  classDay: string | null;
  classTime: string | null;
  lessonDuration: number | null;
}

interface FixedScheduleViewProps {
  coaches: Coach[];
  students: Student[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

export function FixedScheduleView({ coaches, students }: FixedScheduleViewProps) {
  const [selectedCoachId, setSelectedCoachId] = useState<string>(coaches[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCoach = coaches.find(c => c.id === selectedCoachId);

  // Filter and parse students for the current view
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => s.coachId === selectedCoachId && s.classDay === selectedDay)
      .map(s => {
        const [hour, minute] = (s.classTime || '00:00').split(':').map(Number);
        const startMinutes = hour * 60 + minute;
        const endMinutes = startMinutes + (s.lessonDuration || 45);
        return { ...s, startMinutes, endMinutes };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [students, selectedCoachId, selectedDay]);

  // Check for overlaps
  const studentWithConflicts = useMemo(() => {
    return filteredStudents.map((s, index) => {
      const hasOverlap = filteredStudents.some((other, otherIndex) => {
        if (index === otherIndex) return false;
        return (
          (s.startMinutes >= other.startMinutes && s.startMinutes < other.endMinutes) ||
          (other.startMinutes >= s.startMinutes && other.startMinutes < s.endMinutes)
        );
      });
      return { ...s, hasOverlap };
    });
  }, [filteredStudents]);

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Coach Selector */}
        <div className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Academy Coaches</h3>
            <div className="space-y-2">
              {coaches.map(coach => (
                <button
                  key={coach.id}
                  onClick={() => setSelectedCoachId(coach.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    selectedCoachId === coach.id 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${
                      selectedCoachId === coach.id ? 'border-white/20 bg-white/10' : 'border-transparent'
                    }`}
                    style={selectedCoachId !== coach.id ? { backgroundColor: coach.color } : {}}
                  >
                    {selectedCoachId !== coach.id ? coach.name.charAt(0) : <User className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <div className={`font-black text-sm leading-none ${selectedCoachId === coach.id ? 'text-white' : 'text-gray-900'}`}>
                      {coach.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Schedule */}
        <div className="flex-1 space-y-6">
          {/* Day Selector Tabs */}
          <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-gray-100 flex overflow-x-auto no-scrollbar">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[100px] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedDay === day 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Time Grid */}
          <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden min-h-[600px] relative">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedDay} Schedule</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Fixed slots for {selectedCoach?.name}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Find student..." 
                  className="bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 ring-primary-100 outline-none w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 relative">
              {/* Vertical Time Indicator Lines */}
              <div className="absolute left-[100px] right-8 top-8 bottom-8 pointer-events-none">
                {TIME_SLOTS.map(h => (
                  <div key={h} className="h-[60px] border-b border-gray-50 relative">
                    <span className="absolute -left-16 top-[-10px] text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                      {h % 12 || 12} {h >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Student Blocks Area */}
              <div className="relative ml-[68px] min-h-[960px]">
                {studentWithConflicts
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((student, i) => {
                  const top = (student.startMinutes - 7 * 60) * (60 / 60); // 1px per minute
                  const height = student.lessonDuration || 45;
                  
                  return (
                    <div 
                      key={student.id}
                      className={`absolute left-0 right-0 rounded-2xl border-2 p-4 transition-all hover:scale-[1.01] hover:shadow-xl z-10 ${
                        student.hasOverlap 
                          ? 'bg-red-50 border-red-200 shadow-lg shadow-red-100' 
                          : 'bg-white border-gray-100 shadow-sm'
                      }`}
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        marginTop: '8px'
                      }}
                    >
                      <div className="flex items-center justify-between h-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${student.hasOverlap ? 'bg-red-500 text-white' : 'bg-primary-50 text-primary-500'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-black text-sm leading-tight ${student.hasOverlap ? 'text-red-900' : 'text-gray-900'}`}>
                              {student.name}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatTime(student.startMinutes)} - {formatTime(student.endMinutes)}
                              </span>
                              {student.hasOverlap && (
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Conflict Detected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {studentWithConflicts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-300">
                    <Calendar className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-black text-xl tracking-tighter opacity-50">No students scheduled</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-30 mt-2">Free slots available all day</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
