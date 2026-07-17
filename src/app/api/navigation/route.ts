import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { navigationRequestSchema } from '@/utils/validation';
import { haversineDistance, estimateWalkTime } from '@/utils/geometry';

const VENUE_AMENITIES = [
  { id: 'gate-n', name: 'North Gate', type: 'gate', lat: 40.8135, lng: -74.0745, accessible: true },
  { id: 'gate-s', name: 'South Gate', type: 'gate', lat: 40.8120, lng: -74.0745, accessible: true },
  { id: 'gate-e', name: 'East Gate', type: 'gate', lat: 40.8128, lng: -74.0730, accessible: true },
  { id: 'gate-w', name: 'West Gate', type: 'gate', lat: 40.8128, lng: -74.0760, accessible: false },
  { id: 'restroom-1', name: 'Restroom A (Concourse North)', type: 'restroom', lat: 40.8133, lng: -74.0742, accessible: true },
  { id: 'restroom-2', name: 'Restroom B (Concourse South)', type: 'restroom', lat: 40.8123, lng: -74.0748, accessible: true },
  { id: 'food-1', name: 'Main Food Court', type: 'food', lat: 40.8125, lng: -74.0750, accessible: true },
  { id: 'food-2', name: 'Gate E Food Stalls', type: 'food', lat: 40.8128, lng: -74.0733, accessible: true },
  { id: 'atm-1', name: 'ATM (North Lobby)', type: 'atm', lat: 40.8134, lng: -74.0746, accessible: true },
  { id: 'medical-1', name: 'First Aid Station', type: 'medical', lat: 40.8130, lng: -74.0740, accessible: true },
  { id: 'charging-1', name: 'Charging Station (VIP)', type: 'charging', lat: 40.8131, lng: -74.0744, accessible: false },
  { id: 'lost-1', name: 'Lost & Found', type: 'lost_found', lat: 40.8129, lng: -74.0752, accessible: true },
  { id: 'parking-a', name: 'Parking Lot A', type: 'parking', lat: 40.8140, lng: -74.0745, accessible: true },
  { id: 'elevator-1', name: 'Elevator (Section 100)', type: 'elevator', lat: 40.8132, lng: -74.0743, accessible: true },
  { id: 'wheelchair-1', name: 'Wheelchair Viewing Area', type: 'wheelchair', lat: 40.8127, lng: -74.0741, accessible: true },
];

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const body = Object.fromEntries(searchParams);
    const parsed = navigationRequestSchema.safeParse({
      origin: { latitude: parseFloat(body.latitude || '40.8128'), longitude: parseFloat(body.longitude || '-74.0745') },
      destination: body.destination || 'restroom',
      accessible: body.accessible === 'true',
      crowdAware: body.crowdAware !== 'false',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid navigation request' }, { status: 400 });
    }

    const { origin, destination, accessible } = parsed.data;

    let candidates = VENUE_AMENITIES.filter((a) => {
      const matchesType = a.type === destination || a.name.toLowerCase().includes(destination.toLowerCase());
      if (accessible) return matchesType && a.accessible;
      return matchesType;
    });

    if (candidates.length === 0) {
      candidates = VENUE_AMENITIES.filter((a) =>
        a.type === destination || a.name.toLowerCase().includes(destination.toLowerCase())
      );
    }

    const sorted = candidates
      .map((c) => {
        const dist = haversineDistance(
          { lat: origin.latitude, lng: origin.longitude },
          { lat: c.lat, lng: c.lng }
        );
        return { ...c, distance: dist, walkTime: estimateWalkTime(dist) };
      })
      .sort((a, b) => a.distance - b.distance);

    if (sorted.length === 0) {
      return NextResponse.json({ error: 'No matching destination found' }, { status: 404 });
    }

    const best = sorted[0];
    const route = {
      id: `route-${Date.now()}`,
      origin: { latitude: origin.latitude, longitude: origin.longitude, name: 'Your Location' },
      destination: { latitude: best.lat, longitude: best.lng, name: best.name },
      distance: Math.round(best.distance),
      estimatedTime: Math.round(best.walkTime),
      accessible: best.accessible,
      instructions: [
        { step: 1, text: `Head ${getDirection(origin, best)} towards ${best.name}` },
        { step: 2, text: `Walk approximately ${Math.round(best.distance)}m` },
        { step: 3, text: best.accessible ? 'This route is wheelchair accessible' : 'Note: This route may not be fully accessible' },
        { step: 4, text: `You will arrive at ${best.name} in about ${Math.round(best.walkTime / 60)} minute(s)` },
      ],
    };

    return NextResponse.json({
      route,
      alternatives: sorted.slice(1, 4).map((a) => ({
        name: a.name,
        distance: Math.round(a.distance),
        walkTime: Math.round(a.walkTime),
        accessible: a.accessible,
      })),
    });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json({ error: 'Navigation failed' }, { status: 500 });
  }
}

function getDirection(origin: { latitude: number; longitude: number }, dest: { lat: number; lng: number }): string {
  const dLat = dest.lat - origin.latitude;
  const dLng = dest.lng - origin.longitude;
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  if (angle >= -22.5 && angle < 22.5) return 'north';
  if (angle >= 22.5 && angle < 67.5) return 'northeast';
  if (angle >= 67.5 && angle < 112.5) return 'east';
  if (angle >= 112.5 && angle < 157.5) return 'southeast';
  if (angle >= 157.5 || angle < -157.5) return 'south';
  if (angle >= -157.5 && angle < -112.5) return 'southwest';
  if (angle >= -112.5 && angle < -67.5) return 'west';
  return 'northwest';
}
