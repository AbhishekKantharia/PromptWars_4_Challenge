'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useGeolocation } from '@/hooks/useGeolocation';

interface EmergencyResult {
  success: boolean;
  incident: { id: string; type: string; severity: string; location: string; description: string; status: string; timestamp: string };
  responseProtocol: { protocol: string; steps: string[]; estimatedResponse: string; priority: string };
  weatherContext: { condition: string; temperature: number; alert: string[]; recommendation: string } | null;
  nextSteps: string[];
}

export function EmergencyPanel() {
  const { location } = useGeolocation();
  const [sosLoading, setSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState<EmergencyResult | null>(null);
  const [showLostChild, setShowLostChild] = useState(false);
  const [lostChildForm, setLostChildForm] = useState({ childName: '', childAge: '', childDescription: '', lastSeenLocation: '', guardianName: '', guardianContact: '' });
  const [lostChildResult, setLostChildResult] = useState('');
  const [lostChildLoading, setLostChildLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      const res = await fetch(apiUrl('/api/emergency'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medical',
          severity: 'critical',
          location: `Section near ${location?.latitude?.toFixed(4) || '40.8128'}, ${location?.longitude?.toFixed(4) || '-74.0745'}`,
          description: 'Emergency SOS activated by fan. Immediate assistance required at this location.',
        }),
      });
      const data = await res.json();
      setSosResult(data);
    } catch (err) { console.error(err); }
    finally { setSosLoading(false); }
  };

  const handleLostChild = async () => {
    if (!lostChildForm.childName || !lostChildForm.childDescription || !lostChildForm.lastSeenLocation) return;
    setLostChildLoading(true);
    try {
      const res = await fetch(apiUrl('/api/emergency'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lost_person',
          severity: 'high',
          location: lostChildForm.lastSeenLocation,
          description: `Lost child: ${lostChildForm.childName}, age ${lostChildForm.childAge || 'unknown'}. Description: ${lostChildForm.childDescription}. Guardian: ${lostChildForm.guardianName || 'unknown'}, Contact: ${lostChildForm.guardianContact || 'unknown'}.`,
        }),
      });
      const data = await res.json();
      setLostChildResult(data.responseProtocol?.protocol || 'Report submitted. Security team has been notified.');
      setShowLostChild(false);
    } catch (err) { console.error(err); }
    finally { setLostChildLoading(false); }
  };

  const handleReport = async () => {
    if (!reportType || !reportDesc) return;
    setReportLoading(true);
    try {
      await fetch(apiUrl('/api/emergency'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          severity: 'medium',
          location: `Section near ${location?.latitude?.toFixed(4) || '40.8128'}, ${location?.longitude?.toFixed(4) || '-74.0745'}`,
          description: reportDesc,
        }),
      });
      setReportType('');
      setReportDesc('');
    } catch (err) { console.error(err); }
    finally { setReportLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="border-fifa-red/30">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-fifa-red/20 flex items-center justify-center mx-auto animate-pulse-gold" aria-hidden="true">
              <span className="text-4xl">🚨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-fifa-red">Emergency SOS</h2>
              <p className="text-sm text-fifa-gray mt-1">Press for immediate emergency assistance</p>
            </div>
            <Button variant="danger" size="lg" onClick={handleSOS} loading={sosLoading} className="px-12" aria-label="Activate emergency SOS alert">
              ACTIVATE SOS
            </Button>
          </div>
        </CardContent>
      </Card>

      {sosResult && (
        <Card className="border-fifa-red/30 bg-fifa-red/5" role="alert" aria-live="assertive">
          <CardHeader><CardTitle className="text-fifa-red">{sosResult.responseProtocol.protocol}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="danger">{sosResult.responseProtocol.priority}</Badge>
              <span className="text-sm text-fifa-gray">Response: {sosResult.responseProtocol.estimatedResponse}</span>
            </div>
            <ol className="space-y-2">
              {sosResult.responseProtocol.steps.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-fifa-silver">
                  <Badge variant="danger">{i + 1}</Badge>{step}
                </li>
              ))}
            </ol>
            {sosResult.weatherContext && (
              <div className="p-2 rounded bg-fifa-accent/10 border border-fifa-accent/20">
                <p className="text-xs text-fifa-accent">{sosResult.weatherContext.condition} — {sosResult.weatherContext.recommendation}</p>
              </div>
            )}
            <div className="space-y-1">
              {sosResult.nextSteps.map((step, i) => (
                <p key={i} className="text-xs text-fifa-gray">• {step}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Report Incident</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Incident type">
              {['medical', 'security', 'fire', 'weather'].map((type) => (
                <Button key={type} variant={reportType === type ? 'danger' : 'secondary'} size="sm" onClick={() => setReportType(type)} aria-pressed={reportType === type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            <Input placeholder="Describe the incident..." aria-label="Incident description" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} />
            <Button variant="danger" onClick={handleReport} loading={reportLoading} disabled={!reportType || !reportDesc}>
              Submit Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lost Child</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-fifa-gray mb-3">Report a lost or missing child to initiate immediate search protocol.</p>
            <Button variant="danger" onClick={() => setShowLostChild(true)}>Report Lost Child</Button>
            {lostChildResult && (
              <div className="mt-3 rounded-xl bg-fifa-green/5 border border-fifa-green/30 p-3 text-sm text-fifa-green" role="status">{lostChildResult}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showLostChild} onClose={() => setShowLostChild(false)} title="Report Lost Child" size="md">
        <div className="space-y-3">
          <Input placeholder="Child's name" aria-label="Child's name" value={lostChildForm.childName} onChange={(e) => setLostChildForm({ ...lostChildForm, childName: e.target.value })} />
          <Input placeholder="Child's age" type="number" aria-label="Child's age" value={lostChildForm.childAge} onChange={(e) => setLostChildForm({ ...lostChildForm, childAge: e.target.value })} />
          <Input placeholder="Description (clothing, appearance)" aria-label="Child description" value={lostChildForm.childDescription} onChange={(e) => setLostChildForm({ ...lostChildForm, childDescription: e.target.value })} />
          <Input placeholder="Last seen location" aria-label="Last seen location" value={lostChildForm.lastSeenLocation} onChange={(e) => setLostChildForm({ ...lostChildForm, lastSeenLocation: e.target.value })} />
          <Input placeholder="Guardian name" aria-label="Guardian name" value={lostChildForm.guardianName} onChange={(e) => setLostChildForm({ ...lostChildForm, guardianName: e.target.value })} />
          <Input placeholder="Guardian phone" aria-label="Guardian phone number" value={lostChildForm.guardianContact} onChange={(e) => setLostChildForm({ ...lostChildForm, guardianContact: e.target.value })} />
          <Button variant="danger" onClick={handleLostChild} loading={lostChildLoading} className="w-full">Submit Lost Child Report</Button>
        </div>
      </Modal>
    </div>
  );
}
