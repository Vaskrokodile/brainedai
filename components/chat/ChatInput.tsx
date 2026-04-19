'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Image, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useBrain } from '@/context/BrainContext';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, isLoading, model, browseEnabled } = useChat();
  const { brainContent, soulContent } = useBrain();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    if ((!input.trim() && images.length === 0) || isLoading || disabled) return;
    
    const text = input.trim();
    
    if (onSend) {
      onSend(text);
      setInput('');
      setImages([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      return;
    }
    
    setInput('');
    setImages([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      const skillsContent = '';
      const fullBrain = `${brainContent}\n\n${soulContent}${skillsContent ? '\n\n' + skillsContent : ''}`;
      await sendMessage(text, fullBrain, '');
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          setImages(prev => [...prev, result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        {images.length > 0 && (
          <div className={styles.attachments}>
            {images.map((img, idx) => (
              <div key={idx} className={styles.attachment}>
                <img src={img} alt={`Attachment ${idx + 1}`} className={styles.attachmentImage} />
                <button
                  className={styles.attachmentRemove}
                  onClick={() => removeImage(idx)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.inputRow}>
          <div className={styles.inputContainer}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Message MineCom Intelligence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>

          <div className={styles.actions}>
            {(model === 'gemini' || model === 'fusion') && (
              <button
                className={styles.actionButton}
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
              >
                <Image size={18} />
              </button>
            )}
            
            <button
              className={styles.sendButton}
              onClick={handleSubmit}
              disabled={(!input.trim() && images.length === 0) || isLoading || disabled}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className={styles.hint}>
          Press <span className={styles.hintKey}>Enter</span> to send, <span className={styles.hintKey}>Shift</span> + <span className={styles.hintKey}>Enter</span> for new line
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className={styles.hiddenInput}
        />
      </div>
    </div>
  );
}
