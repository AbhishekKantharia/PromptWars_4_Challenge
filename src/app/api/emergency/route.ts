import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText } from '@/lib/gemini';
import { EMERGENCY_RESPONSE_PROMPT } from '@/constants/prompts';
import { emergencyReportSchema, sosAlertSchema } from '@/utils/validation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { EMERGENCY_PHONE, MEDICAL_STATION_PHONE } from '@/constants';

const lostChildSchema = z.object({
  action: z.literal('lost_child'),
  childName: z.string().min(1),
  childAge: z.number().min(1).max(17),
  childDescription: z.string().min(10),
  lastSeenLocation: z.string().min(1),
  guardianName: z.string().min(1),
  guardianContact: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'emergency');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'sos') {
      const parsed = sosAlertSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid SOS data' }, { status: 400 });
      }

      const alert = {
        id: crypto.randomUUID(),
        ...parsed.data,
        timestamp: Date.now(),
        resolved: false,
        emergencyContacts: [
          { name: 'Emergency Services', phone: EMERGENCY_PHONE },
          { name: 'Stadium Medical', phone: MEDICAL_STATION_PHONE },
        ],
      };

      return NextResponse.json({
        alert,
        message: 'SOS alert has been triggered. Emergency services have been notified.',
        instructions: [
          'Stay calm and stay where you are if safe to do so.',
          'Emergency responders are being dispatched to your location.',
          'If possible, move to the nearest marked assembly point.',
          `Call ${EMERGENCY_PHONE} for immediate assistance.`,
        ],
      });
    }

    if (action === 'evacuation') {
      const routes = [
        { id: 'evac-1', name: 'Primary Route - North Exit', time: '8 min', accessible: true, assemblyPoint: 'Parking Lot North' },
        { id: 'evac-2', name: 'Secondary Route - South Exit', time: '12 min', accessible: true, assemblyPoint: 'Meadowlands Racetrack' },
        { id: 'evac-3', name: 'Emergency Route - West VIP', time: '6 min', accessible: false, assemblyPoint: 'Route 120 Shoulder' },
      ];

      return NextResponse.json({
        routes,
        instructions: [
          'Follow illuminated exit signs to the nearest emergency exit.',
          'Do not use elevators — use stairs only.',
          'Proceed calmly to the designated assembly point.',
          'Follow instructions from security personnel.',
          'Account for all members of your group.',
        ],
        emergencyContacts: [
          { name: 'Emergency Hotline', phone: EMERGENCY_PHONE },
          { name: 'Stadium Operations', phone: MEDICAL_STATION_PHONE },
        ],
      });
    }

    if (action === 'lost_child') {
      const parsed = lostChildSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: 'Please provide complete information about the child' }, { status: 400 });
      }

      const report = {
        id: crypto.randomUUID(),
        ...parsed.data,
        status: 'active' as const,
        timestamp: Date.now(),
      };

      const prompt = `A child has been reported lost at MetLife Stadium. Name: ${parsed.data.childName}, Age: ${parsed.data.childAge}, Description: ${parsed.data.childDescription}, Last seen: ${parsed.data.lastSeenLocation}. Provide immediate response protocol for lost child procedures at a major sporting venue.`;
      const protocol = await generateText(prompt, EMERGENCY_RESPONSE_PROMPT);

      return NextResponse.json({ report, protocol });
    }

    if (action === 'report') {
      const parsed = emergencyReportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid report data' }, { status: 400 });
      }

      const report = {
        id: crypto.randomUUID(),
        ...parsed.data,
        reportedBy: clientId,
        timestamp: Date.now(),
        status: 'reported' as const,
        responders: [],
      };

      const prompt = `Emergency report filed: Type: ${parsed.data.type}, Severity: ${parsed.data.severity}, Description: ${parsed.data.description}. Provide initial response assessment and recommended actions.`;
      const assessment = await generateText(prompt, EMERGENCY_RESPONSE_PROMPT);

      return NextResponse.json({ report, assessment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Emergency API error:', error);
    return NextResponse.json(
      { error: 'Emergency system error. Call 911 for immediate assistance.' },
      { status: 500 }
    );
  }
}
