import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function groqGenerateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const client = getGroqClient();
  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content || '';
}

export async function groqGenerateChat(
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  systemInstruction?: string
): Promise<string> {
  const client = getGroqClient();
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  for (const h of history) {
    messages.push({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts.map((p) => p.text).join('\n'),
    });
  }

  messages.push({ role: 'user', content: message });

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content || '';
}
