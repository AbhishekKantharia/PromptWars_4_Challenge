const WORLD_CUP_API = 'https://worldcup26.ir';

export interface Match {
  id: string;
  homeTeam: string;
  homeScore: number | null;
  homeFlag: string;
  awayTeam: string;
  awayScore: number | null;
  awayFlag: string;
  group: string | null;
  stage: string;
  matchday: string;
  timeElapsed: string;
  venue: string | null;
  city: string | null;
  stadiumId: number | null;
  homeScorers: string[];
  awayScorers: string[];
}

export interface Team {
  id: string;
  name: string;
  flag: string;
  fifaRanking: number;
}

export interface GroupStanding {
  group: string;
  teams: {
    name: string;
    flag: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }[];
}

export interface MatchData {
  matches: Match[];
  teams: Team[];
  groups: GroupStanding[];
  lastUpdated: number;
}

let cache: MatchData | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

function normalizeTimeElapsed(raw: string | undefined): string {
  if (!raw) return 'upcoming';
  const lower = raw.toLowerCase();
  if (lower === 'notstarted' || lower === 'not started') return 'upcoming';
  if (lower === 'finished' || lower === 'ft') return 'finished';
  return raw;
}

function parseScorers(raw: unknown): string[] {
  if (!raw || raw === 'null') return [];
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/^[\{\}]+$/g, '').trim();
    if (!cleaned) return [];
    return cleaned.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
  }
  return [];
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchMatchData(): Promise<MatchData> {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const [gamesRes, teamsRes, groupsRes] = await Promise.all([
    fetchWithTimeout(`${WORLD_CUP_API}/get/games`).catch(() => null),
    fetchWithTimeout(`${WORLD_CUP_API}/get/teams`).catch(() => null),
    fetchWithTimeout(`${WORLD_CUP_API}/get/groups`).catch(() => null),
  ]);

  const gamesData = gamesRes?.ok ? await gamesRes.json() : null;
  const teamsData = teamsRes?.ok ? await teamsRes.json() : null;
  const groupsData = groupsRes?.ok ? await groupsRes.json() : null;

  const teams: Team[] = (teamsData?.teams || teamsData?.data || []).map((t: Record<string, unknown>) => ({
    id: String(t.id ?? ''),
    name: (t.name_en as string) || (t.name as string) || 'Unknown',
    flag: (t.flag as string) || '',
    fifaRanking: t.fifa_rank != null ? Number(t.fifa_rank) : 0,
  }));

  const teamFlagMap = new Map<string, string>();
  for (const t of teams) teamFlagMap.set(t.id, t.flag);

  const matches: Match[] = (gamesData?.games || gamesData?.data || []).map((g: Record<string, unknown>) => {
    const homeId = String(g.home_team_id || '');
    const awayId = String(g.away_team_id || '');
    return {
      id: String(g.id ?? Math.random()),
      homeTeam: (g.home_team_name_en as string) || 'TBD',
      homeScore: g.home_score != null ? Number(g.home_score) : null,
      homeFlag: teamFlagMap.get(homeId) || '',
      awayTeam: (g.away_team_name_en as string) || 'TBD',
      awayScore: g.away_score != null ? Number(g.away_score) : null,
      awayFlag: teamFlagMap.get(awayId) || '',
      group: (g.group as string) || null,
      stage: (g.type as string) || 'group',
      matchday: String(g.matchday ?? ''),
      timeElapsed: normalizeTimeElapsed(g.time_elapsed as string),
      venue: (g.venue as string) || null,
      city: (g.city as string) || null,
      stadiumId: g.stadium_id != null ? Number(g.stadium_id) : null,
      homeScorers: parseScorers(g.home_scorers),
      awayScorers: parseScorers(g.away_scorers),
    };
  });

  const groupsRaw = groupsData?.groups || groupsData?.data || [];
  const teamsMap = new Map<string, { name: string; flag: string }>();
  for (const t of teams) teamsMap.set(String(t.id), { name: t.name, flag: t.flag });

  const groups: GroupStanding[] = [];
  if (Array.isArray(groupsRaw)) {
    for (const groupItem of groupsRaw) {
      const groupName = groupItem.name || groupItem.group || '?';
      const groupTeams = Array.isArray(groupItem.teams) ? groupItem.teams : [];
      groups.push({
        group: groupName,
        teams: groupTeams.map((t: Record<string, unknown>) => {
          const teamInfo = teamsMap.get(String(t.team_id)) || { name: `Team ${t.team_id}`, flag: '' };
          return {
            name: teamInfo.name,
            flag: teamInfo.flag,
            played: Number(t.mp) || 0,
            won: Number(t.w) || 0,
            drawn: Number(t.d) || 0,
            lost: Number(t.l) || 0,
            goalsFor: Number(t.gf) || 0,
            goalsAgainst: Number(t.ga) || 0,
            goalDifference: Number(t.gd) || 0,
            points: Number(t.pts) || 0,
          };
        }),
      });
    }
    groups.sort((a, b) => a.group.localeCompare(b.group));
  }

  cache = { matches, teams, groups, lastUpdated: Date.now() };
  cacheTime = Date.now();
  return cache;
}

export function getLiveMatches(data: MatchData): Match[] {
  return data.matches.filter(m =>
    ['1ST HALF', '2ND HALF', 'HT', 'ET', 'PEN', 'BREAK TIME'].includes(m.timeElapsed.toUpperCase())
  );
}

export function getRecentMatches(data: MatchData, count = 5): Match[] {
  const finished = data.matches.filter(m => m.timeElapsed.toLowerCase() === 'finished');
  return finished.slice(-count);
}

export function getUpcomingMatches(data: MatchData, count = 5): Match[] {
  return data.matches.filter(m => m.timeElapsed.toLowerCase() === 'upcoming').slice(0, count);
}

export function getMatchesByGroup(data: MatchData, group: string): Match[] {
  return data.matches.filter(m => m.group?.toUpperCase() === group.toUpperCase());
}

export function formatMatchStatus(status: string): string {
  switch (status.toUpperCase()) {
    case '1ST HALF': return '1ST HALF';
    case '2ND HALF': return '2ND HALF';
    case 'HT': return 'HALF TIME';
    case 'FT': case 'FINISHED': return 'FT';
    case 'ET': return 'EXTRA TIME';
    case 'PEN': return 'PENALTIES';
    default: return status;
  }
}

export function isLive(status: string): boolean {
  const lower = status.toLowerCase();
  return ['1st half', '2nd half', 'ht', 'et', 'pen', 'break time', 'halftime'].includes(lower);
}

export function isFinished(status: string): boolean {
  return status.toLowerCase() === 'finished' || status.toLowerCase() === 'ft';
}

export function isUpcoming(status: string): boolean {
  return status.toLowerCase() === 'upcoming' || status.toLowerCase() === 'notstarted' || status.toLowerCase() === 'not started';
}
