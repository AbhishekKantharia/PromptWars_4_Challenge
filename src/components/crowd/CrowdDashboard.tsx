'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CrowdSection {
  name: string;
  current: number;
  capacity: number;
  percentFull: number;
  risk: string;
  waitTimeMinutes: number;
}

interface CrowdAlert {
  severity: string;
  message: string;
  section?: string;
}

interface CrowdData {
  venue: { id: string; name: string; capacity: number };
  currentOccupancy: number;
  totalCapacity: number;
  percentFull: number;
  capacityStatus: string;
  sections: CrowdSection[];
  alerts: CrowdAlert[];
  weatherSummary: { condition: string; temperature: number; humidity: number; impact: string } | null;
  crowdFlow: { entranceRate: number; exitRate: number; avgDwellMinutes: number };
  lastUpdated: string;
}

const RISK_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  low: 'success', moderate: 'warning', high: 'danger', critical: 'danger',
};

export function CrowdDashboard() {
  const [data, setData] = useState<CrowdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/crowd?venue=metlife'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setFetchError(null);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to load crowd data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  if (loading && !data) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (fetchError && !data) return <CardContent className="py-8 text-center"><p className="text-fifa-red">{fetchError}</p></CardContent>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-fifa-white">{data.currentOccupancy.toLocaleString()}</p>
              <p className="text-xs text-fifa-gray mt-1">Current Occupancy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <Badge variant={RISK_BADGE[data.capacityStatus] || 'default'} className="text-sm px-3 py-1">
                {data.capacityStatus.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-xs text-fifa-gray mt-2">Capacity Status</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-fifa-white">{data.percentFull}%</p>
              <p className="text-xs text-fifa-gray mt-1">Percent Full</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-fifa-white">{data.alerts.length}</p>
              <p className="text-xs text-fifa-gray mt-1">Active Alerts</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {data.weatherSummary && (
        <Card>
          <CardContent className="py-3 flex items-center gap-6 text-sm">
            <span className="text-fifa-white font-medium">{data.weatherSummary.condition}</span>
            <span className="text-fifa-gray">{data.weatherSummary.temperature}°C</span>
            <span className="text-fifa-gray">Humidity: {data.weatherSummary.humidity}%</span>
            <span className="text-fifa-accent">{data.weatherSummary.impact}</span>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-xs text-fifa-gray">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-fifa-green animate-pulse" />
          Live — auto-refreshes every 15 seconds
        </span>
        {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
      </div>

      <Card>
        <CardHeader><CardTitle>Section Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.sections.map((section, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fifa-white font-medium">{section.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-fifa-gray">{section.current.toLocaleString()}/{section.capacity.toLocaleString()}</span>
                    <Badge variant={RISK_BADGE[section.risk] || 'default'}>{section.risk}</Badge>
                    {section.waitTimeMinutes > 0 && <span className="text-xs text-fifa-gray">~{section.waitTimeMinutes}min wait</span>}
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={section.percentFull} aria-valuemin={0} aria-valuemax={100} aria-label={`${section.name} occupancy: ${section.percentFull}%`}>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      section.percentFull > 80 ? 'bg-fifa-red' : section.percentFull > 60 ? 'bg-yellow-500' : section.percentFull > 40 ? 'bg-fifa-accent' : 'bg-fifa-green'
                    }`}
                    style={{ width: `${Math.min(section.percentFull, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.alerts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Crowd Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <span className="text-lg">{alert.severity === 'critical' ? '🔴' : alert.severity === 'high' ? '🟡' : '🟢'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-fifa-white">{alert.message}</p>
                    {alert.section && <p className="text-xs text-fifa-accent mt-1">Section: {alert.section}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xl font-bold text-fifa-white">{data.crowdFlow.entranceRate}</p>
            <p className="text-xs text-fifa-gray mt-1">Entrances/min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xl font-bold text-fifa-white">{data.crowdFlow.exitRate}</p>
            <p className="text-xs text-fifa-gray mt-1">Exits/min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xl font-bold text-fifa-white">{data.crowdFlow.avgDwellMinutes}min</p>
            <p className="text-xs text-fifa-gray mt-1">Avg Dwell</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
