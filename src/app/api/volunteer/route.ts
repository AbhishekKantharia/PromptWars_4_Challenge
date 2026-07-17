import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { generateText } from '@/lib/gemini';
import { VOLUNTEER_KB_PROMPT } from '@/constants/prompts';

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
      const question = body.question as string;
      if (!question || question.trim().length === 0) {
        return NextResponse.json({ error: 'Please provide a question' }, { status: 400 });
      }
      let answer: string;
      try {
        answer = await generateText(question, VOLUNTEER_KB_PROMPT);
      } catch (error) {
        console.warn('Gemini unavailable for volunteer KB, using fallback:', error);
        answer = 'I can help with general volunteer information. Common tasks include ushering, food court monitoring, accessibility guiding, and first aid support. For specific questions, please contact your shift supervisor.';
      }
      return NextResponse.json({ answer });
    }

    if (body.action === 'report') {
      const report = {
        id: crypto.randomUUID(),
        reporterId: clientId,
        ...body,
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
