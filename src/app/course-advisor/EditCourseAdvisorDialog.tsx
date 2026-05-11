'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Pencil, User, Phone, Mail, CreditCard, ShieldAlert, Briefcase, MapPin, Smartphone, GraduationCap } from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { updateCourseAdvisorAction } from './actions';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function EditCourseAdvisorDialog({ admin }: { admin: any }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dob, setDob] = useState(admin.dob || new Date().toISOString().split('T')[0]);
  const [joinDate, setJoinDate] = useState(admin.joinDate || new Date().toISOString().split('T')[0]);
  const [icValue, setIcValue] = useState(admin.ic || '');

  useEffect(() => {
    if (admin) {
      setDob(admin.dob || new Date().toISOString().split('T')[0]);
      setJoinDate(admin.joinDate || new Date().toISOString().split('T')[0]);
      setIcValue(admin.ic || '');
    }
  }, [admin]);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const finalData = {
      ...data,
      dob,
      joinDate,
      ic: icValue
    };

    const result = await updateCourseAdvisorAction(admin.id, finalData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      setLoading(false);
    }
  }

  const Req = () => <span className="text-red-600 ml-1">*</span>;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all" 
        title={t('common.edit')}
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('common.updateAdmin')} size="wide">
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
                <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-100"><User className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('common.personalDetails')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.fullName')} <Req /></label>
                    <input name="name" required defaultValue={admin.name} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm transition-colors" placeholder={t('common.fullName')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.displayName')} <Req /></label>
                    <input name="nickname" required defaultValue={admin.nickname} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm transition-colors" placeholder={t('common.alias')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.gender')} <Req /></label>
                    <div className="relative">
                      <select 
                        name="gender" 
                        required 
                        defaultValue={admin.gender}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none text-sm transition-colors"
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
                  <input name="ic" required value={icValue} onChange={handleIcChange} maxLength={14} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm placeholder:text-slate-300 transition-colors" placeholder="000000-00-0000" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-400 text-white flex items-center justify-center shadow-lg shadow-primary-100"><Smartphone className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('common.contactInfo')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.phone')} <Req /></label>
                    <input name="phone" required defaultValue={admin.phone} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-5 text-sm transition-colors" placeholder="+60..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.email')}</label>
                    <input name="email" type="email" defaultValue={admin.email} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 pl-5 text-sm transition-colors" placeholder="advisor@swim.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{t('common.fullAddress')}</label>
                  <textarea name="address" defaultValue={admin.address} className="w-full px-5 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 h-[108px] resize-none text-sm transition-colors" placeholder={t('common.fullAddress')}></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-6 border-2 border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-100"><GraduationCap className="w-5 h-5" /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('common.employmentDetails')}</h3>
            </div>
            <div className="space-y-2 max-w-sm">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{t('common.joiningDate')} <Req /></label>
              <WheelDateInput value={joinDate} onChange={setJoinDate} name="joinDate" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50/50 rounded-[2rem] p-5 border-2 border-blue-200 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 shrink-0"><CreditCard className="w-5 h-5 text-blue-600" /><h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{t('common.bank')}</h4></div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1"><label className="text-[10px] font-black text-blue-800 uppercase px-1">{t('common.bankName')} <Req /></label><input name="bankName" required defaultValue={admin.bankName} className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.bankName')} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-blue-800 uppercase px-1">{t('common.accountNo')} <Req /></label><input name="bankAccount" required defaultValue={admin.bankAccount} className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.accountNo')} /></div>
              </div>
            </div>
            <div className="bg-red-50/50 rounded-[2.5rem] p-5 border-2 border-red-200 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 shrink-0"><ShieldAlert className="w-5 h-5 text-red-600" /><h4 className="text-sm font-black text-red-900 uppercase tracking-tight">{t('common.emergency')}</h4></div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1"><label className="text-[10px] font-black text-red-800 uppercase px-1">{t('common.name')} <Req /></label><input name="emergencyName" required defaultValue={admin.emergencyName} className="w-full px-4 py-2.5 bg-white border-2 border-red-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.name')} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-red-800 uppercase px-1">{t('common.phone')} <Req /></label><input name="emergencyPhone" required defaultValue={admin.emergencyPhone} className="w-full px-4 py-2.5 bg-white border-2 border-red-100 rounded-xl font-bold text-slate-900 text-sm" placeholder={t('common.phone')} /></div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary bg-primary-500 hover:bg-primary-600 border-none px-24 h-16 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto uppercase text-white">{loading ? t('common.processing') : t('common.updateAdmin')}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
