import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { VENUES } from '@/lib/realtime-data';
import { z } from 'zod';
import { sanitizeInput, detectPromptInjection } from '@/utils/security';

const volunteerSchema = z.object({
  name: z.string().min(2).max(100),
  area: z.enum(['gate', 'food', 'medical', 'accessibility', 'info', 'cleanup']),
  message: z.string().min(10).max(500),
});

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'volunteer');
  if (!rl.success) return rl.response!;

  const url = new URL(request.url);
  const venueId = url.searchParams.get('venue') || 'metlife';
  const venue = VENUES.find(v => v.id === venueId) || VENUES[0];

  const now = new Date();
  const hour = now.getHours();

  const tasks = [
    { id: 'task-1', title: 'Gate Ushering', area: 'gate', description: 'Direct fans to correct gates and sections', priority: 'high', status: hour >= 16 ? 'active' : 'pending', slotsTotal: 20, slotsFilled: hour >= 16 ? 18 : 8 },
    { id: 'task-2', title: 'Food Court Monitor', area: 'food', description: 'Monitor food court cleanliness and restocking', priority: 'medium', status: hour >= 14 ? 'active' : 'pending', slotsTotal: 10, slotsFilled: hour >= 14 ? 8 : 3 },
    { id: 'task-3', title: 'Medical Support', area: 'medical', description: 'Assist first aid stations', priority: 'high', status: 'active', slotsTotal: 8, slotsFilled: 7 },
    { id: 'task-4', title: 'Accessibility Guide', area: 'accessibility', description: 'Guide fans with accessibility needs', priority: 'high', status: 'active', slotsTotal: 6, slotsFilled: 5 },
    { id: 'task-5', title: 'Info Desk', area: 'info', description: 'Answer fan questions at information desks', priority: 'medium', status: 'active', slotsTotal: 8, slotsFilled: 6 },
    { id: 'task-6', title: 'Cleanup Crew', area: 'cleanup', description: 'Maintain cleanliness during and after match', priority: 'low', status: hour >= 20 ? 'active' : 'pending', slotsTotal: 12, slotsFilled: hour >= 20 ? 10 : 4 },
  ];

  const volunteerStats = {
    totalVolunteers: 64,
    activeNow: tasks.reduce((sum, t) => sum + t.slotsFilled, 0),
    tasksActive: tasks.filter(t => t.status === 'active').length,
    tasksPending: tasks.filter(t => t.status === 'pending').length,
  };

  return NextResponse.json({
    venue: { id: venue.id, name: venue.name },
    tasks,
    volunteerStats,
    recentIncidents: [],
    lastUpdated: now.toISOString(),
  }, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } });
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'volunteer');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();
    const parsed = volunteerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, area, message } = parsed.data;

    if (detectPromptInjection(message)) {
      return NextResponse.json({ error: 'Message contains inappropriate content' }, { status: 400 });
    }

    const sanitizedMessage = sanitizeInput(message);

    return NextResponse.json({
      success: true,
      report: {
        id: `RPT-${Date.now()}`,
        name: sanitizeInput(name),
        area,
        message: sanitizedMessage,
        status: 'submitted',
        timestamp: new Date().toISOString(),
      },
      message: 'Thank you for your report. A supervisor has been notified.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}
