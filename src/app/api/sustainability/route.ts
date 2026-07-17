import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  const sustainabilityData = {
    carbonFootprint: {
      totalEmissions: 2.4,
      breakdown: { travel: 1.8, food: 0.3, merchandise: 0.3 },
      unit: 'kg CO₂',
      comparison: '35% lower than average match-day footprint',
    },
    greenScore: 72,
    wasteReduction: {
      recyclingRate: 68,
      compostUsed: 45,
      singleUseReduced: 32,
      refillStationVisits: 1240,
    },
    refillStations: [
      { id: 'refill-1', name: 'Water Fountain - North Gate', location: 'Near Gate N1', accessible: true, status: 'active' },
      { id: 'refill-2', name: 'Bottle Filler - Food Court', location: 'Main Food Court', accessible: true, status: 'active' },
      { id: 'refill-3', name: 'Water Fountain - South Concourse', location: 'Section 205', accessible: true, status: 'maintenance' },
    ],
    greenTravel: [
      { type: 'metro', description: 'NJ Transit to Secaucus Junction', emissionsSaved: 1.2, cost: 8, duration: 35 },
      { type: 'bus', description: 'Express Bus from Port Authority', emissionsSaved: 0.9, cost: 12, duration: 45 },
      { type: 'carpool', description: 'Share a ride with 3+ fans', emissionsSaved: 0.8, cost: 10, duration: 30 },
    ],
    tips: [
      'Bring a reusable water bottle — free refill stations are available throughout the venue.',
      'Use public transit to reduce your carbon footprint by up to 60%.',
      'Sort your waste into recycling, compost, and landfill bins.',
      'Choose plant-based food options for a lower environmental impact.',
    ],
  };

  return NextResponse.json(sustainabilityData);
}
