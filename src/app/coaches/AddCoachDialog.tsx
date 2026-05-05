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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              name="name"
              required
              className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
              placeholder="e.g. Coach Jackson"
            />
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
              <input 
                name="phone"
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="+60..."
              />
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
