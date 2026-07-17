import { NextResponse } from 'next/server';
import { fetchMatchData, getLiveMatches, getRecentMatches, getUpcomingMatches } from '@/lib/match-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');

    const data = await fetchMatchData();

    if (filter === 'live') {
      return NextResponse.json({ matches: getLiveMatches(data), lastUpdated: data.lastUpdated });
    }
    if (filter === 'recent') {
      return NextResponse.json({ matches: getRecentMatches(data, 10), lastUpdated: data.lastUpdated });
    }
    if (filter === 'upcoming') {
      return NextResponse.json({ matches: getUpcomingMatches(data, 10), lastUpdated: data.lastUpdated });
    }
    if (filter === 'groups') {
      return NextResponse.json({ groups: data.groups, lastUpdated: data.lastUpdated });
    }
    if (filter === 'teams') {
      return NextResponse.json({ teams: data.teams, lastUpdated: data.lastUpdated });
    }

    return NextResponse.json({
      matches: data.matches,
      teams: data.teams,
      groups: data.groups,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    console.error('Match data error:', error);
    return NextResponse.json({ error: 'Failed to fetch match data' }, { status: 500 });
  }
}
