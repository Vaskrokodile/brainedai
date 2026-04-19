import { chatWithGrok } from './grok';
import { chatWithGemini } from './gemini';

export interface FusionOptions {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  images?: string[];
  intelligence: 'normal' | 'high' | 'extra-high' | 'max';
}

export async function chatWithFusion(options: FusionOptions): Promise<{ content: string }> {
  const { messages, images = [], intelligence } = options;

  const [grokResponse, geminiResponse] = await Promise.all([
    chatWithGrok({
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      ...(intelligence !== 'normal' ? {
        temperature: [0.3, 0.5, 0.7, 0.9][['normal', 'high', 'extra-high', 'max'].indexOf(intelligence)],
        maxTokens: [2048, 4096, 8192, 16384][['normal', 'high', 'extra-high', 'max'].indexOf(intelligence)]
      } : {})
    }),
    chatWithGemini(messages, images, intelligence)
  ]);

  const synthesisPrompt = `
You are synthesizing responses from two AI models (Grok and Gemini) into a unified, optimal response.

Grok's response:
${grokResponse.content}

Gemini's response:
${geminiResponse.content}

Create a synthesized response that combines the best elements of both. Be concise but comprehensive. If one model provided additional useful information the other missed, include that. Preserve technical accuracy.

Respond with only the synthesized response.
`.trim();

  const finalResponse = await chatWithGemini([
    { role: 'system', content: synthesisPrompt },
    { role: 'user', content: 'Please synthesize the above responses.' }
  ], [], intelligence);

  return { content: finalResponse.content };
}
