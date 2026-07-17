'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/matches/MatchCard';
import { cn } from '@/utils/cn';
import type { Match, GroupStanding } from '@/lib/match-data';

type Tab = 'live' | 'results' | 'fixtures' | 'groups';

export function MatchesDashboard() {
  const [tab, setTab] = useState<Tab>('live');
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [liveRes, recentRes, upcomingRes, groupsRes] = await Promise.all([
          fetch('/api/matches?filter=live'),
          fetch('/api/matches?filter=recent'),
          fetch('/api/matches?filter=upcoming'),
          fetch('/api/matches?filter=groups'),
        ]);

        const liveData = await liveRes.json();
        const recentData = await recentRes.json();
        const upcomingData = await upcomingRes.json();
        const groupsData = await groupsRes.json();

        const allMatches = [
          ...(liveData.matches || []),
          ...(recentData.matches || []),
          ...(upcomingData.matches || []),
        ];
        setMatches(allMatches);
        setGroups(groupsData.groups || []);

        const hasLive = (liveData.matches || []).length > 0;
        const hasFinished = (recentData.matches || []).length > 0;
        if (hasLive) setTab('live');
        else if (hasFinished) setTab('results');
        else setTab('fixtures');
      } catch {
        setMatches([]);
        setGroups([]);
      }
      setLoading(false);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, []);

      const liveMatches = matches.filter(m => ['1ST HALF', '2ND HALF', 'HT', 'ET', 'PEN', 'BREAK TIME', '1st half', '2nd half', 'ht', 'et', 'pen', 'halftime'].includes(m.timeElapsed));
  const finishedMatches = matches.filter(m => m.timeElapsed.toLowerCase() === 'finished' || m.timeElapsed.toLowerCase() === 'ft');
  const upcomingMatches = matches.filter(m => m.timeElapsed.toLowerCase() === 'upcoming' || m.timeElapsed.toLowerCase() === 'notstarted' || m.timeElapsed.toLowerCase() === 'not started');

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'live', label: 'LIVE', count: liveMatches.length },
    { id: 'results', label: 'RESULTS', count: finishedMatches.length },
    { id: 'fixtures', label: 'FIXTURES', count: upcomingMatches.length },
    { id: 'groups', label: 'GROUPS' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-8 max-w-lg">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
              tab === t.id
                ? t.id === 'live' && liveMatches.length > 0
                  ? 'bg-fifa-red text-white'
                  : 'bg-white/[0.08] text-fifa-white'
                : 'text-fifa-silver hover:text-fifa-white hover:bg-white/[0.04]'
            )}
          >
            {t.id === 'live' && liveMatches.length > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                tab === t.id ? 'bg-white/20' : 'bg-white/10'
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-fifa-accent border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Live */}
          {tab === 'live' && (
            <div>
              {liveMatches.length === 0 ? (
                <div className="text-center py-16 fifa-card">
                  <p className="text-4xl mb-3">⚽</p>
                  <p className="text-sm text-fifa-silver">No live matches right now</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {tab === 'results' && (
            <div>
              {finishedMatches.length === 0 ? (
                <div className="text-center py-16 fifa-card">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-sm text-fifa-silver">No results yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finishedMatches.map((m) => <MatchCard key={m.id} match={m} compact />)}
                </div>
              )}
            </div>
          )}

          {/* Fixtures */}
          {tab === 'fixtures' && (
            <div>
              {upcomingMatches.length === 0 ? (
                <div className="text-center py-16 fifa-card">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-sm text-fifa-silver">No upcoming fixtures</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                </div>
              )}
            </div>
          )}

          {/* Groups */}
          {tab === 'groups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.length === 0 ? (
                <div className="text-center py-16 fifa-card col-span-2">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="text-sm text-fifa-silver">No group data available</p>
                </div>
              ) : (
                groups.map((g) => (
                  <div key={g.group} className="fifa-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                      <span className="text-xs font-black text-fifa-accent tracking-wider">GROUP {g.group}</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2 text-[10px] text-fifa-gray uppercase tracking-wider font-bold">
                        <span>Team</span>
                        <span className="text-center">P</span>
                        <span className="text-center">W</span>
                        <span className="text-center">D</span>
                        <span className="text-center">L</span>
                        <span className="text-center">GD</span>
                        <span className="text-center text-fifa-accent">Pts</span>
                      </div>
                      {g.teams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference).map((t, i) => (
                        <div key={t.name} className={cn(
                          'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2.5 text-xs items-center',
                          i < 2 ? 'text-fifa-white' : 'text-fifa-silver'
                        )}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-fifa-gray w-4">{i + 1}</span>
                            {t.flag && <img src={t.flag} alt="" className="h-3 w-4 rounded-sm flex-shrink-0" />}
                            <span className="truncate font-medium">{t.name}</span>
                          </div>
                          <span className="text-center">{t.played}</span>
                          <span className="text-center">{t.won}</span>
                          <span className="text-center">{t.drawn}</span>
                          <span className="text-center">{t.lost}</span>
                          <span className="text-center">{t.goalDifference > 0 ? '+' : ''}{t.goalDifference}</span>
                          <span className="text-center font-bold text-fifa-accent">{t.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
