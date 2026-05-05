'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, User, Phone, Mail, MapPin, Calendar, ShieldAlert, BookOpen, Map, GraduationCap } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { addStudent } from './actions';

interface AddStudentDialogProps {
  coaches: { id: string, name: string }[];
}

export function AddStudentDialog({ coaches }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dob, setDob] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await addStudent(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      setLoading(false);
    }
  }

  // Required mark component
  const Req = () => <span className="text-red-600 ml-1">*</span>;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2"
      >
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
            {/* 1. Student Profile Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Profile</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Full Legal Name <Req /></label>
                  <input name="name" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 transition-all text-sm" placeholder="Student Name" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Gender <Req /></label>
                    <div className="relative">
                      <select name="gender" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none text-sm">
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

            {/* 2. Contact & Guardian Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
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

          {/* 3. Class Information Section */}
          <div className="bg-orange-50/50 rounded-[2rem] p-6 border-2 border-orange-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-orange-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-orange-900 tracking-tight">Class Information</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-orange-800 uppercase tracking-wider">Start Date <Req /></label>
                <WheelDateInput value={startDate} onChange={setStartDate} name="startDate" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-orange-800 uppercase tracking-wider">Duration (min) <Req /></label>
                <input name="lessonDuration" type="number" required defaultValue="45" className="w-full px-5 py-3.5 bg-white border-2 border-orange-200 rounded-xl font-black text-slate-900 outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-orange-800 uppercase tracking-wider">Location / Venue <Req /></label>
                <input name="venueInfo" required className="w-full px-5 py-3.5 bg-white border-2 border-orange-200 rounded-xl font-bold text-slate-900 outline-none text-sm" placeholder="Pool Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-orange-800 uppercase tracking-wider">Coach <Req /></label>
                <div className="relative">
                  <select name="coachId" required className="w-full px-5 py-3.5 bg-white border-2 border-orange-200 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm">
                    <option value="">Select Coach</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400 text-[10px]">▼</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section: Address, Notes & Emergency */}
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
              <h4 className="text-xs font-black text-red-900 uppercase tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <input name="emergencyName" className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg font-bold text-slate-900 text-xs" placeholder="Name" />
                <input name="emergencyPhone" className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg font-bold text-slate-900 text-xs" placeholder="Phone" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-20 h-14 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM ENROLLMENT'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
