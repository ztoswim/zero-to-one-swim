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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2"
      >
        Add Coach <Plus className="w-5 h-5" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Coach" size="wide">
        <form onSubmit={handleSubmit} className="bg-gray-100/30 -m-8 p-10 space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border-2 border-red-200 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. Basic Information Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-200 space-y-10">
              <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identify & Background</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Full Name *</label>
                    <input name="name" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Nickname *</label>
                    <input name="nickname" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300" placeholder="Alias" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Gender *</label>
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
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Date of Birth *</label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">IC / Passport Number *</label>
                  <input name="ic" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500" placeholder="000000-00-0000" />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary-600" />
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Profile Theme</label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#1e293b'].map(c => (
                      <label key={c} className="relative cursor-pointer">
                        <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                        <div 
                          className="w-10 h-10 rounded-xl transition-all peer-checked:scale-110 peer-checked:ring-4 ring-offset-2 ring-slate-200 border-2 border-slate-100" 
                          style={{ backgroundColor: c }} 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Employment & Contact Card */}
            <div className="space-y-10">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-200 space-y-10">
                <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center shadow-lg shadow-success/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Work & Contact</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Communication & Payroll</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="phone" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-12" placeholder="+60..." />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="email" type="email" className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-12" placeholder="coach@swim.com" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Joining Date *</label>
                      <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Level *</label>
                      <div className="relative">
                        <select name="level" required className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none">
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Head">Head Coach</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Session Rate (RM) *</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">RM</div>
                      <input name="cost" type="number" step="0.01" required defaultValue="50.00" className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl font-black text-slate-900 outline-none focus:border-primary-500 pl-12" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Banking Card - Strong Border */}
              <div className="bg-blue-50/50 rounded-[2.5rem] p-10 border-2 border-blue-200 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-black text-blue-900 uppercase tracking-tight">Banking Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-800 uppercase">Bank Name</label>
                    <input name="bankName" required className="w-full px-6 py-3 bg-white border-2 border-blue-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="Bank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-800 uppercase">Account No</label>
                    <input name="bankAccount" required className="w-full px-6 py-3 bg-white border-2 border-blue-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="Number" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section: Address & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t-2 border-slate-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <MapPin className="w-5 h-5 text-primary-600" />
                <label className="text-xs font-black uppercase tracking-wider">Residential Address</label>
              </div>
              <textarea name="address" className="w-full px-8 py-6 bg-white border-2 border-slate-300 rounded-[2rem] font-bold text-slate-900 outline-none focus:border-primary-500 min-h-[160px] resize-none" placeholder="Enter full address..."></textarea>
            </div>

            <div className="bg-red-50/50 rounded-[2.5rem] p-10 border-2 border-red-200 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-black text-red-900 uppercase tracking-tight">Emergency Contact</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-800 uppercase">Contact Person</label>
                  <input name="emergencyName" required className="w-full px-6 py-3 bg-white border-2 border-red-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-500" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-800 uppercase">Phone Number</label>
                  <input name="emergencyPhone" required className="w-full px-6 py-3 bg-white border-2 border-red-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-red-500" placeholder="Phone" />
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
              {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
