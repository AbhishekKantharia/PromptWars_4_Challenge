import { Match } from '@/lib/match-data';
import { getBroadcastLinks } from '@/lib/broadcast-links';
import { BroadcastModal } from '@/components/matches/BroadcastModal';

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
  if (!matches.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📺</div>
        <h2 className="text-2xl font-bold text-fifa-white">No Broadcasts Available</h2>
        <p className="text-fifa-silver mt-2">Completed matches will appear here with broadcast links.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, i) => {
        const broadcasts = getBroadcastLinks(match.homeTeam, match.awayTeam);
        const stageKey = Object.keys(STAGE_LABELS).find(k => match.stage.includes(k)) || 'Group Stage';
        const stageLabel = STAGE_LABELS[stageKey] || match.stage;
        const stageColor = STAGE_COLORS[stageKey] || STAGE_COLORS['Group Stage'];

        const scorersHome = match.scorers?.filter(s => s.team === match.homeTeam) || [];
        const scorersAway = match.scorers?.filter(s => s.team === match.awayTeam) || [];

        return (
          <BroadcastModal
            key={match.id || i}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
            timeElapsed={match.timeElapsed}
            stage={stageLabel}
            scorersHome={scorersHome.map(s => `${s.player} ${s.time}'`)}
            scorersAway={scorersAway.map(s => `${s.player} ${s.time}'`)}
            broadcasts={broadcasts}
          >
            <div className="fifa-card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 group">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${stageColor}`}>
                {stageLabel}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 text-right">
                    <div className="font-bold text-fifa-white text-sm truncate">{match.homeTeam}</div>
                    {scorersHome.length > 0 && (
                      <div className="text-[10px] text-fifa-gold mt-0.5">
                        {scorersHome.map(s => s.player).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-black text-fifa-gold px-3 py-1 bg-fifa-navy/60 rounded min-w-[60px] text-center">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-fifa-white text-sm truncate">{match.awayTeam}</div>
                    {scorersAway.length > 0 && (
                      <div className="text-[10px] text-fifa-gold mt-0.5">
                        {scorersAway.map(s => s.player).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:flex-shrink-0">
                {broadcasts.map((b, j) => (
                  <span key={j} className="text-[10px] text-fifa-silver bg-fifa-navy/40 px-2 py-1 rounded border border-fifa-silver/10">
                    {b.platform}
                  </span>
                ))}
              </div>

              <span className="text-fifa-gold opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                ▶
              </span>
            </div>
          </BroadcastModal>
        );
      })}
    </div>
  );
}
