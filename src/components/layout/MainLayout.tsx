'use client';

import { type ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/utils/cn';

const VFXLayer = dynamic(
  () => import('@/components/vfx/VFXLayer').then((m) => m.VFXLayer),
  { ssr: false }
);

export function MainLayout({ children }: { children: ReactNode }) {
  const sidebarCollapsed = false;

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <LanguageProvider>
          <NotificationProvider>
            <ToastProvider>
              <ErrorBoundary>
                <div className="min-h-screen bg-stadium-gradient">
                    <div className="fixed inset-0 stadium-bg pointer-events-none" aria-hidden="true" />
                    <Suspense fallback={null}>
                      <VFXLayer />
                    </Suspense>
                    <Sidebar collapsed={sidebarCollapsed} />
                    <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-[68px]' : 'ml-60')}>
                      <Header />
                    <main className="p-6" id="main-content" role="main">
                      {children}
                    </main>
                  </div>
                </div>
              </ErrorBoundary>
            </ToastProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}
