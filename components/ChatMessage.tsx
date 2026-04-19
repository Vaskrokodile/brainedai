'use client';

import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
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

  const formatContent = (content: string) => {
    if (!content) return '';
    
    let formatted = content;
    
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="${lang || ''}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    formatted = formatted.replace(/^\- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br/>');
    
    formatted = `<p>${formatted}</p>`;
    formatted = formatted.replace(/<p><\/p>/g, '');
    
    return formatted;
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return (
    <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
      <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAssistant}`}>
        {isUser ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 100 100">
            <rect fill="currentColor" width="100" height="100" rx="20"/>
            <text y="70" x="50" textAnchor="middle" fontSize="60" fill="var(--bg-deep)">M</text>
          </svg>
        )}
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={`${styles.content} ${isUser ? styles.contentUser : ''} ${isError ? styles.contentError : ''}`}>
          {message.content && (
            <div dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
          )}
          
          {message.image && (
            <div className={styles.imageContainer}>
              <img src={message.image} alt="Attached" className={styles.attachedImage} />
            </div>
          )}
        </div>
        
        {!isUser && message.content && (
          <div className={`${styles.meta} ${isUser ? styles.metaUser : ''}`}>
            <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
            <button className={styles.copyButton} onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
