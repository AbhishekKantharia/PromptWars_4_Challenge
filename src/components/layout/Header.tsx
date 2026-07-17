'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { LANGUAGES } from '@/constants';
import type { Language } from '@/types';
import { cn } from '@/utils/cn';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { LiveScoreBar } from '@/components/matches/LiveScoreBar';

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
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setLangOpen(false);
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
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
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-fifa-navy/90 backdrop-blur-2xl" role="banner">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fifa-accent to-yellow-500 flex items-center justify-center">
              <span className="text-fifa-navy font-black text-xs">W</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-fifa-white tracking-tight">WORLD CUP</span>
              <span className="text-sm font-light text-fifa-accent ml-1">2026</span>
            </div>
          </Link>

          <div className="w-px h-6 bg-white/10 hidden sm:block" />

          <LiveScoreBar />
        </div>

        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setLangOpen(!langOpen)} className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs',
              'text-fifa-silver hover:text-fifa-white hover:bg-white/5 transition-all'
            )} aria-label="Select language" aria-expanded={langOpen} aria-haspopup="listbox">
              <span className="text-sm" aria-hidden="true">🌐</span>
              <span className="hidden md:inline">{currentLang?.code.toUpperCase() || 'EN'}</span>
            </button>
            {langOpen && (
              <div id="lang-dropdown" role="listbox" onKeyDown={handleDropdownKeydown}
                className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.08] bg-fifa-dark/95 backdrop-blur-xl shadow-glass py-1 z-50">
                {LANGUAGES.map((lang) => (
                  <button key={lang.code} role="option" aria-selected={language === lang.code}
                    onClick={() => { setLanguage(lang.code as Language); setLangOpen(false); }}
                    className={cn('w-full text-left px-4 py-2 text-sm transition-colors',
                      language === lang.code ? 'text-fifa-accent bg-fifa-accent/10' : 'text-fifa-silver hover:bg-white/5')}>
                    {lang.nativeName}
                    <span className="text-fifa-gray ml-2 text-xs">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              className="relative rounded-lg p-2 text-fifa-silver hover:text-fifa-white hover:bg-white/5 transition-all"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} aria-expanded={notifOpen}>
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-fifa-red text-[9px] text-white flex items-center justify-center font-bold" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>

          {/* User */}
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); setLangOpen(false); }}
              className="h-8 w-8 rounded-full bg-fifa-blue border border-white/10 flex items-center justify-center text-xs font-bold text-fifa-white hover:border-fifa-accent/50 transition-all"
              aria-label={`User menu: ${user?.name || 'Guest'}`} aria-expanded={userMenuOpen}>
              {user?.initials || 'G'}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.08] bg-fifa-dark/95 backdrop-blur-xl shadow-glass py-1 z-50" role="menu">
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-fifa-white">{user.name}</p>
                      <p className="text-xs text-fifa-silver mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] bg-fifa-accent/20 text-fifa-accent px-2 py-0.5 rounded-full uppercase font-bold">{user.role}</span>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-fifa-silver hover:bg-white/5 hover:text-fifa-red transition-colors" role="menuitem">Sign Out</button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-fifa-silver mb-2">Not signed in</p>
                    <Link href="/login" className="text-sm text-fifa-accent hover:underline font-medium">Sign In</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
