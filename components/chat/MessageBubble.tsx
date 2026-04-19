'use client';

import { useState } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

export function MessageBubble({ message, isLoading = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUser = message.role === 'user';
  const isError = message.content.toLowerCase().includes('error');

  return (
    <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
      <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAssistant}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      <div style={{ flex: 1 }}>
        <div className={`${styles.content} ${isUser ? styles.contentUser : styles.contentAssistant} ${isError ? styles.contentError : ''}`}>
          {message.content || (isLoading && (
            <div className={styles.typing}>
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
            </div>
          ))}
          
          {message.image && (
            <div className={styles.imageContainer}>
              <img src={message.image} alt="Attached" className={styles.attachedImage} />
            </div>
          )}
        </div>
        
        {!isLoading && message.content && (
          <div className={`${styles.meta} ${isUser ? styles.metaUser : ''}`}>
            <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
            <button className={styles.copyButton} onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
