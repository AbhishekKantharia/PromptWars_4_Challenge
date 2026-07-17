'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { href: '/assistant', label: 'AI Assistant', icon: '🤖' },
  { href: '/navigation', label: 'Navigation', icon: '🗺️' },
  { href: '/crowd', label: 'Crowd Intel', icon: '👥' },
  { href: '/transport', label: 'Transport', icon: '🚌' },
  { href: '/accessibility', label: 'Accessibility', icon: '♿' },
  { href: '/emergency', label: 'Emergency', icon: '🚨' },
  { href: '/sustainability', label: 'Sustainability', icon: '♻️' },
  { href: '/volunteer', label: 'Volunteer', icon: '🙋' },
  { href: '/operations', label: 'Operations', icon: '📊' },
] as const;

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-glass-border bg-fifa-navy/95 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-glass-border', collapsed && 'justify-center px-0')}>
        <div className="h-9 w-9 rounded-xl bg-gold-gradient flex items-center justify-center text-fifa-navy font-bold text-sm flex-shrink-0">
          FS
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-fifa-white truncate">FIFA Smart</h1>
            <p className="text-[10px] text-fifa-accent tracking-wider">STADIUM 2026</p>
          </div>
        )}
      </div>

      <nav className="mt-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-fifa-accent/10 text-fifa-accent border border-fifa-accent/20'
                  : 'text-fifa-silver hover:bg-white/5 hover:text-fifa-white',
                collapsed && 'justify-center px-0'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0" role="img" aria-hidden="true">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
