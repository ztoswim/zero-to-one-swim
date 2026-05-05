'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, Loader2, Calendar, Phone } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { addStudent } from './actions';

interface AddStudentDialogProps {
  coaches: { id: string, name: string }[];
}

export function AddStudentDialog({ coaches }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dob, setDob] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

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
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="bg-red-50 text-red-500 p-6 rounded-[2rem] text-sm font-black border border-red-100 flex items-center gap-3 animate-in">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">!</div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 px-4">
            {/* Column 1: 个人信息 */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-200">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tighter">Student Profile</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Basic Identification</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label">Name <span className="req">*</span></label>
                <input name="name" required className="input-field" placeholder="Full legal name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <label className="label">Health / Level Notes</label>
                <textarea name="notes" className="input-field h-32 resize-none py-4" placeholder="Allergies, swimming level..."></textarea>
              </div>
            </div>

            {/* Column 2: 联络信息 */}
            <div className="space-y-8 lg:px-10 lg:border-x border-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center shadow-lg shadow-success/20">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tighter">Contact Details</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Communication & Address</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">Contact No <span className="req">*</span></label>
                  <input name="phone" required className="input-field" placeholder="+60..." />
                </div>
                <div className="space-y-1">
                  <label className="label">Email</label>
                  <input name="email" type="email" className="input-field" placeholder="email@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">Parent</label>
                  <input name="parentName" className="input-field" placeholder="Guardian" />
                </div>
                <div className="space-y-1">
                  <label className="label">Area</label>
                  <input name="sameArea" className="input-field" placeholder="e.g. Area X" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="label">Address</label>
                <textarea name="address" className="input-field h-24 resize-none py-4" placeholder="Full address..."></textarea>
              </div>

              <div className="p-8 bg-red-50/50 rounded-[2rem] border border-red-100/50 space-y-4">
                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Emergency Contact
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <input name="emergencyName" className="w-full px-5 py-3.5 bg-white border border-red-100 rounded-2xl font-bold text-gray-900 focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all" placeholder="Name" />
                  <input name="emergencyPhone" className="w-full px-5 py-3.5 bg-white border border-red-100 rounded-2xl font-bold text-gray-900 focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all" placeholder="Phone" />
                </div>
              </div>
            </div>

            {/* Column 3: 上课与紧急信息 */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tighter">Enrollment</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule Plan</p>
                </div>
              </div>

              <div className="p-8 bg-primary-50/50 rounded-[2.5rem] border border-primary-100/50 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label">Start Date <span className="req">*</span></label>
                    <WheelDateInput value={startDate} onChange={setStartDate} name="startDate" />
                  </div>
                  <div className="space-y-1">
                    <label className="label">Duration <span className="req">*</span></label>
                    <input name="lessonDuration" type="number" required defaultValue="45" className="input-field" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label">Venue <span className="req">*</span></label>
                  <input name="venueInfo" required className="input-field" placeholder="Swimming Pool" />
                </div>
                <div className="space-y-1">
                  <label className="label">Coach <span className="req">*</span></label>
                  <select name="coachId" required className="input-field appearance-none cursor-pointer">
                    <option value="">Select Coach</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-20 text-xl font-black tracking-tighter"
              >
                {loading ? 'Processing...' : 'ENROLL STUDENT'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
