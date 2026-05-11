'use client';

import { useState, useEffect } from 'react';
import en from './dictionaries/en.json';
import zh from './dictionaries/zh.json';

type Dictionary = typeof en;

export function useTranslation() {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const updateLocale = () => {
      const savedLocale = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] as 'en' | 'zh';
      
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
        setLocale(savedLocale);
      }
    };

    updateLocale();
    
    // Check for cookie changes occasionally or listen for custom events
    const interval = setInterval(updateLocale, 1000);
    return () => clearInterval(interval);
  }, []);

  const t = (path: string, replacements?: Record<string, any>): string => {
    const dict = locale === 'zh' ? zh : en;
    const keys = path.split('.');
    let result: any = dict;
    
    for (const key of keys) {
      if (result[key]) {
        result = result[key];
      } else {
        return path; // Fallback to path if not found
      }
    }
    
    let text = result as string;
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  return { t, locale };
}
