import type { GeoLocation } from './geo';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  language?: Language;
  metadata?: ChatMetadata;
}

export interface ChatMetadata {
  intent?: ChatIntent;
  confidence?: number;
  sources?: string[];
  entities?: Record<string, string>;
  actions?: ChatAction[];
}

export type ChatIntent =
  | 'navigation'
  | 'food'
  | 'restroom'
  | 'atm'
  | 'charging'
  | 'lost_found'
  | 'medical'
  | 'emergency'
  | 'parking'
  | 'transport'
  | 'weather'
  | 'security'
  | 'tickets'
  | 'hotel'
  | 'restaurant'
  | 'events'
  | 'general';

export interface ChatAction {
  type: 'navigate' | 'call' | 'open_map' | 'show_route' | 'sos';
  label: string;
  payload: Record<string, unknown>;
}

export type Language = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'hi' | 'ja' | 'de' | 'it' | 'zh';

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  language: Language;
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  language: Language;
  userProfile?: UserProfile;
  location?: GeoLocation;
  recentIntents: ChatIntent[];
  ticketInfo?: TicketInfo;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  language: Language;
  accessibility?: AccessibilityProfile;
  photoURL?: string;
}

export type UserRole = 'fan' | 'vip' | 'volunteer' | 'staff' | 'security' | 'medical' | 'admin';

export interface AccessibilityProfile {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: ColorBlindMode;
  wheelchairUser: boolean;
  textToSpeech: boolean;
  speechToText: boolean;
}

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface TicketInfo {
  ticketId: string;
  matchId: string;
  gate: string;
  section: string;
  row: string;
  seat: string;
  venueId: string;
  matchDate: string;
}
