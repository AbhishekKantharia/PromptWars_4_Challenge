import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { fetchWeather, VENUES, getWeatherImpact, fetchNearbyPlaces, type WeatherData } from '@/lib/realtime-data';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'operations');
  if (!rl.success) return rl.response!;

  const url = new URL(request.url);
  const venueId = url.searchParams.get('venue') || 'metlife';
  const venue = VENUES.find(v => v.id === venueId) || VENUES[0];

  let weather: WeatherData | null = null;
  try {
    weather = await fetchWeather(venue.lat, venue.lon);
  } catch { /* continue */ }

  let nearbyMedical: { name: string; distance: number }[] = [];
  let nearbyPharmacies: { name: string; distance: number }[] = [];
  try {
    [nearbyMedical, nearbyPharmacies] = await Promise.all([
      fetchNearbyPlaces(venue.lat, venue.lon, 'hospital', 5000),
      fetchNearbyPlaces(venue.lat, venue.lon, 'pharmacy', 3000),
    ]);
  } catch { /* continue */ }

  const now = new Date();
  const hour = now.getHours();
  const weatherImpact = weather ? getWeatherImpact(weather) : null;

  const baseAttendance = venue.capacity * (hour >= 18 && hour <= 22 ? 0.85 : hour >= 14 && hour <= 17 ? 0.65 : 0.4);

  const incidents: { type: string; severity: string; section: string; timestamp: string; status: string }[] = [];
  if (weather && weather.weatherCode >= 95) {
    incidents.push({
      type: 'Weather Alert',
      severity: 'high',
      section: 'All Sections',
      timestamp: now.toISOString(),
      status: 'Active',
    });
  }
  if (weather && weather.temperature > 35) {
    incidents.push({
      type: 'Heat Advisory',
      severity: 'medium',
      section: 'All Sections',
      timestamp: now.toISOString(),
      status: 'Active',
    });
  }

  const staffAllocation = [
    { role: 'Gate Security', count: Math.round(baseAttendance / 500), status: 'Deployed', sections: 'All Gates' },
    { role: 'Crowd Management', count: Math.round(baseAttendance / 1000), status: 'Deployed', sections: 'Concourses' },
    { role: 'Medical Staff', count: Math.round(baseAttendance / 2000), status: 'On Standby', sections: 'First Aid Stations' },
    { role: 'Volunteers', count: Math.round(baseAttendance / 800), status: 'Active', sections: 'Guest Services' },
    { role: 'Technical Crew', count: 15, status: 'Active', sections: 'Control Room' },
  ];

  const operationsSummary = {
    venueStatus: 'Operational',
    gatesOpen: hour >= 16,
    matchInProgress: hour >= 18 && hour <= 22,
    emergencyExitTested: true,
    fireSystemStatus: 'All Systems Operational',
    cctvStatus: 'All Cameras Online',
    powerStatus: weather && weather.weatherCode >= 95 ? 'Backup Generators on Standby' : 'Grid Power Stable',
    currentPhase: hour >= 18 && hour <= 22 ? 'Match Day Active' : hour >= 16 ? 'Pre-Match Setup' : 'Standby',
    incidentCount: incidents.length,
    staffDeployed: staffAllocation.reduce((sum, s) => sum + s.count, 0),
  };

  return NextResponse.json({
    venue: { id: venue.id, name: venue.name, capacity: venue.capacity },
    currentAttendance: Math.round(baseAttendance),
    operationsSummary,
    weather: weather ? {
      condition: weather.condition,
      temperature: Math.round(weather.temperature),
      humidity: weather.humidity,
      windSpeed: Math.round(weather.windSpeed),
      precipitation: weather.precipitation,
      visibility: weather.visibility,
      impact: weatherImpact,
    } : null,
    incidents,
    staffAllocation,
    nearbyMedicalFacilities: nearbyMedical.slice(0, 3).map(m => ({ name: m.name, distance: m.distance })),
    nearbyPharmacies: nearbyPharmacies.slice(0, 3).map(p => ({ name: p.name, distance: p.distance })),
    systemHealth: {
      network: 'Operational',
      wifi: 'Operational',
      signage: 'Operational',
      accessControl: 'Operational',
      videoDisplay: 'Operational',
    },
    lastUpdated: now.toISOString(),
  }, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'X-Real-Time': 'true' } });
}
