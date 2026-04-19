export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  usageCount: number;
}

export interface BrainFile {
  default: string;
  soul: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: 'grok' | 'gemini' | 'fusion';
  expertise: 'normal' | 'high' | 'extra-high' | 'max';
  browse_enabled: boolean;
}

export type ModelType = 'grok' | 'gemini' | 'fusion';
export type ExpertiseLevel = 'normal' | 'high' | 'extra-high' | 'max';

export interface ChatRequest {
  messages: Array<{role: string; content: string; image?: string}>;
  model: ModelType;
  expertise: ExpertiseLevel;
  browse: boolean;
  brain: string;
  soul: string;
}

export interface ChatResponse {
  content: string;
  skills_created?: Array<{title: string; content: string}>;
  error?: string;
}
