'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language } from '@/types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const RTL_LANGUAGES: Language[] = ['ar'];

const LANGUAGE_MAP: Record<Language, string> = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', ar: 'ar-SA',
  hi: 'hi-IN', ja: 'ja-JP', de: 'de-DE', it: 'it-IT', zh: 'zh-CN',
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('preferred-language') as Language;
      if (saved && LANGUAGE_MAP[saved]) setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('preferred-language', language); } catch { /* ignore */ }
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => setLangState(lang), []);
  const isRTL = RTL_LANGUAGES.includes(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function getSpeechLang(lang: Language): string {
  return LANGUAGE_MAP[lang] || 'en-US';
}
