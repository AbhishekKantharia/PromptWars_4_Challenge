'use client';

import { cn } from '@/utils/cn';
import { getBroadcastLinks } from '@/lib/broadcast-links';
import type { Match } from '@/lib/match-data';

interface BroadcastModalProps {
  match: Match;
  onClose: () => void;
}

export function BroadcastModal({ match, onClose }: BroadcastModalProps) {
  const links = getBroadcastLinks(match.homeTeam, match.awayTeam);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-fifa-navy border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-fifa-white">Match Broadcast</h3>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 text-fifa-silver hover:bg-white/20 hover:text-fifa-white transition flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 flex flex-col items-center gap-1">
              {match.homeFlag && <img src={match.homeFlag} alt="" className="h-8 w-12 rounded-md object-cover" />}
              <span className="text-sm font-semibold text-fifa-white">{match.homeTeam}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-fifa-white">{match.homeScore ?? '—'}</span>
                <span className="text-sm text-fifa-gray">:</span>
                <span className="text-2xl font-bold text-fifa-white">{match.awayScore ?? '—'}</span>
              </div>
              {match.group && (
                <span className="text-[10px] font-bold text-fifa-accent bg-fifa-accent/20 px-2 py-0.5 rounded-full">
                  {match.group}
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              {match.awayFlag && <img src={match.awayFlag} alt="" className="h-8 w-12 rounded-md object-cover" />}
              <span className="text-sm font-semibold text-fifa-white">{match.awayTeam}</span>
            </div>
          </div>

          {/* Scorers */}
          {(match.homeScorers.length > 0 || match.awayScorers.length > 0) && (
            <div className="mt-4 pt-3 border-t border-white/8 flex justify-between px-2">
              <div className="flex-1 text-right space-y-0.5">
                {match.homeScorers.map((s, i) => (
                  <p key={i} className="text-[11px] text-fifa-silver">{s}</p>
                ))}
              </div>
              <div className="w-px bg-white/8 mx-3" />
              <div className="flex-1 text-left space-y-0.5">
                {match.awayScorers.map((s, i) => (
                  <p key={i} className="text-[11px] text-fifa-silver">{s}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Broadcast Links */}
        <div className="p-6">
          <p className="text-xs text-fifa-gray uppercase tracking-wider font-bold mb-3">Watch on</p>
          <div className="space-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-white/8',
                  'bg-white/[0.03] hover:bg-white/[0.06] hover:border-fifa-accent/30 transition-all group'
                )}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-sm font-semibold text-fifa-white group-hover:text-fifa-accent transition-colors">{link.label}</span>
                <span className="ml-auto text-fifa-gray text-xs">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
