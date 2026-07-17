import type { Metadata } from 'next';
import { ChatInterface } from '@/components/chat/ChatInterface';

export const metadata: Metadata = {
  title: 'AI Stadium Assistant — FIFA Smart Stadium 2026',
  description: 'Ask the AI assistant about navigation, food, transport, safety, and more.',
};

export default function AssistantPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <ChatInterface />
    </div>
  );
}
