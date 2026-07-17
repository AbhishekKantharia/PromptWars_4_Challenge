import { GoogleGenerativeAI, type GenerativeModel, type Content } from '@google/generative-ai';
import { GEMINI_MODEL, GEMINI_EMBEDDING_MODEL } from '@/constants';

let genAI: GoogleGenerativeAI;
let model: GenerativeModel;
let embeddingModel: GenerativeModel;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getGeminiModel(): GenerativeModel {
  if (!model) {
    model = getGenAI().getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }
  return model;
}

export function getEmbeddingModel(): GenerativeModel {
  if (!embeddingModel) {
    embeddingModel = getGenAI().getGenerativeModel({
      model: GEMINI_EMBEDDING_MODEL,
    });
  }
  return embeddingModel;
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const m = getGeminiModel();
  const sysInst = systemInstruction
    ? ({ role: 'user', parts: [{ text: systemInstruction }] } as Content)
    : undefined;
  const result = await m.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: sysInst,
  });
  return result.response.text();
}

export async function generateChat(
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  systemInstruction?: string
): Promise<string> {
  const m = getGeminiModel();
  const sysInst = systemInstruction
    ? ({ role: 'user', parts: [{ text: systemInstruction }] } as Content)
    : undefined;
  const chat = m.startChat({
    history: history.map((h) => ({
      role: h.role as 'user' | 'model',
      parts: h.parts.map((p) => ({ text: p.text })),
    })),
    systemInstruction: sysInst,
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const m = getEmbeddingModel();
  const result = await m.embedContent(texts.length === 1 ? texts[0] : texts.join('\n'));
  return [result.embedding.values];
}

export async function generateStructuredOutput<T>(
  prompt: string,
  schema: string
): Promise<T> {
  const m = getGeminiModel();
  const result = await m.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: JSON.parse(schema) as never,
    },
  });
  return JSON.parse(result.response.text()) as T;
}
