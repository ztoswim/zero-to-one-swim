'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, User, Phone, Mail, MapPin, Calendar, ShieldAlert, BookOpen, Map, GraduationCap, Clock, Plus, Trash2 } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { WheelTimeInput } from '@/components/WheelTimeInput';
import { addStudent } from './actions';

interface AddStudentDialogProps {
  coaches: { id: string, name: string }[];
  venues: { id: string, name: string }[];
}

interface FixedSlot {
  id: string;
  day: string;
  time: string;
  duration: number;
  coachId: string;
}

export function AddStudentDialog({ coaches, venues }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dob, setDob] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Multiple slots state
  const [slots, setSlots] = useState<FixedSlot[]>([
    { id: Math.random().toString(), day: 'Monday', time: '18:00', duration: 45, coachId: '' }
  ]);

  const addSlot = () => {
    setSlots([...slots, { id: Math.random().toString(), day: 'Monday', time: '18:00', duration: 45, coachId: '' }]);
  };

  const removeSlot = (id: string) => {
    if (slots.length > 1) {
      setSlots(slots.filter(s => s.id !== id));
    }
  };

  const updateSlot = (id: string, updates: Partial<FixedSlot>) => {
    setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Helper for scrollable select
  const handleSelectWheel = (e: React.WheelEvent<HTMLSelectElement>, onChange: (val: string) => void) => {
    e.preventDefault();
    const select = e.currentTarget;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(select.options.length - 1, select.selectedIndex + delta));
    if (newIndex !== select.selectedIndex) {
      onChange(select.options[newIndex].value);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append('fixedSlots', JSON.stringify(slots));

    const result = await addStudent(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      setLoading(false);
      setSlots([{ id: Math.random().toString(), day: 'Monday', time: '18:00', duration: 45, coachId: '' }]);
    }
  }

  const Req = () => <span className="text-red-600 ml-1">*</span>;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2">
        Add Student <UserPlus className="w-5 h-5" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Student" size="wide">
        <form onSubmit={handleSubmit} className="bg-gray-100/30 -m-8 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border-2 border-red-200 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center"><User className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Full Legal Name <Req /></label>
                  <input name="name" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder="Student Name" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Gender <Req /></label>
                    <div className="relative">
                      <select 
                        name="gender" 
                        required 
                        onWheel={(e) => handleSelectWheel(e, (val) => e.currentTarget.value = val)}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Date of Birth <Req /></label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Contact Information</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Parent / Guardian Name</label>
                    <input name="parentName" className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none text-sm" placeholder="Guardian Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Primary Phone <Req /></label>
                    <input name="phone" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder="+60..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Email Address</label>
                    <input name="email" type="email" className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder="parent@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Region / Area</label>
                    <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input name="sameArea" className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none pl-10 text-sm" placeholder="e.g. Area X" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50/50 rounded-[2rem] p-6 border-2 border-orange-200 shadow-sm space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-orange-200 pb-3 sticky top-0 bg-orange-50/95 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-orange-900 tracking-tight">Fixed Weekly Slots</h3>
              </div>
              <button type="button" onClick={addSlot} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"><Plus className="w-4 h-4" /> Add Slot</button>
            </div>
            <div className="space-y-6">
              {slots.map((slot, index) => (
                <div key={slot.id} className="bg-white/60 p-6 rounded-2xl border border-orange-100 relative group animate-in slide-in-from-right-2">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">{index + 1}</div>
                  {slots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(slot.id)} className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-white border border-red-100 text-red-500 flex items-center justify-center shadow-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Class Day</label>
                      <div className="relative">
                        <select 
                          value={slot.day}
                          onChange={(e) => updateSlot(slot.id, { day: e.target.value })}
                          onWheel={(e) => handleSelectWheel(e, (val) => updateSlot(slot.id, { day: val }))}
                          required 
                          className="w-full px-4 py-2.5 bg-white border border-orange-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-xs"
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (<option key={d} value={d}>{d}</option>))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400 text-[8px]">▼</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Start Time</label>
                      <WheelTimeInput value={slot.time} onChange={(val) => updateSlot(slot.id, { time: val })} className="!py-2 !border-orange-100 !text-xs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Duration (min)</label>
                      <input 
                        type="number" 
                        value={slot.duration} 
                        onChange={(e) => updateSlot(slot.id, { duration: parseInt(e.target.value) })}
                        onWheel={(e) => {
                          e.preventDefault();
                          const delta = e.deltaY > 0 ? -5 : 5;
                          const newVal = Math.max(0, (slot.duration || 0) + delta);
                          updateSlot(slot.id, { duration: newVal });
                        }}
                        required 
                        step="5" 
                        className="w-full px-4 py-2.5 bg-white border border-orange-100 rounded-xl font-black text-slate-900 outline-none text-xs" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Assign Coach</label>
                      <div className="relative">
                        <select 
                          value={slot.coachId}
                          onChange={(e) => updateSlot(slot.id, { coachId: e.target.value })}
                          onWheel={(e) => handleSelectWheel(e, (val) => updateSlot(slot.id, { coachId: val }))}
                          required 
                          className="w-full px-4 py-2.5 bg-white border border-orange-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-xs"
                        >
                          <option value="">Select Coach</option>
                          {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400 text-[8px]">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
             <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Overall Start Date <Req /></label>
                <WheelDateInput value={startDate} onChange={setStartDate} name="startDate" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Class Location <Req /></label>
                <div className="relative">
                  <select 
                    name="venueId" 
                    required 
                    onWheel={(e) => handleSelectWheel(e, (val) => e.currentTarget.value = val)}
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none text-sm"
                  >
                    <option value="">Select Location</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Address</label>
              <textarea name="address" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none h-20 resize-none text-sm" placeholder="Address..."></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Internal Notes</label>
              <textarea name="notes" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none h-20 resize-none text-sm" placeholder="Health, level..."></textarea>
            </div>
            <div className="bg-red-50/50 rounded-2xl p-4 border-2 border-red-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-red-900 uppercase tracking-tight flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" /> Emergency</h4>
              <div className="grid grid-cols-2 gap-4">
                <input name="emergencyName" className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg font-bold text-slate-900 text-xs" placeholder="Name" />
                <input name="emergencyPhone" className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg font-bold text-slate-900 text-xs" placeholder="Phone" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary px-20 h-14 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto">
              {loading ? 'ENROLLING...' : 'CONFIRM ENROLLMENT'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
