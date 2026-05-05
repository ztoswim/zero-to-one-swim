'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, Loader2 } from 'lucide-react';
import { addCoach } from './actions';

export function AddCoachDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Personal Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black">1</div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Personal Details</h4>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">名字 Name *</label>
                <input name="name" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Full Name" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">别名 Nickname *</label>
                <input name="nickname" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Display Name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">性别 Gender *</label>
                  <select name="gender" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">出生日期 DOB *</label>
                  <input name="dob" type="date" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">身份证号码 IC *</label>
                <input name="ic" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="ID / Passport No" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Color</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                    <label key={c} className="relative cursor-pointer">
                      <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                      <div className="w-8 h-8 rounded-lg transition-all peer-checked:scale-110 peer-checked:ring-2 ring-gray-200" style={{ backgroundColor: c }} />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Contact & Work */}
            <div className="space-y-6 px-0 lg:px-8 lg:border-x border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black">2</div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Work & Contact</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">联络号码 Phone *</label>
                <input name="phone" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="+60..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">邮箱 Email</label>
                <input name="email" type="email" className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="coach@swim.com" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">地址 Address</label>
                <textarea name="address" className="w-full h-20 bg-gray-50 border-2 border-transparent rounded-xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Residential address..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">入职日期 Join Date *</label>
                  <input name="joinDate" type="date" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">等级 Level *</label>
                  <select name="level" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none">
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Head">Head</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cost Per Session (RM) *</label>
                <input name="cost" type="number" step="0.01" required defaultValue="50.00" className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" />
              </div>
            </div>

            {/* Column 3: Emergency & Banking */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black">3</div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Legal & Finance</h4>
              </div>

              <div className="p-5 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Emergency Contact</h5>
                <input name="emergencyName" required className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-bold text-gray-900 outline-none focus:border-red-500 transition-all" placeholder="Contact Name" />
                <input name="emergencyPhone" required className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-bold text-gray-900 outline-none focus:border-red-500 transition-all" placeholder="Contact Phone" />
              </div>

              <div className="p-5 bg-gray-900 rounded-2xl space-y-4">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Banking Details</h5>
                <input name="bankName" required className="w-full h-11 bg-white/10 border border-white/5 rounded-xl px-4 font-bold text-white outline-none focus:border-primary-500 transition-all" placeholder="Bank Name" />
                <input name="bankAccount" required className="w-full h-11 bg-white/10 border border-white/5 rounded-xl px-4 font-bold text-white outline-none focus:border-primary-500 transition-all" placeholder="Account Number" />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? 'Creating...' : 'Save Coach Profile'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
