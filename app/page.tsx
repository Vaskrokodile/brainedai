'use client';

import { ChatProvider, useChat } from '@/context/ChatContext';
import { BrainProvider } from '@/context/BrainContext';
import { Sidebar } from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { useRef, useEffect } from 'react';
import styles from './page.module.css';

const MODEL_LABELS: Record<string, { label: string; icon: string }> = {
  grok: { label: 'Grok', icon: '⚡' },
  gemini: { label: 'Gemini', icon: '✨' },
  fusion: { label: 'Fusion', icon: '🔮' }
};

const INTELLIGENCE_LABELS: Record<string, string> = {
  normal: 'Normal',
  high: 'High',
  'extra-high': 'Extra High',
  max: 'Max'
};

function ChatHeader() {
  const { model, expertise } = useChat();
  
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.modelBadge}>
          <span className={styles.modelBadgeIcon}>{MODEL_LABELS[model]?.icon}</span>
          {MODEL_LABELS[model]?.label}
        </div>
        <span className={styles.intelligenceBadge}>
          {INTELLIGENCE_LABELS[expertise]} Intelligence
        </span>
      </div>
    </header>
  );
}

function ChatInterface() {
  const { messages, isLoading, setLoading, addMessage, model, expertise, browseEnabled } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    if (isLoading) return;
    
    setLoading(true);
    try {
      addMessage(content, 'user');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          model: model,
          intelligence: expertise,
          browse: browseEnabled,
          images: [],
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      addMessage(data.message || 'I apologize, but I encountered an issue generating a response.', 'assistant');
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(`Error: ${error instanceof Error ? error.message : 'An error occurred'}`, 'assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <ChatHeader />
      <div className={styles.messagesArea}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading">
              <div className="loadingDot" />
              <div className="loadingDot" />
              <div className="loadingDot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}

export default function Home() {
  return (
    <BrainProvider>
      <ChatProvider>
        <div style={{ display: 'flex', height: '100vh' }}>
          <Sidebar />
          <main className={styles.main}>
            <ChatInterface />
          </main>
        </div>
      </ChatProvider>
    </BrainProvider>
  );
}
