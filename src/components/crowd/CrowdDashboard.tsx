'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [matchProgress, setMatchProgress] = useState(0.5);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/crowd?progress=${matchProgress}`);
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [matchProgress]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="flex items-center gap-4 px-1">
        <label className="text-sm text-fifa-gray whitespace-nowrap">Match Progress</label>
        <input
          type="range" min="0" max="1" step="0.01" value={matchProgress}
          onChange={(e) => setMatchProgress(parseFloat(e.target.value))}
          className="flex-1 accent-fifa-accent"
        />
        <span className="text-sm text-fifa-white font-mono w-12 text-right">{Math.round(matchProgress * 100)}%</span>
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
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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
