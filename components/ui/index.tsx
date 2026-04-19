import { HTMLAttributes, forwardRef } from 'react';
import styles from './styles.module.css';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ghost' | 'elevated';
  children: React.ReactNode;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variantClass = variant === 'default' ? '' : variant;
    return (
      <div
        ref={ref}
        className={`${styles.panel} ${variantClass === 'ghost' ? styles.ghost : variantClass === 'elevated' ? styles.elevated : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'medium', loading = false, className = '', children, disabled, ...props }, ref) => {
    const variantClass = variant === 'primary' ? styles.buttonPrimary : variant === 'icon' ? styles.buttonIcon : styles.buttonGhost;
    const sizeClass = size === 'small' ? styles.buttonSmall : size === 'large' ? styles.buttonLarge : '';
    return (
      <button
        ref={ref}
        className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className={styles.spinner} /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className={styles.inputWrapper}>
        {label && <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>{label}</label>}
        <input ref={ref} className={`${styles.input} ${className}`} {...props} />
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className={styles.inputWrapper}>
        {label && <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>{label}</label>}
        <textarea ref={ref} className={`${styles.input} ${styles.textarea} ${className}`} {...props} />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', ...props }, ref) => {
    return (
      <div className={styles.inputWrapper}>
        {label && <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>{label}</label>}
        <select ref={ref} className={`${styles.input} ${styles.select} ${className}`} {...props}>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

interface PillProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export const Pill = forwardRef<HTMLButtonElement, PillProps>(
  ({ active = false, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.pill} ${active ? styles.pillActive : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Pill.displayName = 'Pill';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className={styles.tooltip}>
      {children}
      <div className={styles.tooltipContent}>{content}</div>
    </div>
  );
}

export function Spinner() {
  return <span className={styles.spinner} />;
}
