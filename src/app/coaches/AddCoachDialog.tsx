'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, Loader2, Calendar, Phone, Mail } from 'lucide-react';
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
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="bg-red-50 text-red-500 p-6 rounded-[2rem] text-sm font-black border border-red-100 flex items-center gap-3 animate-in">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">!</div>
              {error}
            </div>
          )}

          <div className="space-y-12 px-2">
            {/* Top Section: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column: Personal */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-200">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tighter">Coach Info</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identify & Background</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Name <span className="req">*</span></label>
                      <input name="name" required className="input-field" placeholder="Full Name" />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Nickname <span className="req">*</span></label>
                      <input name="nickname" required className="input-field" placeholder="Display Name" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Gender <span className="req">*</span></label>
                      <select name="gender" required className="input-field appearance-none cursor-pointer">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="label">DOB <span className="req">*</span></label>
                      <WheelDateInput value={dob} onChange={setDob} name="dob" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="label">IC <span className="req">*</span></label>
                    <input name="ic" required className="input-field" placeholder="ID / Passport No" />
                  </div>

                  <div className="space-y-3">
                    <label className="label">Profile Accent Color</label>
                    <div className="flex flex-wrap gap-2.5">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                        <label key={c} className="relative cursor-pointer group">
                          <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                          <div 
                            className="w-10 h-10 rounded-2xl transition-all peer-checked:scale-110 peer-checked:ring-4 ring-gray-100 group-hover:scale-105 shadow-sm" 
                            style={{ backgroundColor: c }} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity font-black">✓</div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact & Employment */}
              <div className="space-y-8">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    Contact Details
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Phone <span className="req">*</span></label>
                      <input name="phone" required className="input-field bg-white" placeholder="+60..." />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Email</label>
                      <input name="email" type="email" className="input-field bg-white" placeholder="coach@swim.com" />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-primary-50/50 rounded-[2.5rem] border border-primary-100/50 space-y-6">
                  <h5 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Employment Details
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Join Date <span className="req">*</span></label>
                      <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Level <span className="req">*</span></label>
                      <select name="level" required className="input-field bg-white appearance-none cursor-pointer">
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Head">Head Coach</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="label">Cost Per Session (RM) <span className="req">*</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">RM</div>
                      <input name="cost" type="number" step="0.01" required defaultValue="50.00" className="input-field pl-12 bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Address, Emergency & Banking */}
            <div className="pt-10 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <label className="label">Full Address</label>
                <textarea name="address" className="input-field h-32 resize-none py-4" placeholder="Residential address..."></textarea>
              </div>
              <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 space-y-4">
                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Emergency Contact
                </h5>
                <div className="space-y-3">
                  <input name="emergencyName" required className="w-full px-5 py-3 bg-white border border-red-100 rounded-2xl font-bold text-gray-900 outline-none" placeholder="Name" />
                  <input name="emergencyPhone" required className="w-full px-5 py-3 bg-white border border-red-100 rounded-2xl font-bold text-gray-900 outline-none" placeholder="Phone" />
                </div>
              </div>
              <div className="p-8 bg-gray-900 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <Plus className="w-24 h-24" />
                </div>
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  Banking Details
                </h5>
                <div className="space-y-4 relative z-10">
                  <input name="bankName" required className="w-full px-5 py-3 bg-white/10 border border-white/10 rounded-2xl font-black text-white placeholder:text-gray-500 focus:bg-white/20 focus:border-primary-500 outline-none transition-all" placeholder="Bank Name" />
                  <input name="bankAccount" required className="w-full px-5 py-3 bg-white/10 border border-white/10 rounded-2xl font-black text-white placeholder:text-gray-500 focus:bg-white/20 focus:border-primary-500 outline-none transition-all" placeholder="Account Number" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-primary px-16 h-20 text-xl font-black tracking-tighter shadow-2xl shadow-primary-200"
              >
                {loading ? 'Processing...' : 'CONFIRM & SAVE PROFILE'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
