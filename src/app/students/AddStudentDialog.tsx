'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, Loader2 } from 'lucide-react';
import { addStudent } from './actions';

interface AddStudentDialogProps {
  coaches: { id: string, name: string }[];
}

export function AddStudentDialog({ coaches }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await addStudent(formData);

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
        Add Student <UserPlus className="w-5 h-5" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Student">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student Full Name *</label>
              <input 
                name="name"
                required
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="Full legal name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
              <select 
                name="gender"
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
              <input 
                name="dob"
                type="date"
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number *</label>
              <input 
                name="phone"
                required
                className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                placeholder="Primary contact"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              name="email"
              type="email"
              className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
              placeholder="email@example.com"
            />
          </div>

          <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parental Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guardian Name</label>
                <input name="parentName" className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residential Area Tag</label>
                <input name="sameArea" className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" placeholder="e.g. Block A / Garden X" />
              </div>
            </div>
          </div>

          <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 space-y-4">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="emergencyName" className="w-full h-14 bg-white border-2 border-red-100/50 rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Contact Person" />
              <input name="emergencyPhone" className="w-full h-14 bg-white border-2 border-red-100/50 rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Emergency Phone" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Home Address</label>
              <textarea name="address" className="w-full h-32 bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Detailed address..."></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Notes / Health Issues</label>
              <textarea name="notes" className="w-full h-32 bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Any allergies, swimming level..."></textarea>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Coach</label>
            <select 
              name="coachId"
              className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none"
            >
              <option value="none">No Coach Assigned</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-primary-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Student"}
          </button>
        </form>
      </Modal>
    </>
  );
}
