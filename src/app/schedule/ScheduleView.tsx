'use client';

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, User, X, Check, AlertCircle } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ScheduleViewProps {
  initialLessons: any[];
  coaches: any[];
  students: any[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  initialLessons, 
  coaches, 
  students 
}) => {
  const { t, locale } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [filterCoach, setFilterCoach] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Generate 15 days range (7 back, 7 forward)
  const days = useMemo(() => {
    const arr: string[] = [];
    const base = new Date(selectedDay);
    for (let i = -7; i <= 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, [selectedDay]);

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateStr: string) => {
    return dateStr.split('-')[2];
  };

  const filteredGroups = useMemo(() => {
    const list = initialLessons.filter(l => 
      l.date === selectedDay && (!filterCoach || l.coachId === filterCoach)
    );
    
    const groups: Record<string, any> = {};
    list.forEach(l => {
      const key = `${l.time}_${l.coachId}`;
      if (!groups[key]) {
        groups[key] = {
          time: l.time,
          coachId: l.coachId,
          coach: l.coach,
          lessons: []
        };
      }
      groups[key].lessons.push(l);
    });
    
    return Object.values(groups).sort((a, b) => a.time.localeCompare(b.time));
  }, [initialLessons, selectedDay, filterCoach]);

  const openLesson = (l: any) => {
    setSelectedLesson(l);
    setShowDetail(true);
  };

  return (
    <div className="space-y-10">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3 animate-in">
        <div className="flex items-center bg-white border-2 border-gray-100 rounded-2xl px-4 py-1 shadow-sm focus-within:border-primary-500 transition-all">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
          <WheelDateInput 
            value={selectedDay} 
            onChange={setSelectedDay} 
            className="border-0 shadow-none !bg-transparent h-10 w-32 text-xs" 
          />
        </div>
        <div 
          onClick={() => setFilterCoach('')}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border-2 whitespace-nowrap shadow-xl ${filterCoach === '' ? 'bg-primary-500 text-white border-primary-500 shadow-primary-200' : 'bg-white text-slate-400 border-slate-200 shadow-slate-100 hover:border-primary-200'}`}
        >
          {t('common.allCoaches')}
        </div>
        {coaches.map(c => (
          <div 
            key={c.id}
            onClick={() => setFilterCoach(c.id)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border-2 whitespace-nowrap shadow-xl ${filterCoach === c.id ? 'bg-primary-500 text-white border-primary-500 shadow-primary-200' : 'bg-white text-slate-400 border-slate-200 shadow-slate-100 hover:border-primary-200'}`}
          >
            {c.name}
          </div>
        ))}
      </div>

      {/* Date Rail */}
      <div className="flex items-center justify-center mb-10 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 pt-4 pb-6 -mx-4 px-4 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 justify-center flex-nowrap px-10">
          {days.map(day => (
            <div 
              key={day} 
              onClick={() => setSelectedDay(day)}
              className={`min-w-[110px] md:min-w-[120px] p-6 rounded-[2.5rem] flex flex-col items-center gap-2 transition-all cursor-pointer border-2 ${selectedDay === day ? 'bg-white border-primary-500 shadow-2xl shadow-primary-100 -translate-y-2' : 'bg-white/50 border-slate-100 text-slate-400 hover:bg-white'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{getDayName(day)}</span>
              <span className={`text-3xl font-black tracking-tighter ${selectedDay === day ? 'text-gray-900' : 'text-gray-400'}`}>{getDayNumber(day)}</span>
              {initialLessons.some(l => l.date === day) && (
                <div className="flex gap-1 mt-1">
                  <span className={`w-2 h-2 rounded-full ${selectedDay === day ? 'bg-primary-500' : 'bg-gray-200'}`}></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Day View */}
      <div className="animate-in">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-[2.5rem] bg-primary-500 text-white flex flex-col items-center justify-center shadow-2xl shadow-primary-200">
             <span className="text-xs font-black uppercase tracking-widest opacity-60">{getDayName(selectedDay)}</span>
             <span className="text-3xl font-black tracking-tighter">{getDayNumber(selectedDay)}</span>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{selectedDay}</h2>
            <p className="text-xs font-black text-primary-500 uppercase tracking-[0.3em] mt-1">{filteredGroups.length} {t('common.timeSlotsScheduled')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredGroups.map((group) => (
            <div 
              key={`${group.time}_${group.coachId}`} 
              className="group relative bg-white rounded-[3.5rem] p-8 border-2 border-slate-200 shadow-2xl shadow-slate-200/60 hover:shadow-primary-100/50 transition-all duration-500 flex flex-col md:flex-row md:items-center gap-10"
            >
              <div className="md:w-40 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-gray-50 pb-6 md:pb-0 md:pr-10">
                <div className="text-3xl font-black text-gray-900 group-hover:text-primary-600 transition-colors tracking-tighter mb-2">{group.time}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.coach?.name}</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.lessons.map((l: any) => (
                    <div 
                      key={l.id} 
                      onClick={() => openLesson(l)}
                      className="p-6 bg-gray-50/50 hover:bg-primary-50 rounded-[2.5rem] border border-transparent hover:border-primary-100 transition-all cursor-pointer flex items-center gap-4 group/card"
                    >
                      <div className="w-14 h-14 rounded-[1.5rem] bg-white flex items-center justify-center text-gray-400 shadow-sm group-hover/card:scale-110 transition-transform">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg tracking-tight mb-1">{l.student?.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase inline-block w-fit ${l.status === 'completed' ? 'bg-green-100 text-green-600' : (l.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600')}`}>
                          {t(`common.${l.status}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100 animate-in">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                <CalendarIcon className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">{t('common.noLessons')}</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('common.noLessonsDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Detail Modal */}
      {showDetail && selectedLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border-2 border-slate-200 animate-in p-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">{t('common.lessonDetail')}</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('common.manageSessionStatus')}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-8 mb-10">
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm">
                  <User className="w-8 h-8 text-primary-500" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight">{selectedLesson.student?.name}</h4>
                  <p className="text-sm font-bold text-gray-500">{selectedLesson.time} - {selectedLesson.coach?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('common.updateStatus')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-6 bg-green-50 border-2 border-green-100 rounded-[2rem] hover:bg-green-100 transition-all group">
                    <Check className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-green-600 text-xs uppercase tracking-widest">{t('common.completed')}</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-6 bg-orange-50 border-2 border-orange-100 rounded-[2rem] hover:bg-orange-100 transition-all group">
                    <AlertCircle className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-orange-600 text-xs uppercase tracking-widest">{t('common.postpone')}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn w-full py-5 border-2 border-gray-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50">{t('common.cancelSession')}</button>
              <button className="btn btn-primary w-full py-5 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-200">{t('common.saveChanges')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
