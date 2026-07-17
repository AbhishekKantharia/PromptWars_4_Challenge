'use client';

import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useSpeech } from '@/hooks/useSpeech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSpeechLang } from '@/contexts/LanguageContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function AccessibilityPanel() {
  const { preferences, updatePreference } = useAccessibility();
  const { language } = useLanguage();
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeech();
  const { isListening, transcript, startListening, stopListening, isSupported: sttSupported } = useSpeechRecognition(getSpeechLang(language));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Accessibility Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: 'highContrast' as const, label: 'High Contrast Mode', icon: '🔲' },
            { key: 'largeText' as const, label: 'Large Text Mode', icon: '🔤' },
            { key: 'textToSpeech' as const, label: 'Text-to-Speech', icon: '🔊' },
            { key: 'speechToText' as const, label: 'Speech-to-Text', icon: '🎤' },
            { key: 'wheelchairUser' as const, label: 'Wheelchair Mode', icon: '♿' },
            { key: 'screenReader' as const, label: 'Screen Reader Optimized', icon: '📖' },
          ]).map(({ key, label, icon }) => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3 cursor-pointer hover:border-fifa-accent/30 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-fifa-white">{label}</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences[key] as boolean}
                  onChange={(e) => updatePreference(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-fifa-accent transition-colors" />
                <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow peer-checked:translate-x-5 transition-transform" />
              </div>
            </label>
          ))}

          <div className="rounded-xl border border-glass-border bg-white/5 px-4 py-3">
            <label className="text-sm font-medium text-fifa-white block mb-2">Color Blind Mode</label>
            <div className="flex gap-2 flex-wrap">
              {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={preferences.colorBlindMode === mode ? 'gold' : 'secondary'}
                  size="sm"
                  onClick={() => updatePreference('colorBlindMode', mode)}
                >
                  {mode === 'none' ? 'None' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Voice Interaction</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {sttSupported && (
              <Button variant={isListening ? 'danger' : 'gold'} onClick={isListening ? stopListening : startListening}>
                {isListening ? '⏹ Stop Listening' : '🎤 Start Voice Input'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => { if (isSpeaking) stopSpeaking(); else speak('Welcome to the FIFA Smart Stadium accessibility assistant. How can I help you today?', getSpeechLang(language)); }}>
              {isSpeaking ? '⏹ Stop Reading' : '🔊 Read Page'}
            </Button>
          </div>
          {isListening && <p className="text-sm text-fifa-accent animate-pulse">Listening... Speak now</p>}
          {transcript && <p className="text-sm text-fifa-silver bg-white/5 rounded-xl p-3">Heard: &quot;{transcript}&quot;</p>}
        </CardContent>
      </Card>
    </div>
  );
}
