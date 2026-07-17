import type { Metadata } from 'next';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';

export const metadata: Metadata = {
  title: 'Accessibility — FIFA Smart Stadium 2026',
  description: 'Voice interaction, text-to-speech, screen reader support, wheelchair navigation.',
};

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-fifa-white tracking-tight">Accessibility Assistant</h1>
        <p className="text-sm text-fifa-silver mt-1">Inclusive experience for every fan — voice, contrast, navigation</p>
      </div>
      <AccessibilityPanel />
    </div>
  );
}
