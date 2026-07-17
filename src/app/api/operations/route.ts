import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { OPERATIONS_SUMMARY_PROMPT } from '@/constants/prompts';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { generateCrowdData } from '@/lib/crowd-engine';

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/---+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

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
    aiSummary: '',
  };

  try {
    const summary = await generateText(
      `Given this operational data for MetLife Stadium during a FIFA World Cup 2026 match:\n${JSON.stringify(dashboard, null, 2)}\n\nGenerate a concise operational summary for the venue management team.`,
      OPERATIONS_SUMMARY_PROMPT
    );
    dashboard.aiSummary = stripMarkdown(summary);
  } catch (error) {
    console.warn('Gemini unavailable for operations summary, using fallback:', error);
    dashboard.aiSummary = `Operations Summary — MetLife Stadium\n\nCurrent occupancy: ${dashboard.crowd.occupancyPercent}% (${dashboard.crowd.totalAttendance.toLocaleString()} fans). ${dashboard.crowd.activeAlerts > 0 ? `${dashboard.crowd.activeAlerts} active crowd alert(s) requiring attention.` : 'No critical crowd alerts.'} Transport is running at ${dashboard.transport.metroLoad}% metro capacity. ${dashboard.incidents.active} active incident(s) with avg response time of ${dashboard.incidents.averageResponseTime} min. ${dashboard.volunteers.onDuty} of ${dashboard.volunteers.total} volunteers on duty.`;
  }

  return NextResponse.json(dashboard);
}
