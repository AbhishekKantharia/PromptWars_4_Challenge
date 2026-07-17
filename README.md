# StadiumIQ — FIFA World Cup 2026 Smart Stadium Platform

> AI-Powered Smart Stadium & Tournament Operations for the FIFA World Cup 2026

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0-4285f4?style=for-the-badge)](https://ai.google.dev)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-ff6b35?style=for-the-badge)](https://groq.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge)](https://smart-stadium-2026.vercel.app)

**Live URL:** https://smart-stadium-2026.vercel.app

---

## Overview

StadiumIQ is a production-ready AI platform for FIFA World Cup 2026 fan experience, operations, accessibility, and emergency response. It covers **15 venues** across the US, Canada, and Mexico, with **10-language support**, **dual AI providers** (Google Gemini + Groq), and **WCAG 2.1 AA accessibility**.

---

## Challenge Verticals Addressed

| Vertical | How StadiumIQ Addresses It |
|----------|---------------------------|
| Smart Navigation | Interactive venue map, gate directions, barrier-free routing, crowd-aware rerouting |
| Multilingual Assistance | 10 languages with real-time translation, AI responds in user's language |
| Accessibility | TTS/STT, screen reader support, high contrast, color-blind modes, large text |
| Transportation | Metro, bus, taxi, parking with live availability data |
| Crowd Management | Live density heatmaps, congestion prediction, gate-level alerts |
| Operational Intelligence | Real-time ops dashboard, AI-generated summaries, incident monitoring |
| Sustainability | Carbon tracking per match, green travel recommendations |
| Emergency Response | SOS alerts, evacuation guidance, lost child protocol, incident reporting |
| Volunteer Support | AI knowledge base, task management, incident reporting with Zod validation |

---

## Features

### AI-Powered Core
- **Stadium Assistant** — Natural conversation via Google Gemini 2.0 Flash (with Groq Llama 3.3 fallback)
- **RAG Engine** — Retrieval-Augmented Generation with venue knowledge embeddings
- **Multilingual Support** — 10 languages (EN, ES, FR, PT, AR, HI, JA, DE, IT, ZH) with RTL support
- **Dual AI Provider** — Gemini → Groq automatic fallback chain for reliability

### Operations & Intelligence
- **Crowd Intelligence** — Real-time heatmaps, density estimation, congestion prediction
- **Operations Dashboard** — Live analytics, AI-generated summaries, incident monitoring
- **Transport Assistant** — Metro, bus, taxi, parking with live availability
- **Sustainability Dashboard** — Carbon tracking, green travel, reusable cup progress

### Safety & Emergency
- **Emergency AI** — SOS alerts, evacuation guidance, lost child protocol
- **Incident Reporting** — Structured reporting with prompt injection detection
- **Input Sanitization** — All emergency inputs validated and sanitized

### Accessibility
- **WCAG 2.1 AA** compliant
- **ARIA labels** on all interactive elements
- **Keyboard navigation** with focus management
- **Skip-to-content** link
- **High contrast / Color-blind / Large text modes**
- **Text-to-Speech / Speech-to-Text**

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Login, register pages
│   ├── (dashboard)/        # Feature pages (assistant, navigation, etc.)
│   └── api/                # 11 API route handlers
├── components/
│   ├── ui/                 # Reusable UI primitives (button, input, modal, toast)
│   ├── layout/             # Sidebar, Header, MainLayout
│   ├── chat/               # AI Chat interface
│   ├── navigation/         # Venue map (SVG)
│   ├── crowd/              # Crowd dashboard
│   ├── emergency/          # Emergency panel with SOS
│   ├── sustainability/     # Sustainability dashboard
│   ├── volunteer/          # Volunteer assistant
│   ├── operations/         # Operations dashboard
│   └── transport/          # Transport assistant
├── hooks/                  # Custom React hooks
├── lib/                    # Core libraries (Gemini, Groq, RAG, Crowd Engine)
├── contexts/               # React contexts (Accessibility, Language)
├── types/                  # TypeScript type definitions
├── utils/                  # Security, validation, helpers
└── constants/              # 15 venues, AI models, prompts, languages
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4, Framer Motion |
| AI (Primary) | Google Gemini 2.0 Flash |
| AI (Fallback) | Groq Llama 3.3 70B Versatile |
| RAG | Cosine similarity with Gemini embeddings |
| Auth | Firebase Authentication |
| Validation | Zod schemas |
| Deployment | Vercel (serverless) |

---

## Setup

### Prerequisites
- Node.js 18+
- Google AI Studio API key (for Gemini)
- Groq API key (optional, for fallback)

### Environment Variables

Create `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### Installation

```bash
git clone https://github.com/AbhishekKantharia/PromptWars_4_Challenge.git
cd PromptWars_4_Challenge
npm install
npm run dev
```

Open http://localhost:3000

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI chat with Gemini/Groq fallback |
| `/api/operations` | GET | Stadium operations summary |
| `/api/transport` | GET | Transport data with AI insights |
| `/api/operations` | GET | Real-time operations dashboard |
| `/api/crowd` | GET | Crowd simulation data |
| `/api/navigation` | GET | Navigation/wayfinding data |
| `/api/sustainability` | GET | Sustainability metrics |
| `/api/volunteer` | GET/POST | Volunteer task management |
| `/api/emergency` | POST | Emergency incident reporting |
| `/api/translate` | POST | Translation via Gemini |
| `/api/health` | GET | Service health check |

---

## Security

- **Content Security Policy** — `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`
- **HSTS** — `max-age=63072000; includeSubDomains; preload`
- **CORS** — Restricted to Vercel origins
- **Rate Limiting** — 30 chat/min, 100 API/min, 5 emergency/5min
- **Prompt Injection Detection** — 12 pattern detection for AI inputs
- **Input Sanitization** — XSS prevention on all user inputs
- **Zod Validation** — Schema-based validation with coordinate bounds
- **API Key Safety** — Never logged, masked in errors

---

## Testing

```bash
npm run lint          # ESLint
npm run build         # Production build verification
```

---

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

---

## Venues (15)

| Stadium | City | Capacity |
|---------|------|----------|
| MetLife Stadium | New York / New Jersey | 82,500 |
| SoFi Stadium | Los Angeles | 70,240 |
| AT&T Stadium | Dallas | 80,000 |
| Arrowhead Stadium | Kansas City | 76,416 |
| NRG Stadium | Houston | 72,220 |
| Hard Rock Stadium | Miami | 64,767 |
| Lumen Field | Seattle | 68,740 |
| Levi's Stadium | San Francisco | 68,500 |
| Gillette Stadium | Boston | 65,878 |
| Lincoln Financial Field | Philadelphia | 69,176 |
| BMO Field | Toronto | 30,000 |
| Estadio Azteca | Mexico City | 87,000 |
| Estadio BBVA | Monterrey | 53,500 |
| Mercedes-Benz Stadium | Atlanta | 71,000 |
| BC Place | Vancouver | 54,500 |

---

## License

MIT
