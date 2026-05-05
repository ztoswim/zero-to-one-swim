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
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
              <input 
                name="name"
                required
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="Coach Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nickname</label>
              <input 
                name="nickname"
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="Coach Nickname"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
              <select name="gender" className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Number (IC) *</label>
              <input 
                name="ic"
                required
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="ID / Passport No"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                name="email"
                type="email"
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="coach@swim.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone *</label>
              <input 
                name="phone"
                required
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="+60..."
              />
            </div>
          </div>

          <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100 space-y-4">
            <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Financial & Banking</h4>
            <div className="form-group">
              <label className="text-[10px] font-black text-primary-700 uppercase tracking-widest ml-1">Cost Per Session (RM) *</label>
              <input 
                name="cost"
                type="number"
                step="0.01"
                defaultValue="50.00"
                className="w-full h-14 bg-white border-2 border-primary-200 rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="bankName" className="w-full h-14 bg-white border-2 border-primary-200 rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" placeholder="Bank Name" />
              <input name="bankAccount" className="w-full h-14 bg-white border-2 border-primary-200 rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" placeholder="Account Number" />
            </div>
          </div>

          <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Emergency Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <input name="emergencyName" className="w-full h-14 bg-white border-2 border-red-100 rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Contact Name" />
              <input name="emergencyPhone" className="w-full h-14 bg-white border-2 border-red-100 rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Contact Phone" />
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
