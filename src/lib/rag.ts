import { getGeminiModel, getEmbeddingModel } from './gemini';
import { RAG_SYSTEM_PROMPT } from '@/constants/prompts';

interface RAGDocument {
  id: string;
  content: string;
  source: string;
  embedding?: number[];
}

let documentStore: RAGDocument[] = [];

export function indexDocument(doc: RAGDocument): void {
  const existing = documentStore.find((d) => d.id === doc.id);
  if (existing) {
    Object.assign(existing, doc);
  } else {
    documentStore.push(doc);
  }
}

export function indexDocuments(docs: RAGDocument[]): void {
  docs.forEach(indexDocument);
}

export function getIndexedDocumentCount(): number {
  return documentStore.length;
}

export async function queryRAG(
  query: string,
  topK = 5
): Promise<{ answer: string; sources: string[] }> {
  const relevantDocs = await findRelevantDocuments(query, topK);

  if (relevantDocs.length === 0) {
    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: { role: 'system', parts: [{ text: RAG_SYSTEM_PROMPT }] },
    });
    return { answer: result.response.text(), sources: [] };
  }

  const context = relevantDocs
    .map((doc, i) => `[Document ${i + 1} - ${doc.source}]: ${doc.content}`)
    .join('\n\n');

  const prompt = `Context documents:\n${context}\n\nUser question: ${query}`;

  const model = getGeminiModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'system', parts: [{ text: RAG_SYSTEM_PROMPT }] },
  });

  return {
    answer: result.response.text(),
    sources: relevantDocs.map((d) => d.source),
  };
}

async function findRelevantDocuments(query: string, topK: number): Promise<RAGDocument[]> {
  try {
    const embeddingModel = getEmbeddingModel();
    const queryResult = await embeddingModel.embedContent(query);
    const queryEmbedding = queryResult.embedding.values;

    const scored = documentStore
      .filter((doc) => doc.embedding && doc.embedding.length > 0)
      .map((doc) => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  } catch {
    return documentStore.slice(0, topK);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function clearDocumentStore(): void {
  documentStore = [];
}
