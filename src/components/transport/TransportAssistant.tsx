'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TransitStop {
  name: string;
  distance: number;
  operator?: string;
  type: string;
  walkTimeMinutes: number;
  frequencyMinutes: number;
  status: string;
}

interface ParkingLot {
  name: string;
  spaces: number;
  price: string;
  status: string;
}

interface TransportOption {
  type: string;
  name: string;
  status: string;
  frequency?: string;
  walkTime?: string;
  capacity?: string;
  recommendation?: string;
  nearestStops?: TransitStop[];
  pickupZone?: string;
  estimatedWait?: string;
  surgeEstimate?: string;
  lots?: ParkingLot[];
}

interface TransportData {
  venue: { id: string; name: string; city: string };
  transportOptions: TransportOption[];
  trafficConditions: { congestionLevel: string; estimatedDelays: string; bestRoute: string; alternativeRoutes: string[] };
  transitStops: TransitStop[];
  weatherSummary: { condition: string; temperature: number; impact: string } | null;
  matchDayTips: string[];
  lastUpdated: string;
}

const TABS = ['transit', 'rideshare', 'parking'] as const;

export function TransportAssistant() {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transit' | 'rideshare' | 'parking'>('transit');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/transport?venue=metlife'))
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => { console.error(err); setFetchError('Failed to load transport data'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (fetchError) return <CardContent className="py-8 text-center"><p className="text-fifa-red">{fetchError}</p></CardContent>;
  if (!data) return null;

  const { trafficConditions, transitStops, transportOptions, weatherSummary } = data;
  const transit = transportOptions.find(o => o.type === 'transit');
  const rideshare = transportOptions.find(o => o.type === 'rideshare');
  const parking = transportOptions.find(o => o.type === 'parking');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <Badge variant={trafficConditions.congestionLevel === 'heavy' ? 'danger' : trafficConditions.congestionLevel === 'moderate' ? 'warning' : 'success'} className="text-sm">{trafficConditions.congestionLevel}</Badge>
            <p className="text-xs text-fifa-gray mt-2">Traffic Level</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-lg font-bold text-fifa-white">{trafficConditions.estimatedDelays}</p>
            <p className="text-xs text-fifa-gray mt-1">Estimated Delays</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-fifa-green">{transitStops.length}</p>
            <p className="text-xs text-fifa-gray mt-1">Nearby Stops</p>
          </CardContent>
        </Card>
      </div>

      {weatherSummary && (
        <Card>
          <CardContent className="py-3 flex items-center gap-6 text-sm">
            <span className="text-fifa-white">{weatherSummary.condition}</span>
            <span className="text-fifa-gray">{weatherSummary.temperature}°C</span>
            <span className="text-fifa-accent">{weatherSummary.impact}</span>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2" role="tablist" aria-label="Transport type">
        {TABS.map((tab) => (
          <Button key={tab} variant={activeTab === tab ? 'gold' : 'secondary'} size="sm" role="tab" aria-selected={activeTab === tab} aria-controls={`panel-${tab}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === 'transit' && (
        <div id="panel-transit" role="tabpanel"><Card><CardHeader><CardTitle>Public Transit</CardTitle></CardHeader><CardContent>
          {transit && <p className="text-sm text-fifa-accent mb-3">{transit.frequency} — {transit.recommendation}</p>}
          <div className="space-y-3">
            {transitStops.map((stop, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-fifa-white">{stop.name}</p>
                  <p className="text-xs text-fifa-gray">{stop.operator || stop.type} · {stop.distance}m away</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">Every {stop.frequencyMinutes}min</Badge>
                  <span className="text-xs text-fifa-gray">{stop.walkTimeMinutes}min walk</span>
                </div>
              </div>
            ))}
            {transitStops.length === 0 && <p className="text-sm text-fifa-gray text-center py-4">No transit stops found nearby</p>}
          </div>
        </CardContent></Card></div>
      )}

      {activeTab === 'rideshare' && (
        <div id="panel-rideshare" role="tabpanel"><Card><CardHeader><CardTitle>Ride-Share</CardTitle></CardHeader><CardContent>
          {rideshare && (
            <div className="space-y-3">
              <div className="rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                <p className="font-medium text-fifa-white">{rideshare.name}</p>
                <p className="text-xs text-fifa-gray mt-1">Pickup: {rideshare.pickupZone}</p>
                <p className="text-xs text-fifa-gray">Wait: {rideshare.estimatedWait}</p>
                <p className="text-xs text-fifa-accent mt-1">{rideshare.surgeEstimate}</p>
              </div>
            </div>
          )}
        </CardContent></Card></div>
      )}

      {activeTab === 'parking' && (
        <div id="panel-parking" role="tabpanel"><Card><CardHeader><CardTitle>Parking</CardTitle></CardHeader><CardContent>
          {parking?.lots && (
            <div className="space-y-3">
              {parking.lots.map((lot, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-medium text-fifa-white">{lot.name}</p>
                    <p className="text-xs text-fifa-gray">{lot.price}</p>
                  </div>
                  <Badge variant={lot.status === 'Open' ? 'success' : 'warning'}>{lot.spaces} spots — {lot.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card></div>
      )}

      <Card>
        <CardHeader><CardTitle>Match Day Tips</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-fifa-silver">
            {data.matchDayTips.map((tip, i) => <li key={i} className="flex items-start gap-2"><span className="text-fifa-accent">•</span>{tip}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
