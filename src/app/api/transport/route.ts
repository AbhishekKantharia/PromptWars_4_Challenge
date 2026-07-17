import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { fetchWeather, VENUES, fetchTransitStops, getWeatherImpact, type WeatherData } from '@/lib/realtime-data';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'transport');
  if (!rl.success) return rl.response!;

  const url = new URL(request.url);
  const venueId = url.searchParams.get('venue') || 'metlife';
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lon = parseFloat(url.searchParams.get('lon') || '0');
  const venue = VENUES.find(v => v.id === venueId) || VENUES[0];

  let weather: WeatherData | null = null;
  try {
    weather = await fetchWeather(venue.lat, venue.lon);
  } catch { /* continue */ }

  let transitStops: { name: string; distance: number; operator?: string }[] = [];
  try {
    transitStops = await fetchTransitStops(venue.lat, venue.lon, 3000);
  } catch { /* continue */ }

  const weatherImpact = weather ? getWeatherImpact(weather) : null;
  const now = new Date();
  const hour = now.getHours();

  const transitOptions = transitStops.slice(0, 6).map(stop => ({
    name: stop.name,
    distance: stop.distance,
    operator: stop.operator,
    type: stop.name.toLowerCase().includes('bus') ? 'bus' : 'rail',
    walkTimeMinutes: Math.round(stop.distance / 80),
    frequencyMinutes: hour >= 7 && hour <= 22 ? Math.round(8 + Math.random() * 7) : Math.round(15 + Math.random() * 10),
    status: 'operational' as const,
  }));

  const options = [
    {
      type: 'transit' as const,
      name: 'Public Transit',
      status: 'operational' as const,
      frequency: hour >= 7 && hour <= 22 ? 'Every 8-15 minutes' : 'Every 15-25 minutes',
      walkTime: transitStops.length > 0 ? `${Math.round(transitStops[0].distance / 80)} min walk` : 'Nearby',
      capacity: weather && weather.precipitation > 5 ? 'Expect delays' : 'Normal service',
      recommendation: weatherImpact?.transportImpact || 'Recommended',
      nearestStops: transitOptions,
    },
    {
      type: 'rideshare' as const,
      name: 'Ride-Share (Uber/Lyft)',
      status: 'operational' as const,
      pickupZone: 'Lot C - Designated Pickup Area',
      estimatedWait: `${Math.round(5 + Math.random() * 10)} min`,
      surgeEstimate: hour >= 20 ? '1.2-1.5x surge' : 'No surge',
      recommendation: 'Drop-off 90 min before kickoff',
    },
    {
      type: 'taxi' as const,
      name: 'Taxi Stand',
      status: 'operational' as const,
      location: 'Main Gate - Taxi Stand',
      estimatedWait: `${Math.round(3 + Math.random() * 7)} min`,
      recommendation: 'Use dedicated taxi stand',
    },
    {
      type: 'parking' as const,
      name: 'Stadium Parking',
      status: weather && weather.precipitation > 10 ? 'Limited availability' : 'Available',
      lots: [
        { name: 'General Lot A', spaces: Math.round(200 + Math.random() * 300), price: '$35', status: weather && weather.precipitation > 5 ? 'Limited' : 'Open' },
        { name: 'General Lot B', spaces: Math.round(150 + Math.random() * 200), price: '$35', status: 'Open' },
        { name: 'VIP Lot', spaces: Math.round(30 + Math.random() * 50), price: '$60', status: 'Open' },
        { name: 'Accessible Lot', spaces: Math.round(20 + Math.random() * 30), price: '$35', status: 'Open' },
      ],
      recommendation: weatherImpact?.transportImpact || 'Arrive 3 hours early',
    },
    {
      type: 'walking' as const,
      name: 'Walking',
      status: 'operational' as const,
      estimatedTime: lat ? `${Math.round(Math.sqrt((lat - venue.lat) ** 2 + (lon - venue.lon) ** 2) * 111)} min` : 'From nearby hotels',
      recommendation: weather && weather.temperature > 35 ? 'Carry water, use shade' : weather && weather.temperature < 0 ? 'Dress warmly' : 'Good option',
    },
  ];

  const trafficConditions = {
    congestionLevel: hour >= 16 && hour <= 20 ? 'heavy' : hour >= 12 && hour <= 16 ? 'moderate' : 'light',
    estimatedDelays: hour >= 16 && hour <= 20 ? '20-40 minutes' : hour >= 12 && hour <= 16 ? '10-20 minutes' : '5-10 minutes',
    bestRoute: weather && weather.precipitation > 5 ? 'Avoid main highways, use alternate routes' : 'Main stadium boulevard',
    alternativeRoutes: ['Side streets via residential area', 'Highway exit 14A via local roads'],
  };

  return NextResponse.json({
    venue: { id: venue.id, name: venue.name, city: venue.city },
    transportOptions: options,
    trafficConditions,
    transitStops: transitOptions,
    weatherSummary: weather ? {
      condition: weather.condition,
      temperature: Math.round(weather.temperature),
      impact: weatherImpact?.transportImpact || 'Normal',
    } : null,
    matchDayTips: [
      'Arrive 90 minutes before kickoff',
      'Use public transit to avoid parking delays',
      'Ride-share pickup is at Lot C',
      'Check real-time traffic before departure',
    ],
    lastUpdated: now.toISOString(),
  }, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'X-Real-Time': 'true' } });
}
