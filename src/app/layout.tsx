import type { Metadata } from 'next';
import './globals.css';
import './vfx.css';

export const metadata: Metadata = {
  title: 'FIFA Smart Stadium 2026 — AI-Powered Tournament Operations',
  description: 'GenAI-powered Smart Stadium Assistant enhancing fan experience, operations, accessibility, and safety for the FIFA World Cup 2026.',
  keywords: ['FIFA', 'World Cup', '2026', 'Smart Stadium', 'AI', 'Gemini', 'Operations', 'Fan Experience'],
  openGraph: {
    title: 'FIFA Smart Stadium 2026',
    description: 'AI-Powered Smart Stadium & Tournament Operations Platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-fifa-navy text-fifa-white antialiased font-sans" suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-fifa-accent focus:text-fifa-navy focus:px-4 focus:py-2">
          Skip to main content
        </a>
        <svg className="hidden" aria-hidden="true">
          <defs>
            <filter id="protanopia-filter"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" /></filter>
            <filter id="deuteranopia-filter"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" /></filter>
            <filter id="tritanopia-filter"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" /></filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
