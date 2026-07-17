import type { Language } from '@/types';

export const APP_NAME = 'FIFA Smart Stadium 2026';
export const APP_DESCRIPTION = 'AI-Powered Smart Stadium & Tournament Operations Platform';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const VENUES = [
  { id: 'metlife', name: 'MetLife Stadium', city: 'New York / New Jersey', capacity: 82500 },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70240 },
  { id: 'atte', name: 'AT&T Stadium', city: 'Dallas', capacity: 80000 },
  { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76416 },
  { id: 'nrg', name: 'NRG Stadium', city: 'Houston', capacity: 72220 },
  { id: 'hardrock', name: 'Hard Rock Stadium', city: 'Miami', capacity: 64767 },
  { id: 'lumen', name: 'Lumen Field', city: 'Seattle', capacity: 68740 },
  { id: 'levi', name: "Levi's Stadium", city: 'San Francisco', capacity: 68500 },
  { id: 'gillette', name: 'Gillette Stadium', city: 'Boston', capacity: 65878 },
  { id: 'lincoln', name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 69176 },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto', capacity: 30000 },
  { id: 'estadio-azteca', name: 'Estadio Azteca', city: 'Mexico City', capacity: 87000 },
] as const;

export const LANGUAGES: { code: Language; name: string; nativeName: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
] as const;

export const DENSITY_COLORS: Record<string, string> = {
  low: '#2ec866',
  moderate: '#f5c842',
  high: '#e67e22',
  very_high: '#e63946',
  critical: '#8b0000',
};

export const EMERGENCY_PHONE = '911';
export const FIFA_HOTLINE = '+1-800-FIFA-2026';
export const MEDICAL_STATION_PHONE = '+1-800-FIFA-MED';

export const GEMINI_MODEL = 'gemini-2.0-flash';
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';

export const RATE_LIMIT = {
  chat: { maxRequests: 30, windowMs: 60000 },
  api: { maxRequests: 100, windowMs: 60000 },
  emergency: { maxRequests: 5, windowMs: 300000 },
} as const;
