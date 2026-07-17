import { fetchMatchData } from '@/lib/match-data';
import { BroadcastsClient } from './BroadcastsClient';

export const dynamic = 'force-dynamic';

export default async function BroadcastsPage() {
  const data = await fetchMatchData();
  const finished = data.matches.filter(m => m.timeElapsed.toLowerCase() === 'finished');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-fifa-white tracking-tight">Broadcasts</h1>
        <p className="text-sm text-fifa-silver mt-1">
          Watch match highlights and full broadcasts from all {finished.length} completed games
        </p>
      </div>
      <BroadcastsClient matches={finished} />
    </div>
  );
}
