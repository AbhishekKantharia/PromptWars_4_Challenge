'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { href: '/matches', label: 'Matches', icon: '⚽', accent: true },
  { href: '/broadcasts', label: 'Broadcasts', icon: '📺', accent: true },
  { href: '/assistant', label: 'AI Assistant', icon: '🤖', accent: false },
  { href: '/navigation', label: 'Navigation', icon: '🗺️', accent: false },
  { href: '/crowd', label: 'Crowd Intel', icon: '👥', accent: false },
  { href: '/transport', label: 'Transport', icon: '🚌', accent: false },
  { href: '/accessibility', label: 'Accessibility', icon: '♿', accent: false },
  { href: '/emergency', label: 'Emergency', icon: '🚨', accent: false },
  { href: '/sustainability', label: 'Sustainability', icon: '♻️', accent: false },
  { href: '/volunteer', label: 'Volunteer', icon: '🙋', accent: false },
  { href: '/operations', label: 'Operations', icon: '📊', accent: false },
] as const;

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-40 border-r border-white/[0.06] bg-fifa-navy/95 backdrop-blur-2xl transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="h-full overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? item.accent
                    ? 'bg-gradient-to-r from-fifa-accent/15 to-fifa-accent/5 text-fifa-accent border border-fifa-accent/20'
                    : 'bg-white/[0.06] text-fifa-white border border-white/[0.08]'
                  : 'text-fifa-silver hover:bg-white/[0.04] hover:text-fifa-white',
                collapsed && 'justify-center px-0'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0" role="img" aria-hidden="true">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.06]">
          <div className="rounded-xl bg-fifa-accent/10 border border-fifa-accent/20 p-3">
            <p className="text-[10px] text-fifa-accent font-bold uppercase tracking-wider">WE ARE 26</p>
            <p className="text-[10px] text-fifa-silver mt-1">FIFA World Cup 2026</p>
          </div>
        </div>
      )}
    </aside>
  );
}
