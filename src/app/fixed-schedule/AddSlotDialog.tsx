'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, User, Clock, Check, Loader2 } from 'lucide-react';
import { WheelTimeInput } from '@/components/WheelTimeInput';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { addFixedSlotAction } from './actions';

interface AddSlotDialogProps {
  coaches: any[];
  students: any[];
  selectedCoachId: string;
  selectedDay: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddSlotDialog({ 
  coaches, 
  students, 
  selectedCoachId, 
  selectedDay, 
  isOpen, 
  onClose 
}: AddSlotDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState('08:00');
  const [duration, setDuration] = useState(45);
  const [studentId, setStudentId] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append('time', time);
    
    const result = await addFixedSlotAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
      // Reload is handled by revalidatePath, but we might need a local refresh
      window.location.reload();
    }
  }

  const handleSelectWheel = (e: React.WheelEvent<HTMLSelectElement>, onChange: (val: string) => void) => {
    e.preventDefault();
    const select = e.currentTarget;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(select.options.length - 1, select.selectedIndex + delta));
    if (newIndex !== select.selectedIndex) {
      onChange(select.options[newIndex].value);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('fixedSchedule.addSlot')}>
      <form onSubmit={handleSubmit} className="bg-gray-100/30 -m-8 p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border-2 border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
              {t('fixedSchedule.selectStudent')}
            </label>
            <div className="relative">
              <select 
                name="studentId" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onWheel={(e) => handleSelectWheel(e, (val) => setStudentId(val))}
                required 
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none focus:border-primary-500 transition-all text-sm"
              >
                <option value="">{t('common.select')}</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Day Selection (Pre-selected) */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
                {t('students.classDay')}
              </label>
              <div className="relative">
                <select 
                  name="day" 
                  defaultValue={selectedDay} 
                  required 
                  onWheel={(e) => handleSelectWheel(e, (val) => e.currentTarget.value = val)}
                  className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none focus:border-primary-500 transition-all text-sm"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{t(`days.${d}`)}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
              </div>
            </div>

            {/* Coach Selection (Pre-selected) */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
                {t('students.assignCoach')}
              </label>
              <div className="relative">
                <select 
                  name="coachId" 
                  defaultValue={selectedCoachId} 
                  required 
                  onWheel={(e) => handleSelectWheel(e, (val) => e.currentTarget.value = val)}
                  className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none focus:border-primary-500 transition-all text-sm"
                >
                  <option value="">{t('students.selectCoach')}</option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
                {t('students.startTime')}
              </label>
              <WheelTimeInput value={time} onChange={setTime} className="!py-4 !border-slate-200" />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
                {t('students.durationMin')}
              </label>
              <input 
                name="duration"
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? -5 : 5;
                  setDuration(prev => Math.max(0, prev + delta));
                }}
                required 
                step="5" 
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-primary-500 transition-all text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-primary-500 text-white rounded-2xl font-black text-lg tracking-tighter shadow-xl shadow-primary-200 flex items-center justify-center gap-3 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
            {loading ? t('common.processing') : t('common.saveChanges').toUpperCase()}
          </button>
        </div>
      </form>
    </Modal>
  );
}
