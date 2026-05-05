'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, User, Phone, Mail, MapPin, Calendar, ShieldAlert, BookOpen, Map } from 'lucide-react';
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
        <form onSubmit={handleSubmit} className="bg-gray-50/50 -m-8 p-10 space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border border-red-100 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. Student Profile Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Student Profile</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Full Legal Name *</label>
                  <input name="name" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="Student Name" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Gender *</label>
                    <select name="gender" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white appearance-none">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Date of Birth *</label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Primary Contact No *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="phone" required className="input-field pl-12 bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="+60..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="email" type="email" className="input-field pl-12 bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="parent@example.com" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Family & Enrollment Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Guardian & Schedule</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Parent Name</label>
                      <input name="parentName" className="input-field bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="Guardian Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Area / Region</label>
                      <div className="relative">
                        <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="sameArea" className="input-field pl-12 bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="e.g. Area X" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Start Date *</label>
                      <WheelDateInput value={startDate} onChange={setStartDate} name="startDate" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Duration (min) *</label>
                      <input name="lessonDuration" type="number" required defaultValue="45" className="input-field bg-gray-50/50 border-gray-100 focus:bg-white font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Venue *</label>
                      <input name="venueInfo" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white" placeholder="Pool Location" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Assigned Coach *</label>
                      <select name="coachId" required className="input-field bg-gray-50/50 border-gray-100 focus:bg-white appearance-none">
                        <option value="">Select Coach</option>
                        {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bottom Section: Address, Notes & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t border-gray-200/60">
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <label className="text-xs font-black uppercase tracking-wider">Home Address</label>
              </div>
              <textarea name="address" className="input-field h-32 bg-white border-gray-200 resize-none py-4" placeholder="Full address..."></textarea>
            </div>

            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3 text-gray-400">
                <BookOpen className="w-4 h-4" />
                <label className="text-xs font-black uppercase tracking-wider">Internal Notes</label>
              </div>
              <textarea name="notes" className="input-field h-32 bg-white border-gray-200 resize-none py-4" placeholder="Health issues, level..."></textarea>
            </div>

            <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-black text-red-900 uppercase tracking-wider">Emergency Contact</h4>
              </div>
              <div className="space-y-4">
                <input name="emergencyName" required className="input-field bg-white border-red-100 focus:border-red-500" placeholder="Contact Person" />
                <input name="emergencyPhone" required className="input-field bg-white border-red-100 focus:border-red-500" placeholder="Contact Phone" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-20 h-16 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl"
            >
              {loading ? 'ENROLLING...' : 'CONFIRM ENROLLMENT'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
