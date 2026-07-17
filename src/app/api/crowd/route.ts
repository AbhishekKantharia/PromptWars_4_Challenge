import { NextRequest, NextResponse } from 'next/server';
import { generateCrowdData, generateAIRecommendations } from '@/lib/crowd-engine';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const matchProgress = parseFloat(searchParams.get('progress') || '0.5');
    const clamped = Math.max(0, Math.min(1, matchProgress));

    const crowdData = generateCrowdData(clamped);
    const recommendations = generateAIRecommendations(crowdData);

    return NextResponse.json({
      ...crowdData,
      recommendations,
    });
  } catch (error) {
    console.error('Crowd API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crowd data' },
      { status: 500 }
    );
  }
}
