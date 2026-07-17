'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useGeolocation } from '@/hooks/useGeolocation';

export function EmergencyPanel() {
  const { location } = useGeolocation();
  const [sosLoading, setSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState<{ message: string; instructions: string[]; emergencyContacts: { name: string; phone: string }[] } | null>(null);
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
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sos',
          latitude: location?.latitude ?? 40.8128,
          longitude: location?.longitude ?? -74.0745,
          type: 'personal',
        }),
      });
      const data = await res.json();
      setSosResult(data);
    } catch (err) { console.error(err); }
    finally { setSosLoading(false); }
  };

  const handleLostChild = async () => {
    setLostChildLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lost_child', ...lostChildForm, childAge: parseInt(lostChildForm.childAge) }),
      });
      const data = await res.json();
      setLostChildResult(data.protocol || 'Report submitted. Security team has been notified.');
      setShowLostChild(false);
    } catch (err) { console.error(err); }
    finally { setLostChildLoading(false); }
  };

  const handleReport = async () => {
    if (!reportType || !reportDesc) return;
    setReportLoading(true);
    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          type: reportType,
          severity: 'medium',
          latitude: location?.latitude ?? 40.8128,
          longitude: location?.longitude ?? -74.0745,
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
            <div className="h-20 w-20 rounded-full bg-fifa-red/20 flex items-center justify-center mx-auto animate-pulse-gold">
              <span className="text-4xl">🚨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-fifa-red">Emergency SOS</h2>
              <p className="text-sm text-fifa-gray mt-1">Press for immediate emergency assistance</p>
            </div>
            <Button variant="danger" size="lg" onClick={handleSOS} loading={sosLoading} className="px-12">
              ACTIVATE SOS
            </Button>
          </div>
        </CardContent>
      </Card>

      {sosResult && (
        <Card className="border-fifa-red/30 bg-fifa-red/5">
          <CardHeader><CardTitle className="text-fifa-red">⚠️ Emergency Active</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-fifa-white">{sosResult.message}</p>
            <ol className="space-y-2">
              {sosResult.instructions.map((inst: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-fifa-silver">
                  <Badge variant="danger">{i + 1}</Badge>{inst}
                </li>
              ))}
            </ol>
            <div className="flex gap-3 pt-2">
              {sosResult.emergencyContacts?.map((c: { name: string; phone: string }) => (
                <a key={c.phone} href={`tel:${c.phone}`} className="rounded-xl border border-fifa-red/30 px-4 py-2 text-sm text-fifa-red hover:bg-fifa-red/10 transition-all">
                  📞 {c.name}: {c.phone}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Report Incident</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {['medical', 'security', 'fire', 'weather'].map((type) => (
                <Button key={type} variant={reportType === type ? 'danger' : 'secondary'} size="sm" onClick={() => setReportType(type)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            <Input placeholder="Describe the incident..." value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} />
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
              <div className="mt-3 rounded-xl bg-fifa-green/5 border border-fifa-green/30 p-3 text-sm text-fifa-green">{lostChildResult}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showLostChild} onClose={() => setShowLostChild(false)} title="Report Lost Child" size="md">
        <div className="space-y-3">
          <Input placeholder="Child's name" value={lostChildForm.childName} onChange={(e) => setLostChildForm({ ...lostChildForm, childName: e.target.value })} />
          <Input placeholder="Child's age" type="number" value={lostChildForm.childAge} onChange={(e) => setLostChildForm({ ...lostChildForm, childAge: e.target.value })} />
          <Input placeholder="Description (clothing, appearance)" value={lostChildForm.childDescription} onChange={(e) => setLostChildForm({ ...lostChildForm, childDescription: e.target.value })} />
          <Input placeholder="Last seen location" value={lostChildForm.lastSeenLocation} onChange={(e) => setLostChildForm({ ...lostChildForm, lastSeenLocation: e.target.value })} />
          <Input placeholder="Guardian name" value={lostChildForm.guardianName} onChange={(e) => setLostChildForm({ ...lostChildForm, guardianName: e.target.value })} />
          <Input placeholder="Guardian phone" value={lostChildForm.guardianContact} onChange={(e) => setLostChildForm({ ...lostChildForm, guardianContact: e.target.value })} />
          <Button variant="danger" onClick={handleLostChild} loading={lostChildLoading} className="w-full">Submit Lost Child Report</Button>
        </div>
      </Modal>
    </div>
  );
}
