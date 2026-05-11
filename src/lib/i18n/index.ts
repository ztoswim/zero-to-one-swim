import { cookies } from 'next/headers';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  zh: () => import('./dictionaries/zh.json').then((module) => module.default),
};

export type Locale = 'en' | 'zh';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'en';
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

export async function getTranslations() {
  const locale = await getLocale();
  return getDictionary(locale);
}

export async function getTranslation() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const t = (path: string, replacements?: Record<string, any>): string => {
    const keys = path.split('.');
    let result: any = dict;
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path;
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
