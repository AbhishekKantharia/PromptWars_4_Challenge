'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiUrl } from '@/lib/api-client';

export interface AppNotification {
  id: string;
  type: 'crowd' | 'emergency' | 'transport' | 'weather' | 'match';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

function generateCrowdNotifications(data: { congestionPoints?: { id: string; severity: number; estimatedWaitTime: number; alternativeRoute?: string }[]; totalAttendance?: number; averageDensity?: string }): AppNotification[] {
  const notifs: AppNotification[] = [];
  if (data.congestionPoints) {
    data.congestionPoints.forEach((cp) => {
      if (cp.severity > 0.7) {
        notifs.push({
          id: `crowd-${cp.id}-${Date.now()}`,
          type: 'crowd',
          title: 'High Congestion Alert',
          message: `Congestion detected — estimated wait ${Math.round(cp.estimatedWaitTime / 60)}min. ${cp.alternativeRoute || ''}`,
          severity: cp.severity > 0.85 ? 'critical' : 'warning',
          timestamp: Date.now(),
          read: false,
        });
      }
    });
  }
  if (data.averageDensity === 'critical') {
    notifs.push({
      id: `crowd-density-${Date.now()}`,
      type: 'crowd',
      title: 'Critical Density Warning',
      message: `Stadium density is critical (${data.totalAttendance?.toLocaleString()} attendees). Immediate crowd management action required.`,
      severity: 'critical',
      timestamp: Date.now(),
      read: false,
    });
  }
  return notifs;
}

function generateOperationsNotifications(data: { incidents?: { active?: number; critical?: number; averageResponseTime?: number }; crowd?: { activeAlerts?: number } }): AppNotification[] {
  const notifs: AppNotification[] = [];
  if (data.incidents?.critical && data.incidents.critical > 0) {
    notifs.push({
      id: `ops-critical-${Date.now()}`,
      type: 'emergency',
      title: 'Critical Incident',
      message: `${data.incidents.critical} critical incident(s) require immediate attention. Average response time: ${data.incidents.averageResponseTime || 'N/A'} min.`,
      severity: 'critical',
      timestamp: Date.now(),
      read: false,
    });
  }
  if (data.incidents?.active && data.incidents.active > 3) {
    notifs.push({
      id: `ops-active-${Date.now()}`,
      type: 'emergency',
      title: 'Active Incidents',
      message: `${data.incidents.active} active incidents being monitored across the venue.`,
      severity: 'warning',
      timestamp: Date.now(),
      read: false,
    });
  }
  return notifs;
}

function generateTransportNotifications(data: { traffic?: { level: string; estimatedDelay: number } }): AppNotification[] {
  const notifs: AppNotification[] = [];
  if (data.traffic?.level === 'heavy' || (data.traffic?.estimatedDelay && data.traffic.estimatedDelay > 30)) {
    notifs.push({
      id: `transport-delay-${Date.now()}`,
      type: 'transport',
      title: 'Traffic Delay',
      message: `Heavy traffic detected. Estimated delay: ${data.traffic.estimatedDelay} min. Consider public transit.`,
      severity: 'warning',
      timestamp: Date.now(),
      read: false,
    });
  }
  return notifs;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetch < 30000) return;
    setLastFetch(now);

    try {
      const [crowdRes, opsRes, transportRes] = await Promise.allSettled([
        fetch(apiUrl('/api/crowd')).then(r => r.ok ? r.json() : null),
        fetch(apiUrl('/api/operations')).then(r => r.ok ? r.json() : null),
        fetch(apiUrl('/api/transport')).then(r => r.ok ? r.json() : null),
      ]);

      const newNotifs: AppNotification[] = [];

      if (crowdRes.status === 'fulfilled' && crowdRes.value) {
        newNotifs.push(...generateCrowdNotifications(crowdRes.value));
      }
      if (opsRes.status === 'fulfilled' && opsRes.value) {
        newNotifs.push(...generateOperationsNotifications(opsRes.value));
      }
      if (transportRes.status === 'fulfilled' && transportRes.value) {
        newNotifs.push(...generateTransportNotifications(transportRes.value));
      }

      if (newNotifs.length > 0) {
        setNotifications(prev => {
          const existing = new Set(prev.map(n => `${n.type}-${n.title}`));
          const unique = newNotifs.filter(n => !existing.has(`${n.type}-${n.title}`));
          return [...unique, ...prev].slice(0, 50);
        });
      }
    } catch {
      // Silent fail for background polling
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
