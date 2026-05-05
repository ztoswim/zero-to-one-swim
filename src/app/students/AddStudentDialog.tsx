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

          <div className="space-y-12 px-2">
            {/* Top Section: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column: Personal info */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-200">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tighter">Student Info</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Identification</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="label">Name <span className="req">*</span></label>
                    <input name="name" required className="input-field" placeholder="Full legal name" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Contact No <span className="req">*</span></label>
                      <input name="phone" required className="input-field" placeholder="+60..." />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Email</label>
                      <input name="email" type="email" className="input-field" placeholder="email@example.com" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Family & Enrollment */}
              <div className="space-y-8">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Family Details
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Parent</label>
                      <input name="parentName" className="input-field bg-white" placeholder="Guardian" />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Area</label>
                      <input name="sameArea" className="input-field bg-white" placeholder="e.g. Area X" />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-primary-50/50 rounded-[2.5rem] border border-primary-100/50 space-y-6">
                  <h5 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Schedule & Venue
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Start Date <span className="req">*</span></label>
                      <WheelDateInput value={startDate} onChange={setStartDate} name="startDate" />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Duration <span className="req">*</span></label>
                      <input name="lessonDuration" type="number" required defaultValue="45" className="input-field bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="label">Venue <span className="req">*</span></label>
                      <input name="venueInfo" required className="input-field bg-white" placeholder="Swimming Pool" />
                    </div>
                    <div className="space-y-1">
                      <label className="label">Coach <span className="req">*</span></label>
                      <select name="coachId" required className="input-field bg-white appearance-none cursor-pointer">
                        <option value="">Select Coach</option>
                        {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Address & Notes & Emergency */}
            <div className="pt-10 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <label className="label">Full Address</label>
                <textarea name="address" className="input-field h-28 resize-none py-4" placeholder="Full residential address..."></textarea>
              </div>
              <div className="space-y-2">
                <label className="label">Health / Level Notes</label>
                <textarea name="notes" className="input-field h-28 resize-none py-4" placeholder="Allergies, level..."></textarea>
              </div>
              <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 space-y-4">
                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Emergency Contact
                </h5>
                <div className="space-y-3">
                  <input name="emergencyName" className="w-full px-5 py-3 bg-white border border-red-100 rounded-2xl font-bold text-gray-900 outline-none" placeholder="Name" />
                  <input name="emergencyPhone" className="w-full px-5 py-3 bg-white border border-red-100 rounded-2xl font-bold text-gray-900 outline-none" placeholder="Phone" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-primary px-16 h-20 text-xl font-black tracking-tighter shadow-2xl shadow-primary-200"
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
