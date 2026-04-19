'use client';

import { useState, useEffect } from 'react';
import { Menu, X, MessageSquare, Brain, Sparkles, Zap, Cpu, Layers } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import { ModelType } from '@/lib/types';
import styles from './MiniSidebar.module.css';

const MODELS: { value: ModelType; label: string; icon: React.ReactNode }[] = [
  { value: 'grok', label: 'Grok', icon: <Zap size={16} /> },
  { value: 'gemini', label: 'Gemini', icon: <Sparkles size={16} /> },
  { value: 'fusion', label: 'Fusion', icon: <Layers size={16} /> }
];

export function MiniSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { model, setModel, browseEnabled, setBrowseEnabled } = useChat();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isOpen]);

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`${styles.miniSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>M</div>
            <div className={styles.logoWrapper}>
              <div className={styles.logoText}>MineCom</div>
              <div className={styles.logoSubtext}>Intelligence</div>
            </div>
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
        </div>
      </aside>
    </>
  );
}
