'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Brain, Sparkles, Zap } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useBrain } from '@/context/BrainContext';
import { ModelType, ExpertiseLevel } from '@/lib/types';
import styles from './Sidebar.module.css';

const MODELS: { value: ModelType; label: string; icon: string }[] = [
  { value: 'grok', label: 'Grok', icon: '⚡' },
  { value: 'gemini', label: 'Gemini', icon: '✨' },
  { value: 'fusion', label: 'Fusion', icon: '🔮' }
];

const INTELLIGENCE_LEVELS: { value: ExpertiseLevel; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'extra-high', label: 'Extra High' },
  { value: 'max', label: 'Max' }
];

export function Sidebar() {
  const pathname = usePathname();
  const { model, expertise, browseEnabled, setModel, setExpertise, setBrowseEnabled, clearMessages } = useChat();
  const { skills } = useBrain();

  const handleNewChat = () => {
    clearMessages();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>M</div>
        <div>
          <div className={styles.logoText}>MineCom</div>
          <div className={styles.logoSubtext}>Intelligence</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/"
          className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}
          onClick={handleNewChat}
        >
          <MessageSquare size={18} />
          Chat
        </Link>
        <Link
          href="/brain"
          className={`${styles.navItem} ${pathname === '/brain' ? styles.navItemActive : ''}`}
        >
          <Brain size={18} />
          Brain
        </Link>
      </nav>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>AI Model</div>
        <div className={styles.modelOptions}>
          {MODELS.map(m => (
            <button
              key={m.value}
              className={`${styles.modelOption} ${model === m.value ? styles.modelOptionActive : ''}`}
              onClick={() => setModel(m.value)}
            >
              <span className={styles.modelIcon}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Intelligence</div>
        <div className={styles.intelligenceOptions}>
          {INTELLIGENCE_LEVELS.map(l => (
            <button
              key={l.value}
              className={`${styles.intelligenceOption} ${expertise === l.value ? styles.intelligenceOptionActive : ''}`}
              onClick={() => setExpertise(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {model === 'grok' && (
        <div className={styles.section}>
          <div className={styles.browseToggle}>
            <span className={styles.browseLabel}>Web Browsing</span>
            <button
              className={`${styles.browseSwitch} ${browseEnabled ? styles.browseSwitchActive : ''}`}
              onClick={() => setBrowseEnabled(!browseEnabled)}
            />
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Skills</span>
          <span className={styles.statValue}>{skills.length}</span>
        </div>
      </div>

      <div className={styles.footer}>
        Powered by xAI & Google AI
      </div>
    </aside>
  );
}
