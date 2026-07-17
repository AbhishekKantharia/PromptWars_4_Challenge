import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { TRANSLATION_PROMPT } from '@/constants/prompts';
import { translateRequestSchema } from '@/utils/validation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { detectPromptInjection } from '@/utils/security';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese', ar: 'Arabic',
  hi: 'Hindi', ja: 'Japanese', de: 'German', it: 'Italian', zh: 'Chinese (Mandarin)',
};

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'api');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();
    const parsed = translateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid translation request' }, { status: 400 });
    }

    const { text, targetLanguage, sourceLanguage } = parsed.data;

    if (detectPromptInjection(text)) {
      return NextResponse.json({ error: 'Text contains content that cannot be processed' }, { status: 400 });
    }

    const targetName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const prompt = TRANSLATION_PROMPT.replace('{targetLanguage}', targetName);

    const translated = await generateText(
      `Translate the following text to ${targetName}${sourceLanguage ? ` from ${LANGUAGE_NAMES[sourceLanguage] || sourceLanguage}` : ''}:\n\n"${text}"`,
      prompt
    );

    return NextResponse.json({
      translation: translated.trim().replace(/^["']|["']$/g, ''),
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
    });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
