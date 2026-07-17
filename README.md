# FIFA Smart Stadium 2026

> AI-Powered Smart Stadium & Tournament Operations Platform for the FIFA World Cup 2026

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.0-4285f4)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-11-ffca28)](https://firebase.google.com)

## Overview

An intelligent GenAI-powered platform that enhances fan experience, stadium operations, accessibility, and emergency response for the FIFA World Cup 2026 across 12 venues in the US, Canada, and Mexico.

## Features

### Core AI Features
- **AI Stadium Assistant** — Natural conversation via Google Gemini with RAG-powered venue knowledge
- **Multilingual Support** — 10 languages with real-time Gemini translation
- **Intelligent Navigation** — Indoor maps, barrier-free routes, crowd-aware rerouting

### Operations
- **Crowd Intelligence** — Real-time heatmaps, density estimation, congestion prediction
- **Operations Dashboard** — Live analytics, AI-generated summaries, incident monitoring
- **Transport Assistant** — Metro, bus, taxi, parking with live availability

### Safety & Accessibility
- **Emergency AI** — SOS alerts, evacuation guidance, lost child protocol, incident reporting
- **Accessibility Assistant** — TTS/STT, screen reader support, high contrast, color-blind modes
- **Volunteer Hub** — AI knowledge base, task management, incident reporting

### Sustainability
- **Carbon Tracking** — Per-match carbon footprint estimation
- **Green Travel** — Eco-friendly transport recommendations with emission savings

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Login, register pages
│   ├── (dashboard)/        # Feature pages (assistant, navigation, etc.)
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Sidebar, Header, MainLayout
│   ├── chat/               # AI Chat interface
│   ├── navigation/         # Venue map
│   ├── crowd/              # Crowd dashboard
│   ├── transport/          # Transport assistant
│   ├── accessibility/      # Accessibility panel
│   ├── emergency/          # Emergency panel
│   ├── sustainability/     # Sustainability dashboard
│   ├── volunteer/          # Volunteer assistant
│   └── operations/         # Operations dashboard
├── hooks/                  # Custom React hooks
├── lib/                    # Core libraries (Firebase, Gemini, RAG, Crowd Engine)
├── contexts/               # React contexts (Accessibility, Language)
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── constants/              # App constants and AI prompts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript 5.6 |
| Styling | Tailwind CSS 3.4, Framer Motion |
| AI | Google Gemini 2.0 Flash, RAG with Embeddings |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Maps | Google Maps Platform |
| State | React Context, React Query |
| Testing | Jest, Playwright, Testing Library |
| Deployment | Vercel / Firebase Hosting |

## Setup

### Prerequisites
- Node.js 18+
- Google Cloud project with Gemini API enabled
- Firebase project

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required keys:
- `GEMINI_API_KEY` — Google AI Studio API key
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_*` — Firebase Admin SDK credentials
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

```bash
npm run test          # Unit + Component tests
npm run test:coverage # With coverage report
npm run test:e2e      # End-to-end with Playwright
npm run typecheck     # TypeScript check
npm run lint          # ESLint
```

## Deployment

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## Security

- Content Security Policy headers
- Rate limiting on all API endpoints
- Prompt injection detection for AI inputs
- Input sanitization and validation (Zod)
- CSRF protection via Origin validation
- XSS prevention via React escaping + headers
- Environment variable isolation

## Accessibility

- WCAG 2.1 AA compliant
- ARIA labels on all interactive elements
- Keyboard navigation support
- Skip-to-content link
- Screen reader optimized
- High contrast mode
- Large text mode
- Color-blind mode (protanopia, deuteranopia, tritanopia)
- Text-to-speech / Speech-to-text
- Reduced motion support

## License

MIT
