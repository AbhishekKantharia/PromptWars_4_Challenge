import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { VENUES, fetchWeather, getWeatherImpact, type WeatherData } from '@/lib/realtime-data';
import { z } from 'zod';
import { sanitizeInput, detectPromptInjection } from '@/utils/security';

const emergencySchema = z.object({
  type: z.enum(['medical', 'fire', 'security', 'weather', 'lost_person', 'structural']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().min(2).max(200),
  description: z.string().min(5).max(500),
  reporterName: z.string().min(1).max(100).optional(),
  reporterContact: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'emergency');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();
    const parsed = emergencySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid emergency report', details: parsed.error.flatten() }, { status: 400 });
    }

    const { type, severity, location, description } = parsed.data;

    if (detectPromptInjection(description)) {
      return NextResponse.json({ error: 'Description contains inappropriate content' }, { status: 400 });
    }

    const sanitizedLocation = sanitizeInput(location);
    const sanitizedDescription = sanitizeInput(description);

    const protocols: Record<string, { protocol: string; steps: string[]; estimatedResponse: string }> = {
      medical: {
        protocol: 'Medical Emergency Response',
        steps: ['Alert nearest medical team', 'Dispatch first aid to location', 'Prepare ambulance access route', 'Notify incident command'],
        estimatedResponse: '2-4 minutes',
      },
      fire: {
        protocol: 'Fire Emergency Protocol',
        steps: ['Activate fire alarm system', 'Deploy evacuation for affected zone', 'Alert fire department', 'Open emergency exits in section'],
        estimatedResponse: '1-3 minutes',
      },
      security: {
        protocol: 'Security Incident Response',
        steps: ['Alert security command center', 'Deploy nearby security personnel', 'Secure the area', 'Notify law enforcement if needed'],
        estimatedResponse: '1-2 minutes',
      },
      weather: {
        protocol: 'Severe Weather Protocol',
        steps: ['Monitor weather conditions', 'Alert all staff via radio', 'Prepare shelter-in-place areas', 'PA announcement for fan safety'],
        estimatedResponse: 'Immediate',
      },
      lost_person: {
        protocol: 'Lost Person Protocol',
        steps: ['Broadcast description on PA', 'Deploy staff to last known location', 'Check all exit points', 'Contact security at all gates'],
        estimatedResponse: '3-5 minutes',
      },
      structural: {
        protocol: 'Structural Incident Protocol',
        steps: ['Evacuate affected section immediately', 'Alert structural engineering team', 'Assess structural integrity', 'Redirect fans to alternate sections'],
        estimatedResponse: '1-2 minutes',
      },
    };

    const response = protocols[type] || protocols.medical;

    let weatherContext: WeatherData | null = null;
    try {
      weatherContext = await fetchWeather(VENUES[0].lat, VENUES[0].lon);
    } catch { /* continue */ }

    const weatherImpact = weatherContext ? getWeatherImpact(weatherContext) : null;

    const needsWeatherAlert = type === 'weather' || (weatherContext && weatherContext.weatherCode >= 95);

    return NextResponse.json({
      success: true,
      incident: {
        id: `EMG-${Date.now()}`,
        type,
        severity,
        location: sanitizedLocation,
        description: sanitizedDescription,
        status: 'reported',
        timestamp: new Date().toISOString(),
      },
      responseProtocol: {
        ...response,
        priority: severity === 'critical' ? 'IMMEDIATE' : severity === 'high' ? 'URGENT' : 'STANDARD',
      },
      weatherContext: needsWeatherAlert ? {
        condition: weatherContext?.condition,
        temperature: weatherContext ? Math.round(weatherContext.temperature) : null,
        alert: weatherImpact?.safetyNotes || [],
        recommendation: weatherImpact?.crowdImpact || 'Monitor conditions',
      } : null,
      nextSteps: [
        'Emergency services have been notified',
        'Stay at a safe distance from the incident',
        'Follow staff instructions',
        `Estimated response time: ${response.estimatedResponse}`,
      ],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to process emergency report' }, { status: 500 });
  }
}
