'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { UserPlus, User, Mail, Lock, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createUserAction } from './actions';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface CreateUserDialogProps {
  onSuccess: () => void;
}

export function CreateUserDialog({ onSuccess }: CreateUserDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
    };

    try {
      const result = await createUserAction(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          onSuccess();
        }, 1500);
      }
    } catch (e: any) {
      setError(e.message || t('common.errorUnexpected'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="h-14 px-8 bg-primary-500 text-white rounded-2xl shadow-xl shadow-primary-200 flex items-center justify-center gap-3 font-black transition-all hover:bg-primary-600 hover:-translate-y-0.5 active:scale-95 group"
      >
        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="tracking-tighter">{t('staffAccess.createStaffAccount').toUpperCase()}</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('staffAccess.createNewStaff')} size="default">
        <div className="bg-gray-100/30 -m-8 p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in">
              <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-green-100">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">{t('staffAccess.accountCreated')}</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs text-center">{t('staffAccess.userCanLogin')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border-2 border-red-200 flex items-center gap-3 animate-in shake-1">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3 h-3 text-primary-500" /> {t('common.fullName')}
                    </label>
                    <input 
                      name="fullName" 
                      required 
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" 
                      placeholder="e.g. John Doe" 
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3 h-3 text-primary-500" /> {t('common.email')}
                    </label>
                    <input 
                      name="email" 
                      type="email" 
                      required 
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" 
                      placeholder="staff@example.com" 
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-3 h-3 text-primary-500" /> {t('staffAccess.initialPassword')}
                    </label>
                    <input 
                      name="password" 
                      type="password" 
                      required 
                      minLength={6}
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" 
                      placeholder={t('staffAccess.passwordPlaceholder')} 
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-3 h-3 text-primary-500" /> {t('staffAccess.initialSystemRole')}
                    </label>
                    <div className="relative">
                      <select 
                        name="role" 
                        required 
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 appearance-none text-sm"
                      >
                        <option value="coach">{t('staffAccess.coachDefault')}</option>
                        <option value="admin">{t('nav.admin')}</option>
                        <option value="parent">{t('nav.parent')}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-200 transition-all hover:bg-primary-600 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>{t('staffAccess.confirmCreateAccount').toUpperCase()}</>
                )}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
