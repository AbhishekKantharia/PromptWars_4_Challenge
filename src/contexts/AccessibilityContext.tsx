'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AccessibilityPreferences } from '@/types/user';

const defaultPrefs: AccessibilityPreferences = {
  screenReader: false,
  highContrast: false,
  largeText: false,
  colorBlindMode: 'none',
  wheelchairUser: false,
  textToSpeech: false,
  speechToText: false,
};

interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => void;
  resetPreferences: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPrefs);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      if (saved) setPreferences({ ...defaultPrefs, ...JSON.parse(saved) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('accessibility-preferences', JSON.stringify(preferences)); } catch { /* ignore */ }
    const root = document.documentElement;
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('large-text', preferences.largeText);
    root.classList.toggle('colorblind-protanopia', preferences.colorBlindMode === 'protanopia');
    root.classList.toggle('colorblind-deuteranopia', preferences.colorBlindMode === 'deuteranopia');
    root.classList.toggle('colorblind-tritanopia', preferences.colorBlindMode === 'tritanopia');
    root.classList.toggle('reduced-motion', matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, [preferences]);

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => setPreferences(defaultPrefs), []);

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
