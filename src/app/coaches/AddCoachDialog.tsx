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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Coach">
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {/* 1. 个人信息 */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">1. 个人信息 Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">名字 Name *</label>
                <input name="name" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">别名 Nickname (Display Name) *</label>
                <input name="nickname" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Coach Nickname" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">性别 Gender *</label>
                <select name="gender" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">出生日期 Date of Birth *</label>
                <input name="dob" type="date" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">身份证号码 IC *</label>
              <input name="ic" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="ID / Passport No" />
            </div>
          </div>

          {/* 2. 联络信息 */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">2. 联络信息 Contact Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">联络号码 Contact Number *</label>
                <input name="phone" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="+60..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">邮箱 Email</label>
                <input name="email" type="email" className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="coach@swim.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">地址 Address</label>
              <textarea name="address" className="w-full h-24 bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Residential address..."></textarea>
            </div>
          </div>

          {/* 3. 紧急联络信息 */}
          <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 space-y-6">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">3. 紧急联络信息 Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">姓名 Name *</label>
                <input name="emergencyName" required className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Contact Person" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">联络号码 Phone *</label>
                <input name="emergencyPhone" required className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Emergency Phone" />
              </div>
            </div>
          </div>

          {/* 4. 上班信息 */}
          <div className="p-8 bg-primary-50/50 rounded-[2.5rem] border border-primary-100/50 space-y-6">
            <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">4. 上班信息 Work Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">开始上班日期 Join Date *</label>
                <input name="joinDate" type="date" required className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">等级 Level *</label>
                <select name="level" required className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none appearance-none">
                  <option value="">Select Level</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Head">Head Coach</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">Cost Per Session (RM) *</label>
              <input name="cost" type="number" step="0.01" required defaultValue="50.00" className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" />
            </div>
          </div>

          {/* 5. 银行信息 */}
          <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">5. 银行信息 Bank Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">银行名字 Bank Name *</label>
                <input name="bankName" required className="w-full h-14 bg-white/10 border-2 border-transparent rounded-2xl px-4 font-bold text-white focus:border-primary-500 transition-all outline-none" placeholder="e.g. Maybank" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">银行户口 Account No *</label>
                <input name="bankAccount" required className="w-full h-14 bg-white/10 border-2 border-transparent rounded-2xl px-4 font-bold text-white focus:border-primary-500 transition-all outline-none" placeholder="0000 0000 0000" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Color</label>
            <div className="flex gap-3">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                <label key={c} className="relative cursor-pointer">
                  <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === '#3b82f6'} />
                  <div className="w-10 h-10 rounded-xl transition-all peer-checked:scale-110 peer-checked:ring-4 ring-gray-100" style={{ backgroundColor: c }} />
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-primary-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Coach"}
          </button>
        </form>
      </Modal>
    </>
  );
}
