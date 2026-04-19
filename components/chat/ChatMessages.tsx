'use client';

import { useChat } from '@/context/ChatContext';
import { MessageBubble } from './MessageBubble';
import styles from './ChatMessages.module.css';
import { Sparkles } from 'lucide-react';

export function ChatMessages() {
  const { messages, isLoading } = useChat();

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.welcome}>
          <div className={styles.welcomeIcon}>
            <Sparkles size={32} />
          </div>
          <h1 className={styles.welcomeTitle}>Welcome to MineCom Intelligence</h1>
          <p className={styles.welcomeSubtitle}>
            Your AI-powered assistant for Minecraft marketing, server optimization, and community building.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div key={message.id} className={styles.message}>
            <MessageBubble
              message={message}
              isLoading={isLoading && index === messages.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
