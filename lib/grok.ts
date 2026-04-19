const GROK_API_KEY = process.env.GROK_API_KEY || 'your-grok-api-key';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export interface GrokMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GrokOptions {
  messages: GrokMessage[];
  model?: 'grok-4';
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const MODEL_CONFIG = {
  'grok-4': {
    temperature: { normal: 0.3, high: 0.5, 'extra-high': 0.7, max: 0.9 },
    maxTokens: { normal: 2048, high: 4096, 'extra-high': 8192, max: 16384 }
  }
};

export async function chatWithGrok(
  options: GrokOptions
): Promise<{ content: string; sources?: string[] }> {
  const { messages, model = 'grok-4', temperature = 0.5, maxTokens = 4096, stream = false } = options;

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${error}`);
  }

  if (stream) {
    return { content: '' };
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    sources: data.choices[0]?.message?.citations || []
  };
}

export async function chatWithGrokStream(
  options: GrokOptions,
  onChunk: (chunk: string) => void
): Promise<string> {
  const { messages, model = 'grok-4', temperature = 0.5, maxTokens = 4096 } = options;

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        } catch {}
      }
    }
  }

  return fullContent;
}

export function getGrokModelConfig(intelligence: 'normal' | 'high' | 'extra-high' | 'max') {
  return {
    temperature: MODEL_CONFIG['grok-4'].temperature[intelligence],
    maxTokens: MODEL_CONFIG['grok-4'].maxTokens[intelligence]
  };
}
