'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { BroadcastModal } from '@/components/matches/BroadcastModal';
import type { Match } from '@/lib/match-data';

function isLive(status: string): boolean {
  return ['1ST HALF', '2ND HALF', 'HT', 'ET', 'PEN', 'BREAK TIME'].includes(status.toUpperCase());
}

function formatStatus(status: string): string {
  switch (status.toUpperCase()) {
    case '1ST HALF': return '1ST HALF';
    case '2ND HALF': return '2ND HALF';
    case 'HT': return 'HALF TIME';
    case 'FT': case 'FINISHED': return 'FULL TIME';
    case 'ET': return 'EXTRA TIME';
    case 'PEN': return 'PENALTIES';
    default: return 'UPCOMING';
  }
}

function Scorers({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div className="space-y-0.5">
      {names.map((name, i) => (
        <p key={i} className="text-[10px] text-fifa-gray truncate">{name}</p>
      ))}
    </div>
  );
}

export function MatchCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const live = isLive(match.timeElapsed);
  const finished = match.timeElapsed.toLowerCase() === 'finished';
  const [showBroadcast, setShowBroadcast] = useState(false);

  if (compact) {
    return (
      <div className={cn(
        'rounded-xl border p-4 transition-all',
        live
          ? 'bg-fifa-red/8 border-fifa-red/30 shadow-lg shadow-fifa-red/10'
          : 'bg-white/3 border-white/8 hover:border-fifa-accent/20'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {match.homeFlag && <img src={match.homeFlag} alt="" className="h-4 w-6 rounded-sm" />}
            <span className="text-sm font-semibold text-fifa-white truncate">{match.homeTeam}</span>
          </div>
          <div className="flex items-center gap-2 mx-3">
            <span className={cn(
              'text-lg font-bold min-w-[24px] text-center',
              live ? 'text-fifa-white' : 'text-fifa-silver'
            )}>
              {match.homeScore != null ? match.homeScore : '—'}
            </span>
            <span className="text-[10px] text-fifa-gray">vs</span>
            <span className={cn(
              'text-lg font-bold min-w-[24px] text-center',
              live ? 'text-fifa-white' : 'text-fifa-silver'
            )}>
              {match.awayScore != null ? match.awayScore : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-sm font-semibold text-fifa-white truncate">{match.awayTeam}</span>
            {match.awayFlag && <img src={match.awayFlag} alt="" className="h-4 w-6 rounded-sm" />}
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full',
            live ? 'bg-fifa-red text-white' : finished ? 'bg-white/10 text-fifa-gray' : 'bg-fifa-accent/20 text-fifa-accent'
          )}>
            {formatStatus(match.timeElapsed)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'rounded-2xl border overflow-hidden transition-all',
        live
          ? 'bg-gradient-to-b from-fifa-red/10 to-transparent border-fifa-red/30 shadow-xl shadow-fifa-red/10'
          : 'bg-white/3 border-white/8 hover:border-fifa-accent/20'
      )}>
        <div className="p-5">
          <div className="flex items-center justify-between text-center">
            <div className="flex-1 flex flex-col items-center gap-2">
              {match.homeFlag && <img src={match.homeFlag} alt="" className="h-8 w-12 rounded-md object-cover" />}
              <span className="text-sm font-semibold text-fifa-white">{match.homeTeam}</span>
            </div>

            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'text-3xl font-bold',
                  live && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'text-fifa-white' : 'text-fifa-silver'
                )}>
                  {match.homeScore != null ? match.homeScore : '—'}
                </span>
                <span className="text-lg text-fifa-gray">:</span>
                <span className={cn(
                  'text-3xl font-bold',
                  live && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'text-fifa-white' : 'text-fifa-silver'
                )}>
                  {match.awayScore != null ? match.awayScore : '—'}
                </span>
              </div>
              <span className={cn(
                'text-[10px] font-bold px-3 py-1 rounded-full',
                live ? 'bg-fifa-red text-white animate-pulse' : finished ? 'bg-white/10 text-fifa-gray' : 'bg-fifa-accent/20 text-fifa-accent'
              )}>
                {formatStatus(match.timeElapsed)}
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              {match.awayFlag && <img src={match.awayFlag} alt="" className="h-8 w-12 rounded-md object-cover" />}
              <span className="text-sm font-semibold text-fifa-white">{match.awayTeam}</span>
            </div>
          </div>

          {(match.homeScorers.length > 0 || match.awayScorers.length > 0) && (
            <div className="mt-4 pt-3 border-t border-white/8 flex justify-between px-4">
              <div className="flex-1 text-right">
                <Scorers names={match.homeScorers} />
              </div>
              <div className="w-px bg-white/8 mx-3" />
              <div className="flex-1 text-left">
                <Scorers names={match.awayScorers} />
              </div>
            </div>
          )}
        </div>

        {(match.group || match.venue) && (
          <div className="px-5 pb-3 flex items-center gap-3 text-[10px] text-fifa-gray">
            {match.group && <span className="bg-white/8 px-2 py-0.5 rounded-full">{match.group}</span>}
            {match.venue && <span className="truncate">{match.venue}</span>}
          </div>
        )}

        {finished && (
          <div className="px-5 pb-4">
            <button
              onClick={() => setShowBroadcast(true)}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold',
                'bg-fifa-accent/10 border border-fifa-accent/20 text-fifa-accent',
                'hover:bg-fifa-accent/20 hover:border-fifa-accent/30 transition-all'
              )}
            >
              <span>▶</span>
              <span>Watch Broadcast</span>
            </button>
          </div>
        )}
      </div>

      {showBroadcast && (
        <BroadcastModal match={match} onClose={() => setShowBroadcast(false)} />
      )}
    </>
  );
}
