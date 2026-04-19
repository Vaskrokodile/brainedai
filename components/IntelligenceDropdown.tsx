'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { ExpertiseLevel } from '@/lib/types';
import styles from './IntelligenceDropdown.module.css';

const INTELLIGENCE_LEVELS: { value: ExpertiseLevel; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'extra-high', label: 'Extra High' },
  { value: 'max', label: 'Max' }
];

export function IntelligenceDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { expertise, setExpertise } = useChat();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = INTELLIGENCE_LEVELS.find(l => l.value === expertise)?.label || 'Normal';

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Brain size={16} />
        <span>{currentLabel}</span>
        <ChevronDown size={14} className={isOpen ? styles.open : ''} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {INTELLIGENCE_LEVELS.map(level => (
            <button
              key={level.value}
              className={`${styles.dropdownItem} ${expertise === level.value ? styles.active : ''}`}
              onClick={() => {
                setExpertise(level.value);
                setIsOpen(false);
              }}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
