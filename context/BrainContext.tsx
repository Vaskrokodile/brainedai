'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

interface BrainContextValue {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  brainContent: string;
  soulContent: string;
  refreshSkills: () => Promise<void>;
  createSkill: (data: { name: string; description: string; content: string; tags?: string[] }) => Promise<void>;
  updateSkill: (id: string, data: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  saveBrain: (content: string) => Promise<void>;
  saveSoul: (content: string) => Promise<void>;
}

const BrainContext = createContext<BrainContextValue | null>(null);

export function BrainProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brainContent, setBrainContent] = useState('');
  const [soulContent, setSoulContent] = useState('');

  const refreshSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [skillsRes, brainRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/brain')
      ]);

      if (!skillsRes.ok || !brainRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const skillsData = await skillsRes.json();
      const brainData = await brainRes.json();

      setSkills(skillsData.skills || []);
      setBrainContent(brainData.brain?.default || '');
      setSoulContent(brainData.brain?.soul || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSkills();
  }, [refreshSkills]);

  const createSkill = useCallback(async (data: { name: string; description: string; content: string; tags?: string[] }) => {
    const response = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create skill');
    }

    await refreshSkills();
  }, [refreshSkills]);

  const updateSkill = useCallback(async (id: string, data: Partial<Skill>) => {
    const response = await fetch('/api/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });

    if (!response.ok) {
      throw new Error('Failed to update skill');
    }

    await refreshSkills();
  }, [refreshSkills]);

  const deleteSkill = useCallback(async (id: string) => {
    const response = await fetch(`/api/skills?id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete skill');
    }

    await refreshSkills();
  }, [refreshSkills]);

  const saveBrain = useCallback(async (content: string) => {
    const response = await fetch('/api/brain', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'brain', content })
    });

    if (!response.ok) {
      throw new Error('Failed to save brain');
    }

    setBrainContent(content);
  }, []);

  const saveSoul = useCallback(async (content: string) => {
    const response = await fetch('/api/brain', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'soul', content })
    });

    if (!response.ok) {
      throw new Error('Failed to save soul');
    }

    setSoulContent(content);
  }, []);

  return (
    <BrainContext.Provider value={{
      skills,
      loading,
      error,
      brainContent,
      soulContent,
      refreshSkills,
      createSkill,
      updateSkill,
      deleteSkill,
      saveBrain,
      saveSoul
    }}>
      {children}
    </BrainContext.Provider>
  );
}

export function useBrain() {
  const context = useContext(BrainContext);
  if (!context) {
    throw new Error('useBrain must be used within a BrainProvider');
  }
  return context;
}
