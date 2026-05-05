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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">名字 Student Name *</label>
                <input 
                  name="name"
                  required
                  className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                  placeholder="Full legal name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">性别 Gender *</label>
                <select name="gender" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">出生日期 Date of Birth *</label>
              <input name="dob" type="date" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" />
            </div>
          </div>

          {/* 2. 联络信息 */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">2. 联络信息 Contact Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">家长名字 Parent Name</label>
                <input name="parentName" className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Guardian Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">联络号码 Contact Number *</label>
                <input name="phone" required className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="+60..." />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">邮箱 Email</label>
                <input name="email" type="email" className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">区域 Area Tag</label>
                <input name="sameArea" className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="e.g. Area X" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">地址 Address</label>
              <textarea name="address" className="w-full h-24 bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Full home address..."></textarea>
            </div>
          </div>

          {/* 3. 紧急联络信息 */}
          <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 space-y-6">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">3. 紧急联络信息 Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">名字 Name</label>
                <input name="emergencyName" className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Contact Person" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">联络号码 Phone</label>
                <input name="emergencyPhone" className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-red-500 transition-all outline-none" placeholder="Emergency Phone" />
              </div>
            </div>
          </div>

          {/* 4. 上课信息 */}
          <div className="p-8 bg-primary-50/50 rounded-[2.5rem] border border-primary-100/50 space-y-6">
            <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">4. 上课信息 Lesson Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">开始日期 Start Date *</label>
                <input name="startDate" type="date" required className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">上课时长 Duration (min) *</label>
                <input name="lessonDuration" type="number" required defaultValue="45" className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">上课地点 Venue *</label>
                <input name="venueInfo" required className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none" placeholder="e.g. Swimming Club" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">教练 Coach *</label>
                <select 
                  name="coachId"
                  required
                  className="w-full h-14 bg-white border-2 border-transparent rounded-2xl px-4 font-bold text-gray-900 focus:border-primary-500 transition-all outline-none appearance-none"
                >
                  <option value="">Select Coach</option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
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
