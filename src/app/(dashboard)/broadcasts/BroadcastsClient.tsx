'use client';

import { useState } from 'react';
import type { Match } from '@/lib/match-data';
import { getBroadcastLinks } from '@/lib/broadcast-links';
import { cn } from '@/utils/cn';

const STAGE_LABELS: Record<string, string> = {
  'Group Stage': 'Group Stage',
  'Round of 32': 'Round of 32',
  'Round of 16': 'Round of 16',
  'Quarter-finals': 'Quarter-Finals',
  'Semi-finals': 'Semi-Finals',
  'Final': 'FINAL',
  'Third-place': 'Third Place',
};

const STAGE_COLORS: Record<string, string> = {
  'Group Stage': 'bg-fifa-silver/20 text-fifa-silver',
  'Round of 32': 'bg-fifa-blue/30 text-fifa-teal',
  'Round of 16': 'bg-fifa-blue/30 text-fifa-teal',
  'Quarter-finals': 'bg-fifa-orange/20 text-fifa-orange',
  'Semi-finals': 'bg-fifa-orange/30 text-fifa-orange',
  'Final': 'bg-fifa-gold/20 text-fifa-gold',
  'Third-place': 'bg-fifa-silver/20 text-fifa-silver',
};

export function BroadcastsClient({ matches }: { matches: Match[] }) {
  const [selected, setSelected] = useState<Match | null>(null);

  if (!matches.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📺</div>
        <h2 className="text-2xl font-bold text-fifa-white">No Broadcasts Available</h2>
        <p className="text-fifa-silver mt-2">Completed matches will appear here with broadcast links.</p>
      </div>
    );
  }

  const links = selected ? getBroadcastLinks(selected.homeTeam, selected.awayTeam) : [];

  return (
    <>
      <div className="space-y-4">
        {matches.map((match, i) => {
          const broadcastLinks = getBroadcastLinks(match.homeTeam, match.awayTeam);
          const stageKey = Object.keys(STAGE_LABELS).find(k => match.stage.includes(k)) || 'Group Stage';
          const stageLabel = STAGE_LABELS[stageKey] || match.stage;
          const stageColor = STAGE_COLORS[stageKey] || STAGE_COLORS['Group Stage'];

          return (
            <button
              key={match.id || i}
              onClick={() => setSelected(match)}
              className="w-full text-left"
            >
              <div className="fifa-card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 group hover:border-fifa-gold/30 transition-all">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${stageColor}`}>
                  {stageLabel}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 text-right">
                      <div className="font-bold text-fifa-white text-sm truncate">{match.homeTeam}</div>
                    </div>
                    <div className="text-lg font-black text-fifa-gold px-3 py-1 bg-fifa-navy/60 rounded min-w-[60px] text-center">
                      {match.homeScore ?? '—'} - {match.awayScore ?? '—'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-fifa-white text-sm truncate">{match.awayTeam}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-shrink-0">
                  {broadcastLinks.map((b, j) => (
                    <span key={j} className="text-[10px] text-fifa-silver bg-fifa-navy/40 px-2 py-1 rounded border border-fifa-silver/10">
                      {b.icon} {b.platform}
                    </span>
                  ))}
                </div>

                <span className="text-fifa-gold opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                  ▶
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-fifa-navy border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-fifa-white">Match Broadcast</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="h-8 w-8 rounded-full bg-white/10 text-fifa-silver hover:bg-white/20 hover:text-fifa-white transition flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 flex flex-col items-center gap-1">
                  {selected.homeFlag && <img src={selected.homeFlag} alt="" className="h-8 w-12 rounded-md object-cover" />}
                  <span className="text-sm font-semibold text-fifa-white">{selected.homeTeam}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-fifa-white">{selected.homeScore ?? '—'}</span>
                    <span className="text-sm text-fifa-gray">:</span>
                    <span className="text-2xl font-bold text-fifa-white">{selected.awayScore ?? '—'}</span>
                  </div>
                  {selected.group && (
                    <span className="text-[10px] font-bold text-fifa-accent bg-fifa-accent/20 px-2 py-0.5 rounded-full">
                      {selected.group}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  {selected.awayFlag && <img src={selected.awayFlag} alt="" className="h-8 w-12 rounded-md object-cover" />}
                  <span className="text-sm font-semibold text-fifa-white">{selected.awayTeam}</span>
                </div>
              </div>
              {(selected.homeScorers?.length > 0 || selected.awayScorers?.length > 0) && (
                <div className="mt-4 pt-3 border-t border-white/8 flex justify-between px-2">
                  <div className="flex-1 text-right space-y-0.5">
                    {selected.homeScorers?.map((s, i) => (
                      <p key={i} className="text-[11px] text-fifa-silver">{s}</p>
                    ))}
                  </div>
                  <div className="w-px bg-white/8 mx-3" />
                  <div className="flex-1 text-left space-y-0.5">
                    {selected.awayScorers?.map((s, i) => (
                      <p key={i} className="text-[11px] text-fifa-silver">{s}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
      )}
    </>
  );
}
