'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🤖', title: 'AI Stadium Assistant', desc: 'Ask anything — navigation, food, tickets, safety', href: '/assistant' },
  { icon: '🗺️', title: 'Intelligent Navigation', desc: 'Interactive maps, indoor navigation, barrier-free routes', href: '/navigation' },
  { icon: '👥', title: 'Crowd Intelligence', desc: 'Real-time heatmaps, congestion prediction, smart routing', href: '/crowd' },
  { icon: '🚌', title: 'Transport Assistant', desc: 'Metro, bus, taxi, parking — live availability', href: '/transport' },
  { icon: '♿', title: 'Accessibility', desc: 'Voice interaction, TTS/STT, wheelchair routes', href: '/accessibility' },
  { icon: '🚨', title: 'Emergency AI', desc: 'SOS, evacuation, lost child, incident reporting', href: '/emergency' },
  { icon: '♻️', title: 'Sustainability', desc: 'Carbon tracking, green travel, waste reduction', href: '/sustainability' },
  { icon: '🙋', title: 'Volunteer Hub', desc: 'Tasks, schedule, AI knowledge base', href: '/volunteer' },
  { icon: '📊', title: 'Operations', desc: 'Live dashboard, AI insights, risk alerts', href: '/operations' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen stadium-bg">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,169,81,0.08)_0%,transparent_70%)]" aria-hidden="true" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold-gradient flex items-center justify-center text-fifa-navy font-bold">FS</div>
            <div>
              <h1 className="text-sm font-bold text-fifa-white">FIFA Smart Stadium</h1>
              <p className="text-[10px] text-fifa-accent tracking-widest">2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-fifa-silver hover:text-fifa-accent transition-colors">Sign In</Link>
            <Link href="/assistant" className="rounded-xl bg-gold-gradient text-fifa-navy px-4 py-2 text-sm font-semibold hover:shadow-gold-glow transition-all">
              Launch App
            </Link>
          </div>
        </nav>

        <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-white/5 px-4 py-1.5 text-xs text-fifa-silver mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-fifa-green animate-pulse" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-gold-gradient bg-clip-text text-transparent">Smart Stadium</span>
              <br />
              <span className="text-fifa-white">Assistant</span>
            </h1>

            <p className="text-lg text-fifa-silver max-w-2xl mx-auto mb-8">
              AI-powered platform enhancing fan experience, stadium operations, accessibility, and emergency response for the FIFA World Cup 2026 across 12 venues.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/assistant" className="rounded-xl bg-gold-gradient text-fifa-navy px-8 py-3 text-base font-bold hover:shadow-gold-glow hover:-translate-y-0.5 transition-all">
                Start Exploring →
              </Link>
              <Link href="/operations" className="rounded-xl border border-glass-border bg-white/5 text-fifa-silver px-8 py-3 text-base font-medium hover:border-fifa-accent/30 transition-all">
                Operations Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }} className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {FEATURES.map((feat, i) => (
                <Link key={feat.href} href={feat.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                    className="group rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-6 hover:border-fifa-accent/30 hover:shadow-gold-glow transition-all duration-300 cursor-pointer"
                  >
                    <span className="text-3xl mb-3 block" role="img" aria-hidden="true">{feat.icon}</span>
                    <h3 className="text-base font-semibold text-fifa-white group-hover:text-fifa-accent transition-colors">{feat.title}</h3>
                    <p className="text-sm text-fifa-gray mt-1">{feat.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          <div className="mt-16 flex items-center justify-center gap-8 text-fifa-gray text-xs">
            <span>🌐 10 Languages</span>
            <span>♿ WCAG 2.1 AA</span>
            <span>🔒 Enterprise Security</span>
            <span>⚡ Real-time AI</span>
          </div>
        </main>
      </div>
    </div>
  );
}
