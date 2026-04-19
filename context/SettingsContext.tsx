'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ModelType, ExpertiseLevel } from '@/lib/types';

interface SettingsContextType {
  grokApiKey: string;
  geminiApiKey: string;
  setGrokApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const GROK_KEY = 'minecom_grok_key';
const GEMINI_KEY = 'minecom_gemini_key';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [grokApiKey, setGrokApiKeyState] = useState('');
  const [geminiApiKey, setGeminiApiKeyState] = useState('');
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  const setGrokApiKey = useCallback((key: string) => {
    setGrokApiKeyState(key);
    if (key) {
      sessionStorage.setItem(GROK_KEY, key);
    } else {
      sessionStorage.removeItem(GROK_KEY);
    }
  }, []);

  const setGeminiApiKey = useCallback((key: string) => {
    setGeminiApiKeyState(key);
    if (key) {
      sessionStorage.setItem(GEMINI_KEY, key);
    } else {
      sessionStorage.removeItem(GEMINI_KEY);
    }
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
  }, []);

  React.useEffect(() => {
    const storedGrok = sessionStorage.getItem(GROK_KEY);
    const storedGemini = sessionStorage.getItem(GEMINI_KEY);
    if (storedGrok) setGrokApiKeyState(storedGrok);
    if (storedGemini) setGeminiApiKeyState(storedGemini);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        grokApiKey,
        geminiApiKey,
        setGrokApiKey,
        setGeminiApiKey,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
