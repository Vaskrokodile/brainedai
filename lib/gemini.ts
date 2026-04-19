const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text?: string; inlineData?: { mimeType: string; data: string } }[];
}

export interface GeminiOptions {
  contents: GeminiMessage[];
  temperature?: number;
  maxTokens?: number;
}

const MODEL_CONFIG = {
  temperature: { normal: 0.3, high: 0.5, 'extra-high': 0.7, max: 0.9 },
  maxTokens: { normal: 2048, high: 4096, 'extra-high': 8192, max: 16384 }
};

function buildPromptFromMessages(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): string {
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`;
    } else if (msg.role === 'system') {
      prompt += `${msg.content}\n`;
    }
  }
  return prompt.trim();
}

export async function chatWithGemini(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  images: string[] = [],
  intelligence: 'normal' | 'high' | 'extra-high' | 'max' = 'high'
): Promise<{ content: string }> {
  const temp = MODEL_CONFIG.temperature[intelligence];
  const maxTokens = MODEL_CONFIG.maxTokens[intelligence];

  const contents: GeminiMessage[] = [];
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Instructions]\n${msg.content}` }]
      });
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  }

  if (images.length > 0) {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg) {
      const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [{ text: lastUserMsg.content }];
      for (const img of images) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: img.split(',')[1] || img
          }
        });
      }
      const idx = contents.findIndex(c => c.role === 'user' && c.parts[0].text === lastUserMsg.content);
      if (idx !== -1) {
        contents[idx] = { role: 'user', parts: parts as GeminiMessage['parts'] };
      }
    }
  }

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: temp,
      maxOutputTokens: maxTokens
    }
  };

  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return { content };
}

export async function chatWithGeminiStream(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  images: string[] = [],
  intelligence: 'normal' | 'high' | 'extra-high' | 'max' = 'high',
  onChunk: (chunk: string) => void
): Promise<string> {
  const { content } = await chatWithGemini(messages, images, intelligence);
  
  for (const char of content) {
    onChunk(char);
    await new Promise(r => setTimeout(r, 10));
  }
  
  return content;
}

export function getGeminiModelConfig(intelligence: 'normal' | 'high' | 'extra-high' | 'max') {
  return {
    temperature: MODEL_CONFIG.temperature[intelligence],
    maxTokens: MODEL_CONFIG.maxTokens[intelligence]
  };
}
