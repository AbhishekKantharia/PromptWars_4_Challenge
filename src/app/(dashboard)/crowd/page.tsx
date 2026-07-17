import type { Metadata } from 'next';
import { CrowdDashboard } from '@/components/crowd/CrowdDashboard';

export const metadata: Metadata = {
  title: 'Crowd Intelligence — FIFA Smart Stadium 2026',
  description: 'Real-time crowd heatmap, density estimation, and AI recommendations.',
};

export default function CrowdPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fifa-white">Crowd Intelligence</h1>
        <p className="text-sm text-fifa-gray mt-1">Real-time monitoring with AI-powered congestion predictions</p>
      </div>
      <CrowdDashboard />
    </div>
  );
}
