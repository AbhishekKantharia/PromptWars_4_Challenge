import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { OPERATIONS_SUMMARY_PROMPT } from '@/constants/prompts';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { generateCrowdData } from '@/lib/crowd-engine';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const crowdData = generateCrowdData(0.5);
    const criticalAlerts = crowdData.zones.filter((z) => z.densityLevel === 'critical' || z.densityLevel === 'very_high');

    const dashboard = {
      venueId: 'metlife',
      timestamp: Date.now(),
      crowd: {
        totalAttendance: crowdData.totalAttendance,
        capacity: 82500,
        occupancyPercent: Math.round((crowdData.totalAttendance / 82500) * 100),
        peakZone: crowdData.zones.reduce((max, z) => z.currentOccupancy > max.currentOccupancy ? z : max, crowdData.zones[0])?.name || 'N/A',
        averageWaitTime: Math.round(crowdData.congestionPoints.reduce((sum, c) => sum + c.estimatedWaitTime, 0) / Math.max(crowdData.congestionPoints.length, 1)),
        activeAlerts: criticalAlerts.length,
      },
      incidents: {
        total: 12,
        active: 3,
        resolved: 9,
        critical: 1,
        averageResponseTime: 4.2,
      },
      volunteers: {
        total: 450,
        onDuty: 380,
        onBreak: 45,
        tasksPending: 28,
        tasksCompleted: 312,
      },
      transport: {
        metroLoad: 78,
        busLoad: 62,
        parkingAvailable: 2340,
        trafficLevel: 'moderate',
      },
      weather: {
        temperature: 24,
        condition: 'Partly Cloudy',
        humidity: 55,
        windSpeed: 12,
        uvIndex: 6,
        alerts: [],
      },
    };

    const summary = await generateText(
      `Given this operational data for MetLife Stadium during a FIFA World Cup 2026 match:\n${JSON.stringify(dashboard, null, 2)}\n\nGenerate a concise operational summary for the venue management team.`,
      OPERATIONS_SUMMARY_PROMPT
    );

    return NextResponse.json({ ...dashboard, aiSummary: summary });
  } catch (error) {
    console.error('Operations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch operations data' }, { status: 500 });
  }
}
