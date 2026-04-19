import { NextRequest, NextResponse } from 'next/server';
import { chatWithGrok } from '@/lib/grok';
import { chatWithGemini } from '@/lib/gemini';
import { chatWithFusion } from '@/lib/fusion';
import { getBrain } from '@/lib/brain';

export const runtime = 'nodejs';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      model = 'grok', 
      intelligence = 'high', 
      browse = false,
      images = [],
      conversationHistory = []
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const brain = await getBrain();
    
    const systemPrompt = `${brain.default}

---

${brain.soul}`;

    const allMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((m: Message) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message }
    ];

    let response: { content: string; sources?: string[] } = { content: '' };

    if (model === 'grok') {
      response = await chatWithGrok({
        messages: allMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        temperature: [0.3, 0.5, 0.7, 0.9][['normal', 'high', 'extra-high', 'max'].indexOf(intelligence)],
        maxTokens: [2048, 4096, 8192, 16384][['normal', 'high', 'extra-high', 'max'].indexOf(intelligence)]
      });
    } else if (model === 'gemini') {
      response = await chatWithGemini(allMessages, images, intelligence);
    } else if (model === 'fusion') {
      response = await chatWithFusion({
        messages: allMessages,
        images,
        intelligence
      });
    }

    const suggestions = generateSkillSuggestions(message, response.content);

    return NextResponse.json({
      message: response.content,
      sources: response.sources,
      suggestions
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

function generateSkillSuggestions(userMessage: string, aiResponse: string): string[] {
  const suggestions: string[] = [];
  const combined = (userMessage + ' ' + aiResponse).toLowerCase();
  
  const keywords = [
    { pattern: /marketing|advertis|promo|campaign/i, skill: 'Marketing Strategy' },
    { pattern: /server|host|config|setup/i, skill: 'Server Configuration' },
    { pattern: /mod|plugin|forge|fabric/i, skill: 'Mod Development' },
    { pattern: /community|discord|social/i, skill: 'Community Building' },
    { pattern: /content|video|stream|youtube/i, skill: 'Content Creation' }
  ];
  
  for (const { pattern, skill } of keywords) {
    if (pattern.test(combined) && !suggestions.includes(skill)) {
      suggestions.push(skill);
    }
  }
  
  return suggestions.slice(0, 3);
}
