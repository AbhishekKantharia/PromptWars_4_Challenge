'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface OpsData {
  venue: { id: string; name: string; capacity: number };
  currentAttendance: number;
  operationsSummary: {
    venueStatus: string; gatesOpen: boolean; matchInProgress: boolean;
    emergencyExitTested: boolean; fireSystemStatus: string; cctvStatus: string;
    powerStatus: string; currentPhase: string; incidentCount: number; staffDeployed: number;
  };
  weather: { condition: string; temperature: number; humidity: number; windSpeed: number; precipitation: number; visibility: number; impact: { crowdImpact: string; transportImpact: string; safetyNotes: string[] } } | null;
  incidents: { type: string; severity: string; section: string; timestamp: string; status: string }[];
  staffAllocation: { role: string; count: number; status: string; sections: string }[];
  nearbyMedicalFacilities: { name: string; distance: number }[];
  systemHealth: { network: string; wifi: string; signage: string; accessControl: string; videoDisplay: string };
  lastUpdated: string;
}

export function OperationsDashboard() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/operations?venue=metlife'))
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => { console.error(err); setFetchError('Failed to load operations data'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (fetchError) return <CardContent className="py-8 text-center"><p className="text-fifa-red">{fetchError}</p></CardContent>;
  if (!data) return null;

  const { operationsSummary: ops, incidents, staffAllocation, weather, systemHealth } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4">
          <Badge variant={ops.venueStatus === 'Operational' ? 'success' : 'danger'} className="text-sm">{ops.venueStatus}</Badge>
          <p className="text-xs text-fifa-gray mt-2">Venue Status</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-white">{data.currentAttendance.toLocaleString()}</div>
          <p className="text-xs text-fifa-gray mt-1">Current Attendance</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <Badge variant={incidents.length > 0 ? 'warning' : 'success'} className="text-sm">{incidents.length} Active</Badge>
          <p className="text-xs text-fifa-gray mt-2">Incidents</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-green">{ops.staffDeployed}</div>
          <p className="text-xs text-fifa-gray mt-1">Staff Deployed</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Operations</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Phase</span><span className="text-fifa-white">{ops.currentPhase}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Gates Open</span><Badge variant={ops.gatesOpen ? 'success' : 'default'}>{ops.gatesOpen ? 'Yes' : 'No'}</Badge></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Match In Progress</span><Badge variant={ops.matchInProgress ? 'success' : 'default'}>{ops.matchInProgress ? 'Yes' : 'No'}</Badge></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Power</span><span className="text-fifa-white">{ops.powerStatus}</span></div>
          </CardContent>
        </Card>

        {weather && (
          <Card>
            <CardHeader><CardTitle>Weather</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-fifa-gray">Temperature</span><span className="text-fifa-white">{weather.temperature}°C</span></div>
              <div className="flex justify-between"><span className="text-fifa-gray">Condition</span><span className="text-fifa-white">{weather.condition}</span></div>
              <div className="flex justify-between"><span className="text-fifa-gray">Humidity</span><span className="text-fifa-white">{weather.humidity}%</span></div>
              <div className="flex justify-between"><span className="text-fifa-gray">Wind</span><span className="text-fifa-white">{weather.windSpeed} km/h</span></div>
              {weather.impact.safetyNotes.length > 0 && (
                <div className="mt-2 p-2 rounded bg-fifa-red/10 border border-fifa-red/20">
                  {weather.impact.safetyNotes.map((note, i) => <p key={i} className="text-xs text-fifa-red">{note}</p>)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(systemHealth).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-fifa-gray capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <Badge variant={val === 'Operational' ? 'success' : 'warning'}>{val}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Staff Allocation</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {staffAllocation.map((s, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-fifa-gray">{s.role}</span>
                <span className="text-fifa-white">{s.count} — <Badge variant={s.status === 'Deployed' || s.status === 'Active' ? 'success' : 'default'}>{s.status}</Badge></span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {incidents.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active Incidents</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incidents.map((inc, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <Badge variant={inc.severity === 'critical' ? 'danger' : inc.severity === 'high' ? 'warning' : 'default'}>{inc.severity}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-fifa-white">{inc.type}</p>
                    <p className="text-xs text-fifa-gray">{inc.section} — {inc.status}</p>
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
