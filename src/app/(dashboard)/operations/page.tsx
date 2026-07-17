import type { Metadata } from 'next';
import { OperationsDashboard } from '@/components/operations/OperationsDashboard';

export const metadata: Metadata = {
  title: 'Operations Dashboard — FIFA Smart Stadium 2026',
  description: 'Live venue operations, crowd analytics, AI insights, incident monitoring.',
};

export default function OperationsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-fifa-white tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-fifa-silver mt-1">Real-time venue intelligence for management teams</p>
      </div>
      <OperationsDashboard />
    </div>
  );
}
