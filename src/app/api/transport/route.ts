import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { z } from 'zod';

const transportQuerySchema = z.object({
  type: z.enum(['metro', 'bus', 'taxi', 'rideshare', 'parking', 'walking']).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

const MOCK_TRANSPORT_DATA = {
  metro: [
    { id: 'metro-1', name: 'MetLife Stadium Station', provider: 'NJ Transit', frequency: '8 min', accessible: true, distance: '0.2 km' },
    { id: 'metro-2', name: 'Secaucus Junction', provider: 'NJ Transit', frequency: '15 min', accessible: true, distance: '3.5 km' },
  ],
  bus: [
    { id: 'bus-1', name: 'Route 351', provider: 'NJ Transit', frequency: '12 min', accessible: true, route: 'New York Penn Station → MetLife Stadium' },
    { id: 'bus-2', name: 'Route 161', provider: 'Coach USA', frequency: '20 min', accessible: true, route: 'Port Authority → MetLife Stadium' },
  ],
  parking: [
    { id: 'park-1', name: 'Lot A (VIP)', totalSpaces: 2000, available: 340, pricePerHour: 40, accessible: true, evCharging: true, walkTime: '5 min' },
    { id: 'park-2', name: 'Lot B (General)', totalSpaces: 8000, available: 1200, pricePerHour: 30, accessible: true, evCharging: false, walkTime: '12 min' },
    { id: 'park-3', name: 'Lot C (Economy)', totalSpaces: 5000, available: 2800, pricePerHour: 20, accessible: false, evCharging: false, walkTime: '20 min' },
  ],
  traffic: { level: 'moderate', estimatedDelay: 15, recommendation: 'Consider public transit for faster arrival' },
};

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = transportQuerySchema.safeParse(Object.fromEntries(searchParams));
    
    const type = parsed.data?.type;
    const data = type
      ? { type, options: (MOCK_TRANSPORT_DATA as Record<string, unknown>)[type] || [] }
      : MOCK_TRANSPORT_DATA;

    let recommendation = 'Public transit is recommended for match days. Metro runs every 8 minutes to MetLife Stadium Station. Arrive early to avoid congestion. Parking lots fill up 2 hours before kickoff.';
    try {
      const prompt = `Based on the following transport data for MetLife Stadium on a match day, provide helpful recommendations to a fan. Data: ${JSON.stringify(data)}. Include specific departure times and tips.`;
      recommendation = await generateText(prompt);
    } catch (error) {
      console.warn('Gemini unavailable for transport recommendations, using fallback:', error);
    }

    return NextResponse.json({
      transport: data,
      recommendation,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Transport API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transport data' },
      { status: 500 }
    );
  }
}
