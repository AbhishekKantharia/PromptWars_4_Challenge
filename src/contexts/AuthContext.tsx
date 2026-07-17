'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthUser {
  name: string;
  email: string;
  role: 'fan' | 'staff' | 'volunteer' | 'admin';
  initials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'stadiumiq_auth';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    if (user?.email && user?.name) return user;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    if (!email.trim()) return { error: 'Email is required' };
    if (!_password.trim()) return { error: 'Password is required' };
    if (_password.length < 6) return { error: 'Password must be at least 6 characters' };

    const storedUsers = JSON.parse(localStorage.getItem('stadiumiq_users') || '[]') as { name: string; email: string; password: string; role: AuthUser['role'] }[];
    const found = storedUsers.find(u => u.email === email.toLowerCase());
    if (!found) return { error: 'No account found with this email' };
    if (found.password !== _password) return { error: 'Incorrect password' };

    const authUser: AuthUser = { name: found.name, email: found.email, role: found.role, initials: getInitials(found.name) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name.trim()) return { error: 'Name is required' };
    if (!email.trim()) return { error: 'Email is required' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };

    const storedUsers = JSON.parse(localStorage.getItem('stadiumiq_users') || '[]') as { name: string; email: string; password: string; role: AuthUser['role'] }[];
    if (storedUsers.some(u => u.email === email.toLowerCase())) return { error: 'An account with this email already exists' };

    const newUser = { name: name.trim(), email: email.toLowerCase(), password, role: 'fan' as const };
    storedUsers.push(newUser);
    localStorage.setItem('stadiumiq_users', JSON.stringify(storedUsers));

    const authUser: AuthUser = { name: newUser.name, email: newUser.email, role: newUser.role, initials: getInitials(newUser.name) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return {};
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
