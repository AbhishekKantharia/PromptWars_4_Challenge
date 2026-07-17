import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { GEMINI_MODEL, GEMINI_EMBEDDING_MODEL } from '@/constants';
import { groqGenerateText, groqGenerateChat } from './groq';

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

function buildPrompt(userPrompt: string, systemInstruction?: string): string {
  if (!systemInstruction) return userPrompt;
  return `${systemInstruction}\n\n---\n\n${userPrompt}`;
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const m = getGeminiModel();
    const fullPrompt = buildPrompt(prompt, systemInstruction);
    const result = await m.generateContent(fullPrompt);
    return result.response.text();
  } catch (geminiError) {
    console.warn('Gemini failed, falling back to Groq:', geminiError);
    return groqGenerateText(prompt, systemInstruction);
  }
}

export async function generateChat(
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  systemInstruction?: string
): Promise<string> {
  try {
    const m = getGeminiModel();
    const chat = m.startChat({
      history: history.length > 0 ? history.map((h) => ({
        role: h.role as 'user' | 'model',
        parts: h.parts.map((p) => ({ text: p.text })),
      })) : [],
    });
    const fullMessage = buildPrompt(message, systemInstruction);
    const result = await chat.sendMessage(fullMessage);
    return result.response.text();
  } catch (geminiError) {
    console.warn('Gemini failed, falling back to Groq:', geminiError);
    return groqGenerateChat(history, message, systemInstruction);
  }
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
  try {
    const m = getGeminiModel();
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: JSON.parse(schema) as never,
      },
    });
    return JSON.parse(result.response.text()) as T;
  } catch (geminiError) {
    console.warn('Gemini failed for structured output, falling back to Groq:', geminiError);
    const schemaPrompt = `${prompt}\n\nRespond ONLY with valid JSON matching this schema:\n${schema}`;
    const response = await groqGenerateText(schemaPrompt);
    return JSON.parse(response) as T;
  }
}
