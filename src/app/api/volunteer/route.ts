import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { generateText } from '@/lib/gemini';
import { VOLUNTEER_KB_PROMPT } from '@/constants/prompts';
import { detectPromptInjection, sanitizeInput } from '@/utils/security';
import { z } from 'zod';

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

const VOLUNTEER_TASKS = [
  { id: 't-1', title: 'Gate N1 Usher', description: 'Assist fans entering through North Gate 1. Check tickets, direct to sections.', location: 'North Gate 1', priority: 'high' as const, status: 'pending' as const, startTime: '14:00', endTime: '16:00', requiredSkills: ['customer_service'] },
  { id: 't-2', title: 'Food Court Monitor', description: 'Monitor food court cleanliness and report maintenance needs.', location: 'Main Food Court', priority: 'medium' as const, status: 'pending' as const, startTime: '15:00', endTime: '18:00', requiredSkills: ['attention_to_detail'] },
  { id: 't-3', title: 'Accessibility Guide', description: 'Guide wheelchair users and visually impaired fans to their seats.', location: 'South Entrance', priority: 'high' as const, status: 'in_progress' as const, startTime: '13:00', endTime: '20:00', requiredSkills: ['accessibility_awareness', 'patience'] },
  { id: 't-4', title: 'First Aid Support', description: 'Assist medical team with minor first aid requests.', location: 'Medical Station', priority: 'high' as const, status: 'pending' as const, startTime: '14:00', endTime: '22:00', requiredSkills: ['first_aid'] },
  { id: 't-5', title: 'Lost & Found Desk', description: 'Man the lost and found desk and log reported items.', location: 'Information Desk', priority: 'medium' as const, status: 'completed' as const, startTime: '12:00', endTime: '16:00', requiredSkills: ['organization'] },
];

const VOLUNTEER_SCHEDULE = [
  { id: 's-1', date: '2026-06-11', startTime: '12:00', endTime: '22:00', area: 'North Gate', role: 'Usher', status: 'upcoming' as const },
  { id: 's-2', date: '2026-06-14', startTime: '14:00', endTime: '20:00', area: 'Food Court', role: 'Monitor', status: 'upcoming' as const },
  { id: 's-3', date: '2026-06-16', startTime: '10:00', endTime: '23:00', area: 'South Gate', role: 'Accessibility Guide', status: 'upcoming' as const },
];

const volunteerAskSchema = z.object({
  action: z.literal('ask'),
  question: z.string().min(1).max(500).trim(),
});

const volunteerReportSchema = z.object({
  action: z.literal('report'),
  type: z.enum(['medical', 'security', 'fire', 'weather', 'lost_child']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10).max(1000),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'tasks';

    if (action === 'tasks') {
      return NextResponse.json({ tasks: VOLUNTEER_TASKS });
    }
    if (action === 'schedule') {
      return NextResponse.json({ schedule: VOLUNTEER_SCHEDULE });
    }

    return NextResponse.json({ tasks: VOLUNTEER_TASKS, schedule: VOLUNTEER_SCHEDULE });
  } catch (error) {
    console.error('Volunteer API error:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteer data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();

    if (body.action === 'ask') {
      const parsed = volunteerAskSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }
      const sanitized = sanitizeInput(parsed.data.question);
      if (detectPromptInjection(sanitized)) {
        return NextResponse.json({ error: 'Your message contains content that cannot be processed.' }, { status: 400 });
      }
      let answer: string;
      try {
        answer = await generateText(sanitized, VOLUNTEER_KB_PROMPT);
      } catch (error) {
        console.warn('Gemini unavailable for volunteer KB, using fallback:', error);
        answer = 'I can help with general volunteer information. Common tasks include ushering, food court monitoring, accessibility guiding, and first aid support. For specific questions, please contact your shift supervisor.';
      }
      return NextResponse.json({ answer: stripMarkdown(answer) });
    }

    if (body.action === 'report') {
      const parsed = volunteerReportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid report data', details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }
      const sanitizedDesc = sanitizeInput(parsed.data.description).slice(0, 1000);
      if (detectPromptInjection(sanitizedDesc)) {
        return NextResponse.json({ error: 'Your report contains content that cannot be processed.' }, { status: 400 });
      }
      const report = {
        id: crypto.randomUUID(),
        reporterId: clientId,
        type: parsed.data.type,
        severity: parsed.data.severity,
        description: sanitizedDesc,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        timestamp: Date.now(),
        status: 'reported' as const,
      };
      return NextResponse.json({ report, message: 'Incident report submitted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Volunteer API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
