'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface OpsData {
  crowd: { totalAttendance: number; capacity: number; occupancyPercent: number; peakZone: string; averageWaitTime: number; activeAlerts: number };
  incidents: { total: number; active: number; resolved: number; critical: number; averageResponseTime: number };
  volunteers: { total: number; onDuty: number; onBreak: number; tasksPending: number; tasksCompleted: number };
  transport: { metroLoad: number; busLoad: number; parkingAvailable: number; trafficLevel: string };
  weather: { temperature: number; condition: string; humidity: number; windSpeed: number; uvIndex: number; alerts: string[] };
  aiSummary: string;
}

export function OperationsDashboard() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/operations')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((err) => { console.error(err); setFetchError('Failed to load operations data'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (fetchError) return <CardContent className="py-8 text-center"><p className="text-fifa-red">{fetchError}</p></CardContent>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-white">{data.crowd.occupancyPercent}%</div>
          <p className="text-xs text-fifa-gray mt-1">Venue Occupancy</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-white">{data.crowd.totalAttendance.toLocaleString()}</div>
          <p className="text-xs text-fifa-gray mt-1">Total Attendance</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <Badge variant={data.incidents.critical > 0 ? 'danger' : 'success'} className="text-sm">{data.incidents.active} Active</Badge>
          <p className="text-xs text-fifa-gray mt-2">Incidents</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-green">{data.volunteers.onDuty}/{data.volunteers.total}</div>
          <p className="text-xs text-fifa-gray mt-1">Volunteers On Duty</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Crowd Status</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Peak Zone</span><span className="text-fifa-white">{data.crowd.peakZone}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Avg Wait</span><span className="text-fifa-white">{data.crowd.averageWaitTime} min</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Active Alerts</span><Badge variant={data.crowd.activeAlerts > 0 ? 'warning' : 'success'}>{data.crowd.activeAlerts}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transport Status</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Metro Load</span><span className="text-fifa-white">{data.transport.metroLoad}%</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Bus Load</span><span className="text-fifa-white">{data.transport.busLoad}%</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Parking Available</span><span className="text-fifa-green">{data.transport.parkingAvailable.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Traffic</span><Badge variant="warning">{data.transport.trafficLevel}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Weather</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Temperature</span><span className="text-fifa-white">{data.weather.temperature}°C</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Condition</span><span className="text-fifa-white">{data.weather.condition}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Humidity</span><span className="text-fifa-white">{data.weather.humidity}%</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">UV Index</span><span className="text-fifa-white">{data.weather.uvIndex}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Incident Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fifa-gray">Total</span><span className="text-fifa-white">{data.incidents.total}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Resolved</span><span className="text-fifa-green">{data.incidents.resolved}</span></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Critical</span><Badge variant="danger">{data.incidents.critical}</Badge></div>
            <div className="flex justify-between"><span className="text-fifa-gray">Avg Response</span><span className="text-fifa-white">{data.incidents.averageResponseTime} min</span></div>
          </CardContent>
        </Card>
      </div>

      {data.aiSummary && (
        <Card>
          <CardHeader><CardTitle>AI Operations Summary</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-fifa-silver whitespace-pre-wrap">{data.aiSummary}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
