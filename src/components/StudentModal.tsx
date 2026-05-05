'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WheelDateInput } from './WheelDateInput';

interface StudentModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (student: any) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ show, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: '',
    parentName: '',
    address: '',
    emergencyContact: '',
  });

  if (!show) return null;

  const handleSave = () => {
    if (!form.name || !form.phone) {
      alert('Name and phone are required');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">New Registration</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Manage student credentials and family info</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-6">Personal Details</h4>
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="label">Student Full Name *</label>
                    <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Full legal name" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="label">Gender</label>
                      <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className="input-field appearance-none">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Date of Birth</label>
                      <WheelDateInput value={form.dob} onChange={(val) => setForm({...form, dob: val})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Mobile Number *</label>
                    <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field" placeholder="Primary contact" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Parental Information</h4>
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="label">Guardian Name</label>
                    <input value={form.parentName} onChange={(e) => setForm({...form, parentName: e.target.value})} className="input-field bg-white" placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label className="label">Residential Area Tag</label>
                    <input value={(form as any).sameArea || ''} onChange={(e) => setForm({...form, sameArea: e.target.value} as any)} className="input-field bg-white" placeholder="e.g. Block A / Garden X" />
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6">Emergency Contact</h4>
                <div className="grid grid-cols-1 gap-4">
                  <input value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} className="input-field border-red-100 bg-white" placeholder="Contact Person & Phone" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 pt-6 border-t border-gray-50">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="label">Full Home Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="input-field h-32 resize-none py-4" placeholder="Detailed address..."></textarea>
                </div>
                <div className="form-group">
                  <label className="label">Internal Notes / Health Issues</label>
                  <textarea value={(form as any).notes || ''} onChange={(e) => setForm({...form, notes: e.target.value} as any)} className="input-field h-32 resize-none py-4" placeholder="Any allergies, swimming level..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-10 py-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50 rounded-b-[2.5rem]">
          <button onClick={onClose} className="btn btn-secondary px-8 border-2">Discard</button>
          <button onClick={handleSave} className="btn btn-primary px-10 shadow-xl shadow-primary-200">Save Profile</button>
        </div>
      </div>
    </div>
  );
};
