'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SustainabilityData {
  carbonFootprint: { totalEmissions: number; breakdown: Record<string, number>; unit: string; comparison: string };
  greenScore: number;
  wasteReduction: { recyclingRate: number; compostUsed: number; singleUseReduced: number; refillStationVisits: number };
  refillStations: { id: string; name: string; location: string; accessible: boolean; status: string }[];
  greenTravel: { type: string; description: string; emissionsSaved: number; cost: number; duration: number }[];
  tips: string[];
}

export function SustainabilityDashboard() {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sustainability')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((err) => { console.error(err); setFetchError('Failed to load sustainability data'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (fetchError) return <CardContent className="py-8 text-center"><p className="text-fifa-red">{fetchError}</p></CardContent>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4">
          <div className="text-3xl font-bold text-fifa-green">{data.greenScore}</div>
          <p className="text-xs text-fifa-gray mt-1">Green Score</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-white">{data.carbonFootprint.totalEmissions} <span className="text-sm text-fifa-gray">kg</span></div>
          <p className="text-xs text-fifa-gray mt-1">CO₂ Footprint</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-accent">{data.wasteReduction.recyclingRate}%</div>
          <p className="text-xs text-fifa-gray mt-1">Recycling Rate</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-blue-400">{data.wasteReduction.refillStationVisits.toLocaleString()}</div>
          <p className="text-xs text-fifa-gray mt-1">Refill Visits</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Emissions Breakdown</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(data.carbonFootprint.breakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm py-2 border-b border-glass-border last:border-0">
                <span className="text-fifa-silver capitalize">{key}</span>
                <span className="text-fifa-white font-semibold">{val} kg CO₂</span>
              </div>
            ))}
            <p className="text-xs text-fifa-green mt-3">{data.carbonFootprint.comparison}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Green Travel Options</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.greenTravel.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-fifa-white capitalize">{t.type}</p>
                    <p className="text-xs text-fifa-gray">{t.description} · {t.duration} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-fifa-green font-semibold">-{t.emissionsSaved} kg</p>
                    <p className="text-xs text-fifa-gray">${t.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Eco Tips</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-fifa-silver">
                <span className="text-fifa-green">🌱</span>{tip}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
