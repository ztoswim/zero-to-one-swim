'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, User, Phone, Mail, CreditCard, ShieldAlert, Briefcase, MapPin, Palette, Award } from 'lucide-react';
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
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-100">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Details</h3>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Full Name <Req /></label>
                    <input name="name" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all text-sm" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Nickname <Req /></label>
                    <input name="nickname" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 transition-all text-sm" placeholder="Display Name" />
                  </div>
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
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">DOB <Req /></label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">IC / Passport <Req /></label>
                  <input name="ic" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder="000000-00-0000" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">Theme Color</label>
                  <div className="flex flex-wrap gap-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#1e293b'].map(c => (
                      <label key={c} className="relative cursor-pointer">
                        <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                        <div 
                          className="w-7 h-7 rounded-lg transition-all peer-checked:scale-110 peer-checked:ring-4 ring-offset-2 ring-slate-200 border border-slate-100" 
                          style={{ backgroundColor: c }} 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Employment & Contact Card */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-200 space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center shadow-md shadow-success/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Work & Contact</h3>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Phone <Req /></label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input name="phone" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-10 text-sm" placeholder="+60..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input name="email" type="email" className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-10 text-sm" placeholder="coach@swim.com" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Joining Date <Req /></label>
                      <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Level <Req /></label>
                      <div className="relative">
                        <select name="level" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none text-sm">
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Head">Head Coach</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Banking Card - Tightened */}
              <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border-2 border-blue-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-black text-blue-900 uppercase tracking-tight">Banking Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Bank Name <Req /></label>
                    <input name="bankName" required className="w-full px-5 py-3 bg-white border-2 border-blue-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 text-sm" placeholder="Bank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Account No <Req /></label>
                    <input name="bankAccount" required className="w-full px-5 py-3 bg-white border-2 border-blue-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 text-sm" placeholder="Number" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section: Address & Emergency - Highly Compressed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-900">
                <MapPin className="w-4 h-4 text-primary-600" />
                <label className="text-[11px] font-black uppercase tracking-wider">Address</label>
              </div>
              <textarea name="address" className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 h-24 resize-none text-sm" placeholder="Residential address..."></textarea>
            </div>

            <div className="bg-red-50/50 rounded-[2.5rem] p-6 border-2 border-red-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-red-100 pb-3">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Emergency Contact</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-800 uppercase tracking-widest">Name <Req /></label>
                  <input name="emergencyName" required className="w-full px-4 py-2.5 bg-white border-2 border-red-200 rounded-xl font-bold text-slate-900 outline-none focus:border-red-500 text-sm" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-800 uppercase tracking-widest">Phone <Req /></label>
                  <input name="emergencyPhone" required className="w-full px-4 py-2.5 bg-white border-2 border-red-200 rounded-xl font-bold text-slate-900 outline-none focus:border-red-500 text-sm" placeholder="Phone" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-20 h-16 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto"
            >
              {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
