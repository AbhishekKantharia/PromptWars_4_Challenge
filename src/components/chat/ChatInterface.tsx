'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useSpeech } from '@/hooks/useSpeech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getSpeechLang } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';

const QUICK_ACTIONS = [
  { label: 'Where is Gate 6?', icon: '🚪' },
  { label: 'Nearest restroom', icon: '🚻' },
  { label: 'Food recommendations', icon: '🍔' },
  { label: 'Emergency exits', icon: '🚨' },
  { label: 'Parking guidance', icon: '🅿️' },
  { label: 'Wheelchair route', icon: '♿' },
];

export function ChatInterface() {
  const { language } = useLanguage();
  useAccessibility();
  const { messages, isLoading, error, sendMessage } = useChat({ language });
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeech();
  const { isListening, transcript, startListening, stopListening, isSupported: sttSupported } = useSpeechRecognition(getSpeechLang(language));
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleQuickAction = (question: string) => {
    setInput('');
    sendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) { stopSpeaking(); return; }
    speak(text, getSpeechLang(language));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-glass-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center text-fifa-navy font-bold">AI</div>
          <div>
            <h2 className="text-sm font-semibold text-fifa-white">Stadium AI Assistant</h2>
            <p className="text-xs text-fifa-green flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-fifa-green inline-block" />
              Online — Powered by Gemini
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-gold-gradient/20 flex items-center justify-center text-3xl">⚽</div>
              <div>
                <h3 className="text-lg font-semibold text-fifa-white">Welcome to FIFA Smart Stadium</h3>
                <p className="text-sm text-fifa-gray mt-1 max-w-md">Ask me anything about the venue, navigation, food, transport, or emergency procedures.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className="flex items-center gap-2 rounded-xl border border-glass-border bg-white/5 px-3 py-2.5 text-left text-sm text-fifa-silver hover:border-fifa-accent/30 hover:text-fifa-accent transition-all"
                  >
                    <span role="img" aria-hidden="true">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} role="article" aria-label={msg.role === 'user' ? 'Your message' : 'AI response'}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-fifa-blue text-fifa-white'
                  : 'bg-white/5 text-fifa-silver border border-glass-border'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-fifa-gray">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleSpeakMessage(msg.content)}
                      className="text-[10px] text-fifa-gray hover:text-fifa-accent transition-colors"
                      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
                    >
                      {isSpeaking ? '⏹ Stop' : '🔊 Read'}
                    </button>
                  )}
                </div>
                {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-glass-border">
                    <p className="text-[10px] text-fifa-gray">Sources: {msg.metadata.sources.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-glass-border rounded-2xl px-4 py-3 flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-fifa-gray">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center" role="alert" aria-live="assertive">
              <div className="bg-fifa-red/10 border border-fifa-red/30 rounded-xl px-4 py-2 text-sm text-fifa-red">{error}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-glass-border">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the stadium..."
              className="flex-1"
              disabled={isLoading}
              aria-label="Type your message"
            />
            {sttSupported && (
              <Button
                variant={isListening ? 'danger' : 'secondary'}
                size="md"
                onClick={isListening ? stopListening : startListening}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                type="button"
              >
                {isListening ? '⏹' : '🎤'}
              </Button>
            )}
            <Button
              variant="gold"
              size="md"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
