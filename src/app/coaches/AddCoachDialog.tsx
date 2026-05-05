'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, User, Phone, Mail, CreditCard, ShieldAlert, Briefcase, MapPin, Palette, Award, Smartphone, GraduationCap } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { addCoach } from './actions';

export function AddCoachDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dob, setDob] = useState(new Date().toISOString().split('T')[0]);
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await addCoach(formData);

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
        Add Coach <Plus className="w-5 h-5" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Coach" size="wide">
        <form onSubmit={handleSubmit} className="bg-gray-100/30 -m-8 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border-2 border-red-200 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Personal Details Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Details</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Full Name <Req /></label>
                    <input name="name" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Nickname <Req /></label>
                    <input name="nickname" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder="Display Name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Gender <Req /></label>
                    <div className="relative">
                      <select name="gender" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">DOB <Req /></label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">IC / Passport <Req /></label>
                  <input name="ic" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none text-sm" placeholder="000000-00-0000" />
                </div>
              </div>
            </div>

            {/* 2. Contact Details Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Contact Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Phone <Req /></label>
                    <input name="phone" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none pl-5 text-sm" placeholder="+60..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Email</label>
                    <input name="email" type="email" className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none pl-5 text-sm" placeholder="coach@swim.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Full Address</label>
                  <textarea name="address" className="w-full px-5 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none h-[108px] resize-none text-sm" placeholder="Residential address..."></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Professional Profile Card */}
          <div className="bg-indigo-50/50 rounded-[2rem] p-6 border-2 border-indigo-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-indigo-900 tracking-tight">Professional Profile</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">Theme Classification</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'].map(c => (
                    <label key={c} className="relative cursor-pointer">
                      <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                      <div 
                        className="w-8 h-8 rounded-lg transition-all peer-checked:scale-110 peer-checked:ring-4 ring-indigo-200 border-2 border-white shadow-sm" 
                        style={{ backgroundColor: c }} 
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-800 uppercase tracking-wider">Joining Date <Req /></label>
                <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-800 uppercase tracking-wider">Coach Level <Req /></label>
                <div className="relative">
                  <select name="level" required className="w-full px-5 py-3.5 bg-white border-2 border-indigo-200 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm focus:border-indigo-500">
                    <option value="Junior">Junior Coach</option>
                    <option value="Senior">Senior Coach</option>
                    <option value="Head">Head Coach</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-[10px]">▼</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Row: Banking & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50/50 rounded-[2rem] p-5 border-2 border-blue-200 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Bank</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-800 uppercase px-1">Bank Name <Req /></label>
                  <input name="bankName" required className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-bold text-slate-900 text-sm" placeholder="Bank Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-800 uppercase px-1">Account No <Req /></label>
                  <input name="bankAccount" required className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-bold text-slate-900 text-sm" placeholder="Account No" />
                </div>
              </div>
            </div>

            <div className="bg-red-50/50 rounded-[2.5rem] p-5 border-2 border-red-200 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Emergency</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-red-800 uppercase px-1">Name <Req /></label>
                  <input name="emergencyName" required className="w-full px-4 py-2.5 bg-white border-2 border-red-100 rounded-xl font-bold text-slate-900 text-sm" placeholder="Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-red-800 uppercase px-1">Phone <Req /></label>
                  <input name="emergencyPhone" required className="w-full px-4 py-2.5 bg-white border-2 border-red-100 rounded-xl font-bold text-slate-900 text-sm" placeholder="Phone" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-24 h-16 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM & SAVE COACH'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
