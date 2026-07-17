import type { Metadata } from 'next';
import { TransportAssistant } from '@/components/transport/TransportAssistant';

export const metadata: Metadata = {
  title: 'Transport Assistant — FIFA Smart Stadium 2026',
  description: 'Metro, bus, taxi, parking — live availability and AI recommendations.',
};

export default function TransportPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fifa-white">Transport Assistant</h1>
        <p className="text-sm text-fifa-gray mt-1">Plan your journey with real-time transport data</p>
      </div>
      <TransportAssistant />
    </div>
  );
}
