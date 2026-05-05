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
        <form onSubmit={handleSubmit} className="bg-gray-100/50 -m-8 p-10 space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border-2 border-red-100 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. Basic Information Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-gray-100 space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Personal Details</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identify & Background</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-600" />
                      Full Name *
                    </label>
                    <input name="name" required className="input-field bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-50" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-600" />
                      Nickname *
                    </label>
                    <input name="nickname" required className="input-field bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-50" placeholder="Display name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-600" />
                      Gender *
                    </label>
                    <select name="gender" required className="input-field bg-white border-2 border-gray-200 text-gray-900 appearance-none focus:border-primary-500">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-600" />
                      Date of Birth *
                    </label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary-600" />
                    IC / Passport Number *
                  </label>
                  <input name="ic" required className="input-field bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-300" placeholder="000000-00-0000" />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary-600" />
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider">Profile Theme</label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#1e293b'].map(c => (
                      <label key={c} className="relative cursor-pointer">
                        <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                        <div 
                          className="w-10 h-10 rounded-xl transition-all peer-checked:scale-110 peer-checked:ring-4 ring-offset-2 ring-gray-200" 
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
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-gray-100 space-y-10">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center shadow-lg shadow-success/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Work & Contact</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communication & Payroll</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-900 uppercase tracking-wider">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="phone" required className="input-field pl-12 bg-white border-2 border-gray-200" placeholder="+60..." />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-900 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="email" type="email" className="input-field pl-12 bg-white border-2 border-gray-200" placeholder="coach@swim.com" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-900 uppercase tracking-wider">Joining Date *</label>
                      <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-900 uppercase tracking-wider">Level *</label>
                      <select name="level" required className="input-field bg-white border-2 border-gray-200 appearance-none">
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Head">Head Coach</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider">Session Rate (RM) *</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">RM</div>
                      <input name="cost" type="number" step="0.01" required defaultValue="50.00" className="input-field pl-12 bg-white border-2 border-gray-200 font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Banking Card - More Pronounced */}
              <div className="bg-blue-50/80 rounded-[2.5rem] p-10 border-2 border-blue-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-black text-blue-900 uppercase tracking-tight">Banking Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-700 uppercase">Bank Name</label>
                    <input name="bankName" required className="input-field bg-white border-2 border-blue-100 focus:border-blue-500" placeholder="Maybank / CIMB..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-700 uppercase">Account No</label>
                    <input name="bankAccount" required className="input-field bg-white border-2 border-blue-100 focus:border-blue-500" placeholder="1234..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section: Address & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t-2 border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-900">
                <MapPin className="w-5 h-5 text-primary-600" />
                <label className="text-xs font-black uppercase tracking-wider">Residential Address</label>
              </div>
              <textarea name="address" className="input-field h-40 bg-white border-2 border-gray-200 resize-none py-6 px-6 text-gray-900 font-medium" placeholder="Enter full address..."></textarea>
            </div>

            <div className="bg-red-50/80 rounded-[2.5rem] p-10 border-2 border-red-100 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-black text-red-900 uppercase tracking-tight">Emergency Contact</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-700 uppercase">Contact Person</label>
                  <input name="emergencyName" required className="input-field bg-white border-2 border-red-100 focus:border-red-500" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-700 uppercase">Phone Number</label>
                  <input name="emergencyPhone" required className="input-field bg-white border-2 border-red-100 focus:border-red-500" placeholder="Phone" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-24 h-20 text-xl font-black tracking-tighter shadow-2xl shadow-primary-200 rounded-3xl"
            >
              {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
