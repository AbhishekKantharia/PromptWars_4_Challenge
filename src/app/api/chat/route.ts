import { NextRequest, NextResponse } from 'next/server';
import { generateChat } from '@/lib/gemini';
import { STADIUM_SYSTEM_PROMPT } from '@/constants/prompts';
import { chatMessageSchema } from '@/utils/validation';
import { detectPromptInjection, sanitizeInput } from '@/utils/security';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { queryRAG, getIndexedDocumentCount } from '@/lib/rag';
import type { Language } from '@/types';

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'chat');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, language, history } = parsed.data;

    if (detectPromptInjection(message)) {
      return NextResponse.json(
        { error: 'Your message contains content that cannot be processed.' },
        { status: 400 }
      );
    }

    const sanitized = sanitizeInput(message);

    let contextAnswer = '';
    let contextSources: string[] = [];
    if (getIndexedDocumentCount() > 0) {
      const ragResult = await queryRAG(sanitized, 3);
      contextAnswer = ragResult.answer;
      contextSources = ragResult.sources;
    }

    const historyMessages = (history || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const langNames: Record<Language, string> = {
      en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese', ar: 'Arabic',
      hi: 'Hindi', ja: 'Japanese', de: 'German', it: 'Italian', zh: 'Chinese',
    };

    const langInstruction = language !== 'en'
      ? `\n\nIMPORTANT: Respond entirely in ${langNames[language] || 'English'}.`
      : '';

    const contextBlock = contextAnswer
      ? `\n\nRelevant venue information from knowledge base:\n${contextAnswer}\nUse this information to supplement your response when relevant.`
      : '';

    const systemPrompt = STADIUM_SYSTEM_PROMPT + langInstruction + contextBlock;

    let response: string;
    try {
      response = await generateChat(historyMessages, sanitized, systemPrompt);
    } catch (error) {
      console.warn('Gemini unavailable for chat, using fallback:', error);
      response = `I'd love to help you with that! Unfortunately, the AI assistant is temporarily unavailable (missing API configuration). Here's some general info:\n\n• For navigation, try the Navigation tab for interactive maps\n• For transport, check the Transport tab for metro/bus schedules\n• For emergencies, use the Emergency tab or call 911\n• For accessibility needs, check the Accessibility tab\n\nPlease try again later when the AI service is fully configured.`;
    }

    let metadata = {};
    if (contextSources.length > 0) {
      metadata = {
        sources: contextSources,
        ragUsed: true,
      };
    }

    return NextResponse.json({
      response,
      metadata,
      language,
    });
  } catch (error) {
    console.error('Chat API error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
