'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import type { Match } from '@/lib/match-data';

function formatStatus(status: string): string {
  switch (status.toUpperCase()) {
    case '1ST HALF': return '1ST HALF';
    case '2ND HALF': return '2ND HALF';
    case 'HT': return 'HT';
    case 'FT': case 'FINISHED': return 'FT';
    case 'ET': return 'ET';
    case 'PEN': return 'PEN';
    default: return '—';
  }
}

function isLive(status: string): boolean {
  return ['1ST HALF', '2ND HALF', 'HT', 'ET', 'PEN', 'BREAK TIME'].includes(status.toUpperCase());
}

function MatchChip({ match }: { match: Match }) {
  const live = isLive(match.timeElapsed);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition-all',
        live
          ? 'bg-fifa-red/15 border border-fifa-red/30 text-fifa-white'
          : 'bg-white/5 border border-white/8 text-fifa-silver hover:bg-white/8'
      )}
    >
      {match.homeFlag && (
        <img src={match.homeFlag} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
      )}
      <span className="text-fifa-white font-semibold max-w-[80px] truncate">{match.homeTeam}</span>
      <span className={cn(
        'px-2 py-0.5 rounded text-[10px] font-bold min-w-[28px] text-center',
        live ? 'bg-fifa-red text-white animate-pulse' : 'bg-white/10 text-fifa-silver'
      )}>
        {match.homeScore != null ? match.homeScore : '—'}
      </span>
      <span className="text-fifa-gray text-[10px]">{formatStatus(match.timeElapsed)}</span>
      <span className={cn(
        'px-2 py-0.5 rounded text-[10px] font-bold min-w-[28px] text-center',
        live ? 'bg-fifa-red text-white animate-pulse' : 'bg-white/10 text-fifa-silver'
      )}>
        {match.awayScore != null ? match.awayScore : '—'}
      </span>
      <span className="text-fifa-white font-semibold max-w-[80px] truncate">{match.awayTeam}</span>
      {match.awayFlag && (
        <img src={match.awayFlag} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
      )}
    </div>
  );
}

export function LiveScoreBar() {
  const [matches, setMatches] = useState<Match[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches?filter=live');
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
      } catch {}
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (matches.length === 0) {
    return (
      <div className="flex items-center gap-3 text-xs text-fifa-gray px-4">
        <span className="h-2 w-2 rounded-full bg-fifa-green/50" />
        <span>No live matches right now</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden max-w-[500px]" role="marquee" aria-label="Live match scores">
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {matches.map((match) => (
          <MatchChip key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
