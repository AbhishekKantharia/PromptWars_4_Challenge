'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TransportData {
  metro: { id: string; name: string; provider: string; frequency: string; accessible: boolean; distance: string }[];
  bus: { id: string; name: string; provider: string; frequency: string; accessible: boolean; route: string }[];
  parking: { id: string; name: string; totalSpaces: number; available: number; pricePerHour: number; accessible: boolean; evCharging: boolean; walkTime: string }[];
  traffic: { level: string; estimatedDelay: number; recommendation: string };
}

const TABS = ['metro', 'bus', 'parking'] as const;

export function TransportAssistant() {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metro' | 'bus' | 'parking'>('metro');
  const [aiRec, setAiRec] = useState('');

  useEffect(() => {
    fetch('/api/transport')
      .then((r) => r.json())
      .then((d) => { setData(d.transport); setAiRec(d.recommendation); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <Badge variant={data.traffic.level === 'moderate' ? 'warning' : 'success'} className="text-sm">{data.traffic.level}</Badge>
            <p className="text-xs text-fifa-gray mt-2">Traffic Level</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-fifa-white">+{data.traffic.estimatedDelay}min</p>
            <p className="text-xs text-fifa-gray mt-1">Estimated Delay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-fifa-green">{data.parking.reduce((s, p) => s + p.available, 0).toLocaleString()}</p>
            <p className="text-xs text-fifa-gray mt-1">Parking Spots</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <Button key={tab} variant={activeTab === tab ? 'gold' : 'secondary'} size="sm" onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === 'metro' && (
        <Card><CardHeader><CardTitle>Metro / Rail</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {data.metro.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                <div><p className="font-medium text-fifa-white">{m.name}</p><p className="text-xs text-fifa-gray">{m.provider} · {m.distance}</p></div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">Every {m.frequency}</Badge>
                  {m.accessible && <Badge variant="success">♿</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      {activeTab === 'bus' && (
        <Card><CardHeader><CardTitle>Bus Services</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {data.bus.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                <div><p className="font-medium text-fifa-white">{b.name}</p><p className="text-xs text-fifa-gray">{b.route}</p></div>
                <Badge variant="info">Every {b.frequency}</Badge>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      {activeTab === 'parking' && (
        <Card><CardHeader><CardTitle>Parking</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {data.parking.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-fifa-white">{p.name}</p>
                  <p className="text-xs text-fifa-gray">${p.pricePerHour}/hr · Walk: {p.walkTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.available > 100 ? 'success' : 'danger'}>{p.available} spots</Badge>
                  {p.evCharging && <Badge variant="info">EV</Badge>}
                  {p.accessible && <Badge variant="success">♿</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      {aiRec && (
        <Card>
          <CardHeader><CardTitle>AI Transport Advice</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-fifa-silver whitespace-pre-wrap">{aiRec}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
