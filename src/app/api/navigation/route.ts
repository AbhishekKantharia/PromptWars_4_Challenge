import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { fetchWeather, VENUES, getVenueById, getWeatherImpact, reverseGeocode, fetchNearbyPlaces, type WeatherData } from '@/lib/realtime-data';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'navigation');
  if (!rl.success) return rl.response!;

  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lon = parseFloat(url.searchParams.get('lon') || '0');
  const venueId = url.searchParams.get('venue') || 'metlife';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon query params required' }, { status: 400 });
  }

  const venue = getVenueById(venueId) || VENUES[0];

  let weather: WeatherData | null = null;
  let venueAddress = venue.name;
  let nearbyRestrooms: { name: string; distance: number }[] = [];
  let nearbyRestaurants: { name: string; distance: number }[] = [];

  try {
    weather = await fetchWeather(venue.lat, venue.lon);
  } catch { /* continue without weather */ }

  try {
    venueAddress = await reverseGeocode(venue.lat, venue.lon);
  } catch { /* continue with venue name */ }

  try {
    const [restrooms, restaurants] = await Promise.all([
      fetchNearbyPlaces(lat, lon, 'toilets', 2000),
      fetchNearbyPlaces(lat, lon, 'restaurant', 2000),
    ]);
    nearbyRestrooms = restrooms.slice(0, 5).map(r => ({ name: r.name, distance: Math.round(r.distance) }));
    nearbyRestaurants = restaurants.slice(0, 5).map(r => ({ name: r.name, distance: Math.round(r.distance) }));
  } catch { /* continue without nearby data */ }

  const distanceToVenueMeters = Math.round(
    6371000 * Math.acos(
      Math.cos((lat * Math.PI) / 180) * Math.cos((venue.lat * Math.PI) / 180) *
      Math.cos(((venue.lon - lon) * Math.PI) / 180) +
      Math.sin((lat * Math.PI) / 180) * Math.sin((venue.lat * Math.PI) / 180)
    )
  );
  const walkTimeMinutes = Math.round(distanceToVenueMeters / 80);

  const weatherImpact = weather ? getWeatherImpact(weather) : null;

  return NextResponse.json({
    venue: {
      id: venue.id,
      name: venue.name,
      address: venueAddress,
      coordinates: { lat: venue.lat, lon: venue.lon },
      capacity: venue.capacity,
      city: venue.city,
    },
    userLocation: {
      latitude: lat,
      longitude: lon,
      distanceToVenueMeters,
      walkTimeMinutes,
    },
    weather: weather ? {
      condition: weather.condition,
      temperature: Math.round(weather.temperature),
      humidity: weather.humidity,
      windSpeed: Math.round(weather.windSpeed),
      uvIndex: weather.uvIndex,
      precipitation: weather.precipitation,
      visibility: weather.visibility,
    } : null,
    weatherImpact,
    nearbyAmenities: {
      restrooms: nearbyRestrooms,
      restaurants: nearbyRestaurants,
    },
    navigationTips: [
      'Follow the stadium signs from major roads',
      'Main gates open 2 hours before kickoff',
      'Use the interactive map for walking routes',
      ...(weatherImpact?.safetyNotes || []),
    ],
    lastUpdated: new Date().toISOString(),
  });
}
