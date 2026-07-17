import { NextResponse } from 'next/server';
import { VENUES } from '@/lib/realtime-data';

export async function GET() {
  let weatherOk = false;
  let overpassOk = false;
  let matchApiOk = false;

  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.81&longitude=-74.07&current=temperature_2m&timezone=auto', { signal: AbortSignal.timeout(5000) });
    weatherOk = res.ok;
  } catch { /* weather down */ }

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=[out:json][timeout:3];node(0,0,0.01,0.01);out 1;',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(8000),
    });
    overpassOk = res.ok;
  } catch { /* overpass down */ }

  try {
    const res = await fetch('https://worldcup26.ir/get/games', { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      matchApiOk = Array.isArray(data?.games || data?.data) && (data.games || data.data).length > 0;
    }
  } catch { /* match api down */ }

  return NextResponse.json({
    status: 'healthy',
    version: '2.0.0',
    timestamp: Date.now(),
    dataSources: {
      openMeteo: weatherOk,
      overpassOSM: overpassOk,
      nominatim: true,
      worldCupApi: matchApiOk,
    },
    aiServices: {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
    },
    venues: VENUES.length,
    endpoints: [
      '/api/matches', '/api/navigation', '/api/crowd', '/api/transport',
      '/api/sustainability', '/api/operations', '/api/volunteer',
      '/api/emergency', '/api/chat',
    ],
  });
}
