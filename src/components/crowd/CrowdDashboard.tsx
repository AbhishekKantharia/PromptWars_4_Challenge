'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CrowdZone {
  id: string; name: string; capacity: number; currentOccupancy: number;
  densityLevel: string; lastUpdated: number;
}

interface CongestionPoint { id: string; severity: number; estimatedWaitTime: number; alternativeRoute?: string; }

interface CrowdData {
  zones: CrowdZone[]; totalAttendance: number; averageDensity: string;
  congestionPoints: CongestionPoint[]; recommendations: { id: string; message: string; confidence: number }[];
  timestamp: number;
}

const DENSITY_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  low: 'success', moderate: 'warning', high: 'danger', very_high: 'danger', critical: 'danger',
};

export function CrowdDashboard() {
  const [data, setData] = useState<CrowdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [matchProgress, setMatchProgress] = useState(0.5);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(apiUrl(`/api/crowd?progress=${matchProgress}`));
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
  }, [matchProgress]);

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
              <p className="text-2xl font-bold text-fifa-white">{data.totalAttendance.toLocaleString()}</p>
              <p className="text-xs text-fifa-gray mt-1">Total Attendance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <Badge variant={DENSITY_BADGE[data.averageDensity] || 'default'} className="text-sm px-3 py-1">
                {data.averageDensity.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-xs text-fifa-gray mt-2">Average Density</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-fifa-white">{data.congestionPoints.length}</p>
              <p className="text-xs text-fifa-gray mt-1">Congestion Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-fifa-white">{data.recommendations?.length || 0}</p>
              <p className="text-xs text-fifa-gray mt-1">AI Recommendations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-4 px-1">
        <label htmlFor="match-progress" className="text-sm text-fifa-gray whitespace-nowrap">Match Progress</label>
        <input
          id="match-progress"
          type="range" min="0" max="1" step="0.01" value={matchProgress}
          onChange={(e) => setMatchProgress(parseFloat(e.target.value))}
          className="flex-1 accent-fifa-accent"
        />
        <span className="text-sm text-fifa-white font-mono w-12 text-right">{Math.round(matchProgress * 100)}%</span>
      </div>

      <div className="flex items-center justify-between text-xs text-fifa-gray">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-fifa-green animate-pulse" />
          Live — auto-refreshes every 15 seconds
        </span>
        {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
      </div>

      <Card>
        <CardHeader><CardTitle>Zone Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.zones.map((zone) => {
              const pct = Math.round((zone.currentOccupancy / zone.capacity) * 100);
              return (
                <div key={zone.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-fifa-white font-medium">{zone.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-fifa-gray">{zone.currentOccupancy.toLocaleString()}/{zone.capacity.toLocaleString()}</span>
                      <Badge variant={DENSITY_BADGE[zone.densityLevel] || 'default'}>{zone.densityLevel}</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${zone.name} occupancy: ${pct}%`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        pct > 80 ? 'bg-fifa-red' : pct > 60 ? 'bg-yellow-500' : pct > 40 ? 'bg-fifa-accent' : 'bg-fifa-green'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {data.congestionPoints.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Congestion Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.congestionPoints.map((cp) => (
                <div key={cp.id} className="flex items-start gap-3 rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <span className="text-lg">{cp.severity > 0.8 ? '🔴' : cp.severity > 0.6 ? '🟡' : '🟢'}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-fifa-white">{cp.id.replace('congestion-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                      <span className="text-xs text-fifa-gray">~{Math.round(cp.estimatedWaitTime / 60)} min wait</span>
                    </div>
                    {cp.alternativeRoute && <p className="text-xs text-fifa-accent mt-1">{cp.alternativeRoute}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>AI Recommendations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recommendations.map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <span className="text-fifa-accent text-lg">💡</span>
                  <div>
                    <p className="text-sm text-fifa-silver">{rec.message}</p>
                    <p className="text-xs text-fifa-gray mt-1">Confidence: {Math.round(rec.confidence * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
