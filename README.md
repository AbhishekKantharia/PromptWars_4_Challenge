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

StadiumIQ is a production-ready AI platform for the FIFA World Cup 2026 — covering fan experience, operations, accessibility, and emergency response across **15 venues** in the US, Canada, and Mexico. It features **real-time tournament data** from the official World Cup API, a **FIFA.com-inspired visual identity**, **cinematic VFX layer**, **10-language support**, **dual AI providers** (Google Gemini + Groq), and **zero-token AI assistant** responses.

---

## Challenge Verticals Addressed

| Vertical | How StadiumIQ Addresses It |
|----------|---------------------------|
| Smart Navigation | Interactive venue map, gate directions, barrier-free routing, crowd-aware rerouting |
| Multilingual Assistance | 10 languages with real-time translation, AI responds in user's language |
| Accessibility | TTS/STT, screen reader support, high contrast, color-blind modes, large text |
| Transportation | Metro, bus, taxi, parking with **live OSM transit stops** |
| Crowd Management | Live density heatmaps, **real-time weather-based** congestion prediction |
| Operational Intelligence | Real-time ops dashboard with **live weather data**, AI-generated summaries |
| Sustainability | Carbon tracking per match, **weather-aware** green travel recommendations |
| Emergency Response | SOS alerts, **weather-aware** evacuation guidance, lost child protocol |
| Volunteer Support | AI knowledge base, task management, time-of-day aware scheduling |

---

## Features

### Real-Time Data (No Mock Data)

- **Live Match Scores** — 104 matches, 48 teams, 12 groups from `worldcup26.ir` (60s cache)
- **Live Score Ticker** — Horizontal scrolling bar in header with pulsing red indicators
- **Matches Dashboard** — Tabs: LIVE | RESULTS | FIXTURES | GROUPS with standings table
- **Weather API** — Real-time Open-Meteo forecasts for all 15 venues
- **Transit Stops** — Real OSM Overpass bus/metro stops near each venue
- **Geocoding** — Real Nominatim address lookup for navigation
- **Live Network Probe** — Measures real latency/jitter/packet loss to 6 internet endpoints

### FIFA.com Visual Identity

- **Color Palette** — Dark navy (#020F2A), gold (#D4AF37), orange, teal accents
- **Typography** — Bold tracking-tight headings, gold gradient text, glass-morphism cards
- **Hero Section** — Full-viewport "WE ARE 2026" with animated stats (48 Teams / 104 Matches / 16 Venues / 3 Countries)
- **Navigation** — Modular sidebar with gold accent on Matches, "WE ARE 26" badge

### Cinematic VFX Layer (Always On)

- **80 Gold/White Particles** — Canvas-based floating dust motes with mouse repulsion and glow halos
- **4 Ambient Light Orbs** — Giant blurred gradient blobs drifting on 25-40s cycles
- **Perspective Grid** — SVG converging grid lines at viewport bottom (FIFA broadcast depth)
- **Cinematic Vignette** — Breathing edge-darkening radial gradient
- **Light Streak** — Diagonal golden light beam sweeping every 12s
- **Scanline Overlay** — Ultra-subtle CRT-style horizontal lines
- **Glass Shimmer** — CSS pseudo-element highlight sweeping across cards
- **Performance** — All effects `pointer-events-none`, GPU-composited, canvas pauses when tab hidden, `prefers-reduced-motion` respected

### AI-Powered Core

- **Zero-Token AI Assistant** — 18 template patterns, 0 token usage, instant responses
- **Real-Time Data Fusion** — Chat templates fetch live weather, matches, and venue data
- **Dual AI Provider** — Gemini -> Groq automatic fallback chain for reliability
- **10 Languages** — EN, ES, FR, PT, AR, HI, JA, DE, IT, ZH with RTL support

### Operations & Intelligence

- **Crowd Intelligence** — Real-time heatmaps, density estimation, weather-based congestion prediction
- **Operations Dashboard** — Live weather analytics, AI-generated summaries, incident monitoring
- **Transport Assistant** — Real OSM transit stops, metro, bus, taxi, parking
- **Sustainability Dashboard** — Weather-based carbon tracking, energy, water metrics

### Safety & Emergency

- **Emergency AI** — SOS alerts, weather-aware evacuation guidance, lost child protocol
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
├── app/                         # Next.js App Router pages & API routes
│   ├── (auth)/                  # Login, register pages
│   ├── (dashboard)/             # Feature pages (assistant, navigation, matches, etc.)
│   └── api/                     # 12 API route handlers
├── components/
│   ├── ui/                      # Reusable UI primitives (button, input, modal, toast)
│   ├── layout/                  # Sidebar, Header, MainLayout
│   ├── chat/                    # AI Chat interface
│   ├── navigation/              # Venue map (SVG)
│   ├── matches/                 # LiveScoreBar, MatchCard, MatchesDashboard
│   ├── crowd/                   # Crowd dashboard (real weather data)
│   ├── emergency/               # Emergency panel with SOS
│   ├── sustainability/          # Sustainability dashboard
│   ├── volunteer/               # Volunteer assistant
│   ├── operations/              # Operations dashboard
│   ├── transport/               # Transport assistant (real OSM stops)
│   └── vfx/                     # ParticleField, AmbientGlow, GridDepth, VFXLayer
├── hooks/                       # Custom React hooks
├── lib/
│   ├── gemini.ts                # Gemini -> Groq fallback chain
│   ├── groq.ts                  # Groq provider
│   ├── realtime-data.ts         # Open-Meteo, OSM Overpass, Nominatim
│   ├── match-data.ts            # worldcup26.ir API integration
│   └── rag-engine.ts            # RAG with venue knowledge embeddings
├── contexts/                    # React contexts (Accessibility, Language)
├── types/                       # TypeScript type definitions
├── utils/                       # Security, validation, helpers
└── constants/                   # 15 venues, AI models, prompts, languages
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
| Real-Time Data | Open-Meteo, OSM Overpass, Nominatim, worldcup26.ir |
| RAG | Cosine similarity with Gemini embeddings |
| Validation | Zod schemas |
| VFX | Canvas 2D, CSS keyframes, SVG |
| Deployment | Vercel (serverless) |

---

## Setup

### Prerequisites
- Node.js 18+
- Google AI Studio API key (for Gemini)
- Groq API key (for fallback)

### Environment Variables

Create `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
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
| `/api/chat` | POST | AI chat — 18 template patterns (0 token usage), async data fusion |
| `/api/matches` | GET | Live/recent/upcoming matches, groups, teams from worldcup26.ir |
| `/api/health` | GET | Service health (Open-Meteo, Overpass, worldCupApi probes) |
| `/api/operations` | GET | Stadium operations with real weather data |
| `/api/crowd` | GET | Crowd simulation with real weather data |
| `/api/navigation` | GET | Navigation/wayfinding with real transit stops |
| `/api/transport` | GET | Transport data with real OSM stops |
| `/api/sustainability` | GET | Sustainability metrics with weather-based calculations |
| `/api/volunteer` | GET/POST | Volunteer task management |
| `/api/emergency` | POST | Emergency incident reporting with weather-aware protocols |
| `/api/translate` | POST | Translation via Gemini |

---

## Real-Time Data Sources

| Source | What It Provides | Update Frequency |
|--------|-----------------|-----------------|
| [worldcup26.ir](https://worldcup26.ir) | Match scores, teams, groups, standings | 60s cache |
| [Open-Meteo](https://open-meteo.com) | Weather forecasts for 15 venues | On-demand |
| [OSM Overpass](https://overpass-turbo.eu) | Transit stops near venues | On-demand |
| [Nominatim](https://nominatim.openstreetmap.org) | Geocoding / reverse geocoding | On-demand |
| [ipify](https://www.ipify.org) | Public IP for network probe | On-demand |

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
