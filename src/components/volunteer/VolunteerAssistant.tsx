'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Task { id: string; title: string; description: string; area: string; priority: string; status: string; slotsTotal: number; slotsFilled: number; }

interface VolunteerData {
  venue: { id: string; name: string };
  tasks: Task[];
  volunteerStats: { totalVolunteers: number; activeNow: number; tasksActive: number; tasksPending: number };
  lastUpdated: string;
}

export function VolunteerAssistant() {
  const [data, setData] = useState<VolunteerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentArea, setIncidentArea] = useState('gate');
  const [incidentResult, setIncidentResult] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/volunteer?venue=metlife'))
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAskLoading(true);
    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, language: 'en' }),
      });
      const d = await res.json();
      setAiAnswer(d.response || 'No answer available.');
    } catch { setAiAnswer('Failed to get answer.'); }
    finally { setAskLoading(false); }
  };

  const handleReport = async () => {
    if (!incidentDesc.trim()) return;
    setReportLoading(true);
    try {
      const res = await fetch(apiUrl('/api/volunteer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Volunteer', area: incidentArea, message: incidentDesc }),
      });
      const d = await res.json();
      setIncidentResult(d.message || 'Report submitted.');
      setIncidentDesc('');
    } catch { setIncidentResult('Failed to submit report.'); }
    finally { setReportLoading(false); }
  };

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-white">{data.volunteerStats.totalVolunteers}</div>
          <p className="text-xs text-fifa-gray mt-1">Total Volunteers</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-green">{data.volunteerStats.activeNow}</div>
          <p className="text-xs text-fifa-gray mt-1">Active Now</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-accent">{data.volunteerStats.tasksActive}</div>
          <p className="text-xs text-fifa-gray mt-1">Active Tasks</p>
        </CardContent></Card>
        <Card><CardContent className="text-center py-4">
          <div className="text-2xl font-bold text-fifa-gray">{data.volunteerStats.tasksPending}</div>
          <p className="text-xs text-fifa-gray mt-1">Pending Tasks</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ask the Volunteer AI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., What is the procedure for a medical emergency?" aria-label="Volunteer question" onKeyDown={(e) => e.key === 'Enter' && handleAsk()} />
            <Button variant="gold" onClick={handleAsk} loading={askLoading}>Ask</Button>
          </div>
          {aiAnswer && (
            <div className="rounded-xl border border-glass-border bg-white/5 p-4 text-sm text-fifa-silver whitespace-pre-wrap">{aiAnswer}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Report an Incident</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['gate', 'food', 'medical', 'accessibility', 'info', 'cleanup'].map((a) => (
              <Button key={a} variant={incidentArea === a ? 'gold' : 'secondary'} size="sm" onClick={() => setIncidentArea(a)}>{a}</Button>
            ))}
          </div>
          <Input value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)} placeholder="Describe what you observed..." aria-label="Incident description" />
          <Button variant="danger" onClick={handleReport} loading={reportLoading} disabled={!incidentDesc.trim()}>Submit Report</Button>
          {incidentResult && <p className="text-sm text-fifa-green">{incidentResult}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Tasks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.tasks.map((task) => {
              const fillPct = Math.round((task.slotsFilled / task.slotsTotal) * 100);
              return (
                <div key={task.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                  <div className="flex-1">
                    <p className="font-medium text-fifa-white text-sm">{task.title}</p>
                    <p className="text-xs text-fifa-gray">{task.area} · {task.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-fifa-green rounded-full" style={{ width: `${fillPct}%` }} />
                      </div>
                      <span className="text-xs text-fifa-gray">{task.slotsFilled}/{task.slotsTotal} volunteers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>{task.priority}</Badge>
                    <Badge variant={task.status === 'active' ? 'success' : 'default'}>{task.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
