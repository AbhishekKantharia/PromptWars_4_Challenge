export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  language: Language;
  accessibility?: AccessibilityPreferences;
  createdAt: string;
  lastLogin: string;
}

export type UserRole = 'fan' | 'vip' | 'volunteer' | 'staff' | 'security' | 'medical' | 'admin';

export type Language = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'hi' | 'ja' | 'de' | 'it' | 'zh';

export interface AccessibilityPreferences {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  wheelchairUser: boolean;
  textToSpeech: boolean;
  speechToText: boolean;
}

export interface UserPreferences {
  userId: string;
  language: Language;
  notifications: NotificationPreferences;
  theme: 'dark' | 'light' | 'system';
}

export interface NotificationPreferences {
  crowdAlerts: boolean;
  weatherAlerts: boolean;
  matchUpdates: boolean;
  emergencyAlerts: boolean;
  transportUpdates: boolean;
}
