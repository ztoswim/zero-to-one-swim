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
        <form onSubmit={handleSubmit} className="bg-gray-50/50 -m-8 p-10 space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border border-red-100 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. Basic Information Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Personal Details</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Full Name *</label>
                    <input name="name" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Nickname *</label>
                    <input name="nickname" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="Alias" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Gender *</label>
                    <select name="gender" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white appearance-none">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Date of Birth *</label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">IC / Passport Number *</label>
                  <input name="ic" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="000000-00-0000" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-400" />
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Profile Theme Color</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                      <label key={c} className="relative cursor-pointer">
                        <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                        <div 
                          className="w-8 h-8 rounded-lg transition-all peer-checked:scale-110 peer-checked:ring-2 ring-offset-2 ring-gray-300" 
                          style={{ backgroundColor: c }} 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Employment & Contact Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Work & Contact</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="phone" required className="input-field pl-12 bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="+60..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="email" type="email" className="input-field pl-12 bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="coach@swim.com" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Joining Date *</label>
                      <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Coach Level *</label>
                      <select name="level" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white appearance-none">
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Head">Head Coach</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Session Rate (RM) *</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">RM</div>
                      <input name="cost" type="number" step="0.01" required defaultValue="50.00" className="input-field pl-12 bg-gray-50/50 border-gray-100 focus:bg-white font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Banking Card - Refined Color */}
              <div className="bg-blue-50/50 rounded-[2rem] p-8 border border-blue-100 space-y-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-wider">Banking Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="bankName" required className="input-field bg-white border-blue-100 focus:border-blue-500" placeholder="Bank Name" />
                  <input name="bankAccount" required className="input-field bg-white border-blue-100 focus:border-blue-500" placeholder="Account Number" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section: Address & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t border-gray-200/60">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <label className="text-xs font-black uppercase tracking-wider">Home Address</label>
              </div>
              <textarea name="address" className="input-field h-32 bg-white border-gray-200 resize-none py-4" placeholder="Full residential address..."></textarea>
            </div>

            <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-black text-red-900 uppercase tracking-wider">Emergency Contact</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="emergencyName" required className="input-field bg-white border-red-100 focus:border-red-500" placeholder="Contact Person" />
                <input name="emergencyPhone" required className="input-field bg-white border-red-100 focus:border-red-500" placeholder="Contact Number" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-20 h-16 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl"
            >
              {loading ? 'SAVING...' : 'COMPLETE REGISTRATION'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
