import type { Metadata } from 'next';
import { MatchesDashboard } from '@/components/matches/MatchesDashboard';

export const metadata: Metadata = {
  title: 'Matches — FIFA World Cup 2026',
  description: 'Live scores, fixtures, results, and group standings for the FIFA World Cup 2026.',
};

export default function MatchesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-fifa-white tracking-tight">Matches</h1>
        <p className="text-sm text-fifa-silver mt-1">Live scores, fixtures, results & group standings</p>
      </div>
      <MatchesDashboard />
    </div>
  );
}
