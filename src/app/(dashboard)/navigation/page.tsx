import type { Metadata } from 'next';
import { VenueMap } from '@/components/navigation/VenueMap';

export const metadata: Metadata = {
  title: 'Intelligent Navigation — FIFA Smart Stadium 2026',
  description: 'Interactive stadium map with indoor navigation and accessible routes.',
};

export default function NavigationPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-fifa-white tracking-tight">Intelligent Navigation</h1>
        <p className="text-sm text-fifa-silver mt-1">Find your way with AI-powered, crowd-aware, accessible routing</p>
      </div>
      <VenueMap />
    </div>
  );
}
