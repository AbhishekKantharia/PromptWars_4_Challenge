import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { fetchWeather, VENUES, getWeatherImpact, type WeatherData } from '@/lib/realtime-data';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'crowd');
  if (!rl.success) return rl.response!;

  const url = new URL(request.url);
  const venueId = url.searchParams.get('venue') || 'metlife';
  const venue = VENUES.find(v => v.id === venueId) || VENUES[0];

  let weather: WeatherData | null = null;
  try {
    weather = await fetchWeather(venue.lat, venue.lon);
  } catch { /* continue without weather */ }

  const now = new Date();
  const hour = now.getHours();
  const weatherImpact = weather ? getWeatherImpact(weather) : null;

  const baseOccupancy = venue.capacity * 0.65;
  let hourMultiplier = 1.0;
  if (hour >= 18 && hour <= 22) hourMultiplier = 1.4;
  else if (hour >= 14 && hour <= 17) hourMultiplier = 1.15;
  else if (hour >= 10 && hour <= 13) hourMultiplier = 0.9;
  else hourMultiplier = 0.5;

  const weatherFactor = weather
    ? (weather.precipitation > 5 ? 0.85 : weather.temperature > 35 ? 0.9 : weather.weatherCode >= 95 ? 0.7 : 1.0)
    : 1.0;

  const currentOccupancy = Math.round(baseOccupancy * hourMultiplier * weatherFactor);
  const occupancyPercent = Math.round((currentOccupancy / venue.capacity) * 100);
  const capacityStatus = occupancyPercent > 90 ? 'near_capacity' : occupancyPercent > 70 ? 'high' : occupancyPercent > 40 ? 'moderate' : 'low';

  const sections = Array.from({ length: 8 }, (_, i) => {
    const sectionMultiplier = 0.6 + Math.random() * 0.6;
    const sectionOccupancy = Math.round((currentOccupancy / 8) * sectionMultiplier);
    const sectionCapacity = Math.round(venue.capacity / 8);
    const sectionPercent = Math.round((sectionOccupancy / sectionCapacity) * 100);
    const risk = sectionPercent > 90 ? 'critical' : sectionPercent > 75 ? 'high' : sectionPercent > 50 ? 'moderate' : 'low';
    return {
      name: ['North Stand', 'South Stand', 'East Stand', 'West Stand', 'North VIP', 'South VIP', 'East Concourse', 'West Concourse'][i],
      current: sectionOccupancy,
      capacity: sectionCapacity,
      percentFull: sectionPercent,
      risk,
      waitTimeMinutes: risk === 'critical' ? Math.round(10 + Math.random() * 15) : risk === 'high' ? Math.round(5 + Math.random() * 10) : 0,
    };
  });

  const alerts: { severity: string; message: string; section?: string }[] = [];
  sections.forEach(s => {
    if (s.risk === 'critical') alerts.push({ severity: 'critical', message: `${s.name} at ${s.percentFull}% capacity — severe congestion`, section: s.name });
    if (s.risk === 'high') alerts.push({ severity: 'high', message: `${s.name} at ${s.percentFull}% — high congestion expected`, section: s.name });
  });

  if (weatherImpact) {
    weatherImpact.safetyNotes.forEach(note => {
      alerts.push({ severity: 'info', message: note });
    });
  }

  return NextResponse.json({
    venue: { id: venue.id, name: venue.name, capacity: venue.capacity },
    currentOccupancy,
    totalCapacity: venue.capacity,
    percentFull: occupancyPercent,
    capacityStatus,
    sections,
    alerts,
    weatherSummary: weather ? {
      condition: weather.condition,
      temperature: Math.round(weather.temperature),
      humidity: weather.humidity,
      impact: weatherImpact?.crowdImpact || 'Normal',
    } : null,
    crowdFlow: {
      entranceRate: Math.round(120 + Math.random() * 80),
      exitRate: Math.round(50 + Math.random() * 40),
      avgDwellMinutes: Math.round(90 + Math.random() * 60),
    },
    lastUpdated: now.toISOString(),
  }, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'X-Real-Time': 'true' } });
}
