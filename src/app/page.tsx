'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '⚽', title: 'Live Scores', desc: 'Real-time match data, scores, and fixtures from the World Cup', href: '/matches' },
  { icon: '🤖', title: 'AI Stadium Assistant', desc: 'Ask anything — navigation, food, tickets, safety', href: '/assistant' },
  { icon: '🗺️', title: 'Intelligent Navigation', desc: 'Interactive maps, indoor navigation, barrier-free routes', href: '/navigation' },
  { icon: '👥', title: 'Crowd Intelligence', desc: 'Real-time heatmaps, congestion prediction, smart routing', href: '/crowd' },
  { icon: '🚌', title: 'Transport Assistant', desc: 'Metro, bus, taxi, parking — live availability', href: '/transport' },
  { icon: '♿', title: 'Accessibility', desc: 'Voice interaction, TTS/STT, wheelchair routes', href: '/accessibility' },
  { icon: '🚨', title: 'Emergency AI', desc: 'SOS, evacuation, lost child, incident reporting', href: '/emergency' },
  { icon: '♻️', title: 'Sustainability', desc: 'Carbon tracking, green travel, waste reduction', href: '/sustainability' },
  { icon: '📊', title: 'Operations', desc: 'Live dashboard, AI insights, risk alerts', href: '/operations' },
];

const STATS = [
  { value: '48', label: 'Teams' },
  { value: '104', label: 'Matches' },
  { value: '16', label: 'Venues' },
  { value: '3', label: 'Countries' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative min-h-[100vh] flex flex-col overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,191,165,0.06)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fifa-accent/30 to-transparent" />

        {/* Top Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fifa-accent to-yellow-500 flex items-center justify-center">
              <span className="text-fifa-navy font-black text-sm">W</span>
            </div>
            <div>
              <span className="text-base font-bold text-fifa-white tracking-tight">WORLD CUP</span>
              <span className="text-base font-light text-fifa-accent ml-1.5">2026</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-fifa-silver hover:text-fifa-white transition-colors font-medium">Sign In</Link>
            <Link href="/assistant" className="rounded-xl bg-fifa-accent text-fifa-navy px-6 py-2.5 text-sm font-bold hover:bg-yellow-400 transition-all">
              Launch App
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <main id="main-content" className="relative z-10 flex-1 flex items-center justify-center px-8 max-w-[1400px] mx-auto w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-fifa-silver mb-8 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-fifa-green animate-pulse" />
                AI-Powered Tournament Platform
              </div>

              <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[0.9] mb-6">
                <span className="text-fifa-white block">WE ARE</span>
                <span className="text-gradient-gold block">2026</span>
              </h1>

              <p className="text-lg text-fifa-silver max-w-xl mx-auto mb-10 leading-relaxed">
                AI-powered smart stadium platform enhancing fan experience, operations, accessibility, and safety across all 16 venues in the United States, Canada, and Mexico.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Link href="/matches" className="rounded-xl bg-fifa-accent text-fifa-navy px-8 py-3.5 text-sm font-bold hover:bg-yellow-400 hover:shadow-gold-glow hover:-translate-y-0.5 transition-all">
                  View Matches →
                </Link>
                <Link href="/operations" className="rounded-xl border border-white/15 bg-white/5 text-fifa-white px-8 py-3.5 text-sm font-medium hover:bg-white/10 transition-all">
                  Operations Dashboard
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden max-w-2xl mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-fifa-navy/60 backdrop-blur-sm p-6 text-center">
                  <p className="text-3xl font-black text-fifa-white">{stat.value}</p>
                  <p className="text-xs text-fifa-silver mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </main>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <svg className="h-6 w-6 text-fifa-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-24 px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xs text-fifa-accent font-bold uppercase tracking-[0.2em] mb-3">Platform Features</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-fifa-white tracking-tight">Everything you need</motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => (
            <Link key={feat.href} href={feat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-fifa-accent/20 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
              >
                <span className="text-3xl mb-4 block" role="img" aria-hidden="true">{feat.icon}</span>
                <h3 className="text-base font-bold text-fifa-white group-hover:text-fifa-accent transition-colors">{feat.title}</h3>
                <p className="text-sm text-fifa-silver mt-1.5 leading-relaxed">{feat.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] py-12 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-fifa-accent/20 flex items-center justify-center">
              <span className="text-fifa-accent font-black text-xs">W</span>
            </div>
            <span className="text-sm text-fifa-silver">FIFA Smart Stadium 2026</span>
          </div>
          <div className="flex items-center gap-8 text-xs text-fifa-silver">
            <span>🌐 10 Languages</span>
            <span>♿ WCAG 2.1 AA</span>
            <span>🔒 Enterprise Security</span>
            <span>⚡ Real-time AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
