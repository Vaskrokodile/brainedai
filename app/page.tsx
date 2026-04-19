'use client';

import { ChatProvider, useChat } from '@/context/ChatContext';
import { BrainProvider } from '@/context/BrainContext';
import { MiniSidebar } from '@/components/MiniSidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

function ChatHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerRight}>
        <Link href="/brain" className={styles.settingsButton}>
          <Settings size={18} />
          <span>Brain Settings</span>
        </Link>
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
    <>
      <MiniSidebar />
      <div className={styles.contentWrapper}>
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
      </div>
    </>
  );
}

export default function Home() {
  return (
    <ChatInterface />
  );
}
