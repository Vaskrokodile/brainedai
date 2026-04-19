'use client';

import { useState } from 'react';
import { Menu, X, MessageSquare, Brain, Sparkles, Zap, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import { ModelType } from '@/lib/types';
import styles from './MiniSidebar.module.css';

const MODELS: { value: ModelType; label: string; icon: string }[] = [
  { value: 'grok', label: 'Grok', icon: '⚡' },
  { value: 'gemini', label: 'Gemini', icon: '✨' },
  { value: 'fusion', label: 'Fusion', icon: '🔮' }
];

export function MiniSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { model, setModel, browseEnabled, setBrowseEnabled } = useChat();

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`${styles.miniSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>M</div>
          <div className={styles.logoText}>MineCom</div>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </Link>
          <Link
            href="/brain"
            className={`${styles.navItem} ${pathname === '/brain' ? styles.navItemActive : ''}`}
          >
            <Brain size={18} />
            <span>Brain</span>
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
      </aside>
    </>
  );
}
