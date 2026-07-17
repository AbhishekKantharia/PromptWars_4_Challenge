import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { fetchWeather, VENUES, type WeatherData } from '@/lib/realtime-data';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'sustainability');
  if (!rl.success) return rl.response!;

  const url = new URL(request.url);
  const venueId = url.searchParams.get('venue') || 'metlife';
  const venue = VENUES.find(v => v.id === venueId) || VENUES[0];

  let weather: WeatherData | null = null;
  try {
    weather = await fetchWeather(venue.lat, venue.lon);
  } catch { /* continue */ }

  const now = new Date();
  const hour = now.getHours();
  const baseAttendance = venue.capacity * (hour >= 18 && hour <= 22 ? 0.85 : hour >= 14 && hour <= 17 ? 0.65 : 0.4);

  const transitRidership = Math.round(baseAttendance * 0.45);
  const carRiders = Math.round(baseAttendance * 0.35);
  const rideshareUsers = Math.round(baseAttendance * 0.12);
  const walkers = Math.round(baseAttendance * 0.08);

  const carEmissionsKg = carRiders * 2.3;
  const transitEmissionsKg = transitRidership * 0.5;
  const rideshareEmissionsKg = rideshareUsers * 1.2;
  const walkerEmissionsKg = 0;
  const totalEmissionsKg = carEmissionsKg + transitEmissionsKg + rideshareEmissionsKg + walkerEmissionsKg;
  const emissionsPerCapita = totalEmissionsKg / baseAttendance;

  const estimatedEnergyKwh = baseAttendance * 0.15 + (weather && weather.temperature > 30 ? baseAttendance * 0.05 : 0);
  const estimatedWaterLiters = baseAttendance * 2.5;
  const estimatedWasteKg = baseAttendance * 0.3;
  const recyclingRate = 0.62;
  const compostRate = 0.15;
  const landfillRate = 1 - recyclingRate - compostRate;

  const solarEstimate = weather && weather.condition.toLowerCase().includes('clear') ? 280 : weather && weather.condition.toLowerCase().includes('cloud') ? 150 : 80;

  return NextResponse.json({
    venue: { id: venue.id, name: venue.name, capacity: venue.capacity },
    currentAttendance: Math.round(baseAttendance),
    carbonFootprint: {
      totalKg: Math.round(totalEmissionsKg),
      perCapitaKg: Number(emissionsPerCapita.toFixed(2)),
      breakdown: {
        privateVehicle: { riders: carRiders, emissionsKg: Math.round(carEmissionsKg), percent: Math.round((carEmissionsKg / totalEmissionsKg) * 100) },
        publicTransit: { riders: transitRidership, emissionsKg: Math.round(transitEmissionsKg), percent: Math.round((transitEmissionsKg / totalEmissionsKg) * 100) },
        rideshare: { riders: rideshareUsers, emissionsKg: Math.round(rideshareEmissionsKg), percent: Math.round((rideshareEmissionsKg / totalEmissionsKg) * 100) },
        walking: { riders: walkers, emissionsKg: walkerEmissionsKg, percent: 0 },
      },
      transitSavingsKg: Math.round(carRiders * 1.8),
    },
    energy: {
      estimatedKwh: Math.round(estimatedEnergyKwh),
      solarGenerationKwh: solarEstimate,
      renewablePercent: Math.round((solarEstimate / estimatedEnergyKwh) * 100),
      weatherNote: weather ? `${weather.condition} — solar output ${solarEstimate > 200 ? 'optimal' : 'reduced'}` : 'Weather data unavailable',
    },
    water: {
      estimatedLiters: Math.round(estimatedWaterLiters),
      recyclingRate: 0.73,
      refillStations: 45,
      savedBottles: Math.round(baseAttendance * 0.4),
    },
    waste: {
      estimatedKg: Math.round(estimatedWasteKg),
      recyclingPercent: Math.round(recyclingRate * 100),
      compostPercent: Math.round(compostRate * 100),
      landfillPercent: Math.round(landfillRate * 100),
      binsAvailable: Math.round(baseAttendance / 200),
    },
    greenRecommendations: [
      transitRidership > carRiders ? 'Majority using transit — great impact!' : 'Use public transit to reduce emissions by 60%',
      'Bring a reusable water bottle',
      `Current weather: ${weather?.condition || 'Check forecast'} — ${weather && weather.temperature > 30 ? 'Stay hydrated' : weather && weather.precipitation > 0 ? 'Bring rain gear' : 'Enjoy the walk'}`,
      'Use recycling and compost bins',
      'Walk to nearby food courts after the match',
    ],
    lastUpdated: now.toISOString(),
  }, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'X-Real-Time': 'true' } });
}
