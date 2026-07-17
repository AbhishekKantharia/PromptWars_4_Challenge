'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vfx-enabled';

function getInitialVFX(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null ? stored === 'true' : true;
}

export function VFXToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setEnabled(getInitialVFX());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled, mounted]);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setEnabled(e => !e)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-fifa-navy/80 backdrop-blur-xl px-3 py-2 text-xs font-medium text-fifa-silver hover:border-fifa-accent/30 hover:text-fifa-accent transition-all duration-300 shadow-glass"
      aria-label={enabled ? 'Disable visual effects' : 'Enable visual effects'}
      title={enabled ? 'VFX: On' : 'VFX: Off'}
    >
      <span
        className="inline-block w-2 h-2 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: enabled ? '#D4AF37' : '#6B7280',
          boxShadow: enabled ? '0 0 8px rgba(212, 175, 55, 0.5)' : 'none',
        }}
      />
      <span
        className="overflow-hidden transition-all duration-300"
        style={{ maxWidth: hovered ? '80px' : '0px', opacity: hovered ? 1 : 0 }}
      >
        VFX {enabled ? 'On' : 'Off'}
      </span>
    </button>
  );
}
