'use client';

import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    // Read from cookie
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale;
    
    if (locale) {
      setCurrentLocale(locale);
    }
  }, []);

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'zh' : 'en';
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year
    setCurrentLocale(newLocale);
    router.refresh();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-100 hover:border-primary-500 hover:bg-primary-50 transition-all group shadow-sm"
      title="Switch Language / 切换语言"
    >
      <Languages className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary-600">
        {currentLocale === 'en' ? 'EN' : '中'}
      </span>
    </button>
  );
}
