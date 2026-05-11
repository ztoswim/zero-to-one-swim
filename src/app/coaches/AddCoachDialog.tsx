'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Plus, User, Phone, Mail, CreditCard, ShieldAlert, Briefcase, MapPin, Palette, Award, GraduationCap } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { addCoach } from './actions';

import { useTranslation } from '@/lib/i18n/useTranslation';

export function AddCoachDialog() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dob, setDob] = useState(new Date().toISOString().split('T')[0]);
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [icValue, setIcValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const formatIC = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 6);
      if (digits.length > 6) {
        formatted += '-' + digits.substring(6, 8);
        if (digits.length > 8) {
          formatted += '-' + digits.substring(8, 12);
        }
      }
    }
    return formatted;
  };

  const handleIcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIC(e.target.value);
    setIcValue(formatted);
  };

  // Helper for scrollable select
  const handleSelectWheel = (e: React.WheelEvent<HTMLSelectElement>, onChange: (val: string) => void) => {
    e.preventDefault();
    const select = e.currentTarget;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(select.options.length - 1, select.selectedIndex + delta));
    if (newIndex !== select.selectedIndex) {
      onChange(select.options[newIndex].value);
    }
  };

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
      setIcValue('');
    }
  }

  const Req = () => <span className="text-red-600 ml-1">*</span>;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="h-14 px-8 bg-primary-500 text-white rounded-2xl shadow-xl shadow-primary-200 flex items-center justify-center gap-3 font-black transition-all hover:bg-primary-600 hover:-translate-y-0.5 active:scale-95 group"
      >
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:inline tracking-tighter">{t('coaches.addCoach').toUpperCase()}</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('coaches.addNewCoach')} size="wide">
        <form onSubmit={handleSubmit} className="bg-gray-100/30 -m-8 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border-2 border-red-200 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center"><User className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.personalDetails')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.fullName')} <Req /></label>
                    <input name="name" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder={t('common.fullName')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.displayName')} <Req /></label>
                    <input name="nickname" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" placeholder={t('coaches.coachAlias')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.gender')} <Req /></label>
                    <div className="relative">
                      <select 
                        name="gender" 
                        required 
                        onWheel={(e) => handleSelectWheel(e, (val) => e.currentTarget.value = val)}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm"
                      >
                        <option value="">{t('common.select')}</option>
                        <option value="Male">{t('common.male')}</option>
                        <option value="Female">{t('common.female')}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.dob')} <Req /></label>
                    <WheelDateInput value={dob} onChange={setDob} name="dob" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.icPassport')} <Req /></label>
                  <input name="ic" required value={icValue} onChange={handleIcChange} maxLength={14} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none text-sm placeholder:text-slate-300" placeholder="000000-00-0000" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.contactInfo')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.phone')} <Req /></label>
                    <input name="phone" required className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none pl-5 text-sm" placeholder="+60..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.email')}</label>
                    <input name="email" type="email" className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none pl-5 text-sm" placeholder="coach@swim.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.fullAddress')}</label>
                  <textarea name="address" className="w-full px-5 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none h-[108px] resize-none text-sm" placeholder={t('coaches.residentialAddressPlaceholder') || "Residential address..."}></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-[2rem] p-6 border-2 border-indigo-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100"><GraduationCap className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-indigo-900 tracking-tight">{t('coaches.professionalProfile')}</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">{t('coaches.themeClassification')}</label>
                <div className="flex gap-4 items-center bg-white px-4 py-2 rounded-2xl border-2 border-indigo-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-50" style={{ backgroundColor: selectedColor }} />
                  <input type="hidden" name="color" value={selectedColor} />
                  <label className="relative cursor-pointer group flex items-center gap-2">
                    <Palette className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">{t('coaches.chooseColor')}</span>
                    <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-800 uppercase tracking-wider">{t('common.joiningDate')} <Req /></label>
                <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-800 uppercase tracking-wider">{t('coaches.coachLevel')} <Req /></label>
                <div className="relative">
                  <select 
                    name="level" 
                    required 
                    onWheel={(e) => handleSelectWheel(e, (val) => e.currentTarget.value = val)}
                    className="w-full px-5 py-3.5 bg-white border-2 border-indigo-200 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm focus:border-indigo-500"
                  >
                    <option value="Junior">{t('coaches.juniorCoach')}</option>
                    <option value="Senior">{t('coaches.seniorCoach')}</option>
                    <option value="Head">{t('coaches.headCoach')}</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-[10px]">▼</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50/50 rounded-[2rem] p-5 border-2 border-blue-200 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 shrink-0"><CreditCard className="w-5 h-5 text-blue-600" /><h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{t('common.bank')}</h4></div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1"><label className="text-[10px] font-black text-blue-800 uppercase px-1">{t('common.bankName')} <Req /></label><input name="bankName" required className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.bankName')} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-blue-800 uppercase px-1">{t('common.accountNo')} <Req /></label><input name="bankAccount" required className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.accountNo')} /></div>
              </div>
            </div>
            <div className="bg-red-50/50 rounded-[2.5rem] p-5 border-2 border-red-200 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 shrink-0"><ShieldAlert className="w-5 h-5 text-red-600" /><h4 className="text-sm font-black text-red-900 uppercase tracking-tight">{t('common.emergency')}</h4></div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1"><label className="text-[10px] font-black text-red-800 uppercase px-1">{t('common.name')} <Req /></label><input name="emergencyName" required className="w-full px-4 py-2.5 bg-white border-2 border-red-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.name')} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-red-800 uppercase px-1">{t('common.phone')} <Req /></label><input name="emergencyPhone" required className="w-full px-4 py-2.5 bg-white border-2 border-red-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.phone')} /></div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary px-24 h-16 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto">{loading ? t('common.processing') : t('coaches.confirmSaveCoach').toUpperCase()}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
