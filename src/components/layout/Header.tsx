'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/constants';
import type { Language } from '@/types';
import { cn } from '@/utils/cn';

export function Header() {
  const { language, setLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-glass-border bg-fifa-navy/80 backdrop-blur-xl flex items-center justify-between px-6" role="banner">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-fifa-gray">Match Day 14</p>
          <p className="text-sm font-semibold text-fifa-white">Argentina vs Germany — Final</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={cn(
              'flex items-center gap-2 rounded-xl border border-glass-border px-3 py-1.5 text-sm',
              'bg-white/5 text-fifa-silver hover:border-fifa-accent/30 transition-all'
            )}
            aria-label="Select language"
            aria-expanded={langOpen}
          >
            <span>🌐</span>
            <span>{currentLang?.nativeName || 'English'}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-glass-border bg-fifa-dark shadow-glass py-1 z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code as Language); setLangOpen(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    language === lang.code
                      ? 'text-fifa-accent bg-fifa-accent/10'
                      : 'text-fifa-silver hover:bg-white/5'
                  )}
                >
                  {lang.nativeName}
                  <span className="text-fifa-gray ml-2 text-xs">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative rounded-xl p-2 text-fifa-silver hover:bg-white/5 transition-colors" aria-label="Notifications">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-fifa-red" aria-label="Unread notification" />
        </button>

        <button className="h-8 w-8 rounded-full bg-fifa-blue flex items-center justify-center text-sm font-semibold text-fifa-white" aria-label="User profile">
          JD
        </button>
      </div>
    </header>
  );
}
