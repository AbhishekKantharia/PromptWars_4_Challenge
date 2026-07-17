import type { Metadata } from 'next';
import { SustainabilityDashboard } from '@/components/sustainability/SustainabilityDashboard';

export const metadata: Metadata = {
  title: 'Sustainability — FIFA Smart Stadium 2026',
  description: 'Carbon tracking, waste reduction, green travel options.',
};

export default function SustainabilityPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-fifa-white tracking-tight">Sustainability Dashboard</h1>
        <p className="text-sm text-fifa-silver mt-1">Track your environmental impact and discover green options</p>
      </div>
      <SustainabilityDashboard />
    </div>
  );
}
