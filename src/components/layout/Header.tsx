'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { LANGUAGES } from '@/constants';
import type { Language } from '@/types';
import { cn } from '@/utils/cn';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setLangOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setNotifOpen(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleDropdownKeydown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setLangOpen(false); setNotifOpen(false); setUserMenuOpen(false); }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-glass-border bg-fifa-navy/80 backdrop-blur-xl flex items-center justify-between px-6" role="banner">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-fifa-gray">Match Day 14</p>
          <p className="text-sm font-semibold text-fifa-white">Argentina vs Germany — Final</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={cn(
              'flex items-center gap-2 rounded-xl border border-glass-border px-3 py-1.5 text-sm',
              'bg-white/5 text-fifa-silver hover:border-fifa-accent/30 transition-all'
            )}
            aria-label="Select language"
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            aria-controls="lang-dropdown"
          >
            <span aria-hidden="true">🌐</span>
            <span>{currentLang?.nativeName || 'English'}</span>
          </button>
          {langOpen && (
            <div
              id="lang-dropdown"
              role="listbox"
              aria-label="Available languages"
              onKeyDown={handleDropdownKeydown}
              className="absolute right-0 mt-2 w-48 rounded-xl border border-glass-border bg-fifa-dark shadow-glass py-1 z-50"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={language === lang.code}
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

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative rounded-xl p-2 text-fifa-silver hover:bg-white/5 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notifOpen}
          >
            <span className="text-lg" aria-hidden="true">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-fifa-red text-[10px] text-white flex items-center justify-center font-bold" aria-hidden="true">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); setLangOpen(false); }}
            className="h-8 w-8 rounded-full bg-fifa-blue flex items-center justify-center text-sm font-semibold text-fifa-white hover:ring-2 hover:ring-fifa-accent/50 transition-all"
            aria-label={`User menu: ${user?.name || 'Guest'}`}
            aria-expanded={userMenuOpen}
          >
            {user?.initials || 'G'}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-glass-border bg-fifa-dark shadow-glass py-1 z-50" role="menu">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-glass-border">
                    <p className="text-sm font-medium text-fifa-white">{user.name}</p>
                    <p className="text-xs text-fifa-gray">{user.email}</p>
                    <span className="inline-block mt-1 text-xs bg-fifa-accent/20 text-fifa-accent px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-fifa-silver hover:bg-white/5 hover:text-fifa-red transition-colors" role="menuitem">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 text-center">
                  <p className="text-sm text-fifa-gray mb-2">Not signed in</p>
                  <a href="/login" className="text-sm text-fifa-accent hover:underline">Sign In</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
