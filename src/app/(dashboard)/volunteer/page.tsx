import type { Metadata } from 'next';
import { VolunteerAssistant } from '@/components/volunteer/VolunteerAssistant';

export const metadata: Metadata = {
  title: 'Volunteer Assistant — FIFA Smart Stadium 2026',
  description: 'Task management, AI knowledge base, incident reporting for volunteers.',
};

export default function VolunteerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fifa-white">Volunteer Assistant</h1>
        <p className="text-sm text-fifa-gray mt-1">AI-powered guidance for match day operations</p>
      </div>
      <VolunteerAssistant />
    </div>
  );
}
