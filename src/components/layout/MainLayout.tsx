'use client';

import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/utils/cn';

export function MainLayout({ children }: { children: ReactNode }) {
  const sidebarCollapsed = false;

  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <ToastProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-stadium-gradient">
              <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(26,58,107,0.4)_0%,transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(200,169,81,0.08)_0%,transparent_50%)] pointer-events-none" aria-hidden="true" />
              <Sidebar collapsed={sidebarCollapsed} />
              <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-[68px]' : 'ml-64')}>
                <Header />
                <main className="p-6" id="main-content" role="main">
                  {children}
                </main>
              </div>
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}
