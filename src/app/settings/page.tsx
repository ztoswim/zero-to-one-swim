'use client';

import React, { useState } from 'react';
import { updatePassword } from '@/app/login/actions';
import { Lock, ShieldCheck, ShieldAlert, Loader2, Save } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Reset form
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-gray-400 font-medium tracking-wide">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{t('settings.changePassword')}</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              {t('settings.passwordRequirement')}
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-700">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-500 p-4 rounded-2xl text-xs font-bold border border-green-100 flex items-center gap-3 animate-bounce">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  {t('settings.updateSuccess')}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {t('settings.newPassword')}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="password" 
                      name="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {t('settings.confirmNewPassword')}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="password" 
                      name="confirmPassword"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full lg:w-auto px-12 h-16 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('settings.updating')}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t('common.saveChanges') || "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
