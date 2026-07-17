'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SustainabilityData {
  venue: { id: string; name: string; capacity: number };
  currentAttendance: number;
  carbonFootprint: {
    totalKg: number;
    perCapitaKg: number;
    breakdown: {
      privateVehicle: { riders: number; emissionsKg: number; percent: number };
      publicTransit: { riders: number; emissionsKg: number; percent: number };
      rideshare: { riders: number; emissionsKg: number; percent: number };
      walking: { riders: number; emissionsKg: number; percent: number };
    };
    transitSavingsKg: number;
  };
  energy: { estimatedKwh: number; solarGenerationKwh: number; renewablePercent: number; weatherNote: string };
  water: { estimatedLiters: number; recyclingRate: number; refillStations: number; savedBottles: number };
  waste: { estimatedKg: number; recyclingPercent: number; compostPercent: number; landfillPercent: number; binsAvailable: number };
  greenRecommendations: string[];
  lastUpdated: string;
}

export function SustainabilityDashboard() {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/sustainability?venue=metlife'))
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => { console.error(err); setFetchError('Failed to load sustainability data'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (fetchError) return <CardContent className="py-8 text-center"><p className="text-fifa-red">{fetchError}</p></CardContent>;
  if (!data) return null;

  const { carbonFootprint: cf, energy, water, waste } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-white">{cf.totalKg.toLocaleString()} <span className="text-sm text-fifa-gray">kg</span></div>
          <p className="text-xs text-fifa-gray mt-1">CO₂ Footprint</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-green">{cf.perCapitaKg} <span className="text-sm text-fifa-gray">kg/person</span></div>
          <p className="text-xs text-fifa-gray mt-1">Per Capita</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-accent">{waste.recyclingPercent}%</div>
          <p className="text-xs text-fifa-gray mt-1">Recycling Rate</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-blue-400">{water.savedBottles.toLocaleString()}</div>
          <p className="text-xs text-fifa-gray mt-1">Bottles Saved</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Emissions Breakdown</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(cf.breakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm py-2 border-b border-glass-border last:border-0">
                <span className="text-fifa-silver capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-fifa-white font-semibold">{val.emissionsKg.toLocaleString()} kg ({val.percent}%)</span>
              </div>
            ))}
            <p className="text-xs text-fifa-green mt-3">Transit saves {cf.transitSavingsKg.toLocaleString()} kg CO₂</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Energy</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Estimated Usage</span><span className="text-fifa-white">{energy.estimatedKwh.toLocaleString()} kWh</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Solar Generation</span><span className="text-fifa-green">{energy.solarGenerationKwh} kWh</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Renewable</span><span className="text-fifa-accent">{energy.renewablePercent}%</span></div>
            <p className="text-xs text-fifa-gray mt-2">{energy.weatherNote}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Water & Waste</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Water Usage</span><span className="text-fifa-white">{water.estimatedLiters.toLocaleString()} L</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Water Recycling</span><span className="text-fifa-green">{(water.recyclingRate * 100).toFixed(0)}%</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Refill Stations</span><span className="text-fifa-white">{water.refillStations}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Waste Generated</span><span className="text-fifa-white">{waste.estimatedKg.toLocaleString()} kg</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Compost</span><span className="text-fifa-green">{waste.compostPercent}%</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Landfill</span><span className="text-fifa-red">{waste.landfillPercent}%</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transit Impact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(cf.breakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-fifa-gray capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-fifa-white">{val.riders.toLocaleString()} riders</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Green Recommendations</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.greenRecommendations.map((tip, i) => (
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
