'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Task { id: string; title: string; description: string; location: string; priority: string; status: string; startTime: string; endTime: string; requiredSkills: string[]; }

export function VolunteerAssistant() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [askLoading, setAskLoading] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/volunteer?action=tasks'))
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAskLoading(true);
    try {
      const res = await fetch(apiUrl('/api/volunteer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ask', question }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || 'No answer available.');
    } catch { setAiAnswer('Failed to get answer.'); }
    finally { setAskLoading(false); }
  };

  if (loading) return <CardContent className="flex justify-center py-12"><LoadingSpinner /></CardContent>;

  return (
    <div className="space-y-4">
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
        <CardHeader><CardTitle>Your Tasks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3">
                <div className="flex-1">
                  <p className="font-medium text-fifa-white text-sm">{task.title}</p>
                  <p className="text-xs text-fifa-gray">{task.location} · {task.startTime} - {task.endTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>{task.priority}</Badge>
                  <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'}>{task.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
