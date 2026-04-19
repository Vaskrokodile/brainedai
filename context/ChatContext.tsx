'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { ChatMessage, ModelType, ExpertiseLevel } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  model: ModelType;
  expertise: ExpertiseLevel;
  browseEnabled: boolean;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MODEL'; payload: ModelType }
  | { type: 'SET_EXPERTISE'; payload: ExpertiseLevel }
  | { type: 'SET_BROWSE'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'LOAD_MESSAGES'; payload: ChatMessage[] };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  model: 'grok',
  expertise: 'high',
  browseEnabled: true,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, content: action.payload.content } : msg
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    case 'SET_EXPERTISE':
      return { ...state, expertise: action.payload };
    case 'SET_BROWSE':
      return { ...state, browseEnabled: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'LOAD_MESSAGES':
      return { ...state, messages: action.payload };
    default:
      return state;
  }
}

interface ChatContextType extends ChatState {
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', image?: string) => ChatMessage;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: ModelType) => void;
  setExpertise: (expertise: ExpertiseLevel) => void;
  setBrowseEnabled: (enabled: boolean) => void;
  clearMessages: () => void;
  sendMessage: (
    content: string,
    brainContent: string,
    soulContent: string,
    skillsContent?: string,
    images?: string[],
    onChunk?: (chunk: string) => void
  ) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((content: string, role: 'user' | 'assistant' | 'system', image?: string): ChatMessage => {
    const message: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      image,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    return message;
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, content } });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setModel = useCallback((model: ModelType) => {
    dispatch({ type: 'SET_MODEL', payload: model });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('minecom_model', model);
    }
  }, []);

  const setExpertise = useCallback((expertise: ExpertiseLevel) => {
    dispatch({ type: 'SET_EXPERTISE', payload: expertise });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('minecom_expertise', expertise);
    }
  }, []);

  const setBrowseEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_BROWSE', payload: enabled });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('minecom_browse', String(enabled));
    }
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    brainContent: string,
    soulContent: string,
    skillsContent: string = '',
    images: string[] = [],
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const userMessage = addMessage(content, 'user');
    
    const history = state.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        model: state.model,
        intelligence: state.expertise.replace('_', '-'),
        browse: state.browseEnabled,
        images,
        conversationHistory: history,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response');
    }

    const data = await response.json();
    const assistantMessage = addMessage('', 'assistant');

    if (data.message) {
      for (let i = 0; i < data.message.length; i++) {
        const chunk = data.message[i];
        updateMessage(assistantMessage.id, data.message.substring(0, i + 1));
        onChunk?.(chunk);
        if (i % 5 === 0) {
          await new Promise(r => setTimeout(r, 10));
        }
      }
    }

    return data.message || '';
  }, [state.messages, state.model, state.expertise, state.browseEnabled, addMessage, updateMessage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = sessionStorage.getItem('minecom_model') as ModelType | null;
      const savedExpertise = sessionStorage.getItem('minecom_expertise') as ExpertiseLevel | null;
      const savedBrowse = sessionStorage.getItem('minecom_browse');

      if (savedModel) setModel(savedModel);
      if (savedExpertise) setExpertise(savedExpertise);
      if (savedBrowse !== null) setBrowseEnabled(savedBrowse === 'true');
    }
  }, [setModel, setExpertise, setBrowseEnabled]);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        addMessage,
        updateMessage,
        setLoading,
        setModel,
        setExpertise,
        setBrowseEnabled,
        clearMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
