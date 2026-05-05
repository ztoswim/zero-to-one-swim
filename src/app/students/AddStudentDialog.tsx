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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Student" size="wide">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: 个人信息 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black">1</div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Personal Info</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">名字 Student Name *</label>
                <input name="name" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Full legal name" />
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Notes / Health Issues</label>
                <textarea name="notes" className="w-full h-32 bg-gray-50 border-2 border-transparent rounded-xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Allergies, swimming level..."></textarea>
              </div>
            </div>

            {/* Column 2: 联络信息 */}
            <div className="space-y-6 px-0 lg:px-8 lg:border-x border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black">2</div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Contact Details</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">联络号码 Contact No *</label>
                <input name="phone" required className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="+60..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">家长名字 Parent Name</label>
                  <input name="parentName" className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="Guardian" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">区域 Area</label>
                  <input name="sameArea" className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="e.g. Area X" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">邮箱 Email</label>
                <input name="email" type="email" className="w-full h-12 bg-gray-50 border-2 border-transparent rounded-xl px-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none" placeholder="email@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">地址 Address</label>
                <textarea name="address" className="w-full h-24 bg-gray-50 border-2 border-transparent rounded-xl p-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none" placeholder="Full address..."></textarea>
              </div>
            </div>

            {/* Column 3: 上课与紧急信息 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black">3</div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Lesson & Emergency</h4>
              </div>

              <div className="p-5 bg-primary-50 rounded-2xl border border-primary-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Start Date *</label>
                    <input name="startDate" type="date" required className="w-full h-10 bg-white border border-primary-100 rounded-lg px-3 font-bold text-sm outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Duration *</label>
                    <input name="lessonDuration" type="number" required defaultValue="45" className="w-full h-10 bg-white border border-primary-100 rounded-lg px-3 font-bold text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Venue *</label>
                  <input name="venueInfo" required className="w-full h-10 bg-white border border-primary-100 rounded-lg px-3 font-bold text-sm outline-none" placeholder="Swimming Pool" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Assign Coach *</label>
                  <select name="coachId" required className="w-full h-10 bg-white border border-primary-100 rounded-lg px-3 font-bold text-sm outline-none appearance-none">
                    <option value="">Select Coach</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-5 bg-red-50 rounded-2xl border border-red-100 space-y-3">
                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Emergency</h5>
                <input name="emergencyName" className="w-full h-10 bg-white border border-red-100 rounded-lg px-3 font-bold text-sm outline-none" placeholder="Name" />
                <input name="emergencyPhone" className="w-full h-10 bg-white border border-red-100 rounded-lg px-3 font-bold text-sm outline-none" placeholder="Phone" />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? 'Adding...' : 'Enroll Student'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
ter gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Student"}
          </button>
        </form>
      </Modal>
    </>
  );
}
