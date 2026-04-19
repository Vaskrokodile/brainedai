'use client';

import React, { useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { IntelligenceDropdown } from '@/components/IntelligenceDropdown';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { browseEnabled, setBrowseEnabled, isLoading } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
      setImages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {images.length > 0 && (
        <div className={styles.imagesPreview}>
          {images.map((img, i) => (
            <div key={i} className={styles.imageThumb}>
              <img src={img} alt={`Upload ${i + 1}`} />
              <button type="button" onClick={() => removeImage(i)} className={styles.removeImage}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.inputWrapper}>
        <div className={styles.actions}>
          <IntelligenceDropdown />
          <label className={styles.actionBtn} title="Attach image">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </label>
          <button
            type="button"
            className={`${styles.actionBtn} ${browseEnabled ? styles.active : ''}`}
            onClick={() => setBrowseEnabled(!browseEnabled)}
            title={browseEnabled ? 'Disable web search' : 'Enable web search'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? 'Waiting for response...' : 'Message Minecom Intelligence...'}
          className={styles.textarea}
          rows={1}
          disabled={disabled || isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className={styles.sendBtn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22,2 15,22 11,13 2,9"/>
          </svg>
        </button>
      </div>
    </form>
  );
}
