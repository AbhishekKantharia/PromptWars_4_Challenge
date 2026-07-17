import type { Metadata } from 'next';
import { EmergencyPanel } from '@/components/emergency/EmergencyPanel';

export const metadata: Metadata = {
  title: 'Emergency — FIFA Smart Stadium 2026',
  description: 'SOS alerts, incident reporting, evacuation guidance, lost child protocol.',
};

export default function EmergencyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fifa-white">Emergency AI</h1>
        <p className="text-sm text-fifa-gray mt-1">Immediate response — SOS, evacuation, incident reporting</p>
      </div>
      <EmergencyPanel />
    </div>
  );
}
