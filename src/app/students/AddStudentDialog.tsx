'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, User, Phone, Mail, MapPin, Calendar, ShieldAlert, BookOpen, Map } from 'lucide-react';
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
        <form onSubmit={handleSubmit} className="bg-gray-100/30 -m-8 p-10 space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border-2 border-red-200 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. Student Profile Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-200 space-y-10">
              <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic Identification</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    Full Legal Name <Req />
                  </label>
                  <input name="name" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all" placeholder="Student Name" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      Gender <Req />
                    </label>
                    <div className="relative">
                      <select name="gender" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      Date of Birth <Req />
                    </label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      Primary Contact No <Req />
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="phone" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-12" placeholder="+60..." />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="email" type="email" className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-12" placeholder="parent@example.com" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Guardian & Schedule Card */}
            <div className="space-y-10">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-200 space-y-10">
                <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Guardian & Schedule</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Details</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Parent Name</label>
                      <input name="parentName" className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none" placeholder="Guardian Name" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Area / Region</label>
                      <div className="relative">
                        <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="sameArea" className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none pl-12" placeholder="e.g. Area X" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Start Date <Req /></label>
                      <WheelDateInput value={startDate} onChange={setStartDate} name="startDate" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Duration (min) <Req /></label>
                      <input name="lessonDuration" type="number" required defaultValue="45" className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-black text-slate-900 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Venue <Req /></label>
                      <input name="venueInfo" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none" placeholder="Pool Location" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Assigned Coach <Req /></label>
                      <div className="relative">
                        <select name="coachId" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none appearance-none">
                          <option value="">Select Coach</option>
                          {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bottom Section: Address, Notes & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t-2 border-slate-200">
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3 text-slate-900">
                <MapPin className="w-5 h-5 text-primary-600" />
                <label className="text-xs font-black uppercase tracking-wider">Home Address</label>
              </div>
              <textarea name="address" className="w-full px-8 py-6 bg-white border-2 border-slate-300 rounded-[2rem] font-bold text-slate-900 outline-none min-h-[160px] resize-none" placeholder="Full address..."></textarea>
            </div>

            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3 text-slate-900">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <label className="text-xs font-black uppercase tracking-wider">Internal Notes</label>
              </div>
              <textarea name="notes" className="w-full px-8 py-6 bg-white border-2 border-slate-300 rounded-[2rem] font-bold text-slate-900 outline-none min-h-[160px] resize-none" placeholder="Health issues, level..."></textarea>
            </div>

            <div className="bg-red-50/50 rounded-[2.5rem] p-10 border-2 border-red-200 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-black text-red-900 uppercase tracking-tight">Emergency Contact</h4>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Contact Person</label>
                  <input name="emergencyName" className="w-full px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-400" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase">Phone Number</label>
                  <input name="emergencyPhone" className="w-full px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-400" placeholder="Phone" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-24 h-20 text-xl font-black tracking-tighter shadow-2xl shadow-primary-200 rounded-3xl transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'ENROLLING...' : 'CONFIRM ENROLLMENT'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
