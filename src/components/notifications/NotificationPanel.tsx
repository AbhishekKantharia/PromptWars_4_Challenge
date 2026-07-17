'use client';

import { useNotifications, type AppNotification } from '@/contexts/NotificationContext';
import { cn } from '@/utils/cn';

const SEVERITY_STYLES: Record<AppNotification['severity'], string> = {
  info: 'border-l-blue-500',
  warning: 'border-l-yellow-500',
  critical: 'border-l-red-500',
};

const TYPE_ICONS: Record<AppNotification['type'], string> = {
  crowd: '👥',
  emergency: '🚨',
  transport: '🚌',
  weather: '🌦️',
  match: '⚽',
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-96 max-h-[70vh] rounded-xl border border-glass-border bg-fifa-dark shadow-glass z-50 flex flex-col" role="region" aria-label="Notifications">
      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-fifa-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-fifa-red text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-fifa-accent hover:underline">Mark all read</button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-xs text-fifa-gray hover:text-fifa-red">Clear</button>
          )}
          <button onClick={onClose} className="text-fifa-gray hover:text-fifa-white text-lg leading-none" aria-label="Close notifications">&times;</button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-fifa-gray text-sm">
            No notifications yet. Alerts will appear here during matches.
          </div>
        ) : (
          <ul className="divide-y divide-glass-border">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  'px-4 py-3 cursor-pointer border-l-4 transition-colors hover:bg-white/5',
                  SEVERITY_STYLES[n.severity],
                  n.read ? 'opacity-60' : 'bg-white/[0.02]'
                )}
                role="article"
                aria-label={`${n.severity} ${n.type} notification: ${n.title}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5" aria-hidden="true">{TYPE_ICONS[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm font-medium truncate', n.read ? 'text-fifa-gray' : 'text-fifa-white')}>{n.title}</p>
                      <span className="text-xs text-fifa-gray whitespace-nowrap">{timeAgo(n.timestamp)}</span>
                    </div>
                    <p className="text-xs text-fifa-silver mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-fifa-accent flex-shrink-0 mt-1.5" aria-label="Unread" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
