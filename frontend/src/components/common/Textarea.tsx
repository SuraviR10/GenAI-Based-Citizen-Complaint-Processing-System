import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  maxCharacters?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  isRequired = false,
  maxCharacters,
  value,
  id,
  className = '',
  style,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-primary-800)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {label}
            {isRequired && <span style={{ color: 'var(--color-critical)' }}>*</span>}
          </label>
          {maxCharacters && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {currentLength} / {maxCharacters}
            </span>
          )}
        </div>
      )}

      <textarea
        ref={ref}
        id={inputId}
        value={value}
        disabled={disabled}
        maxLength={maxCharacters}
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '12px 14px',
          fontSize: '0.925rem',
          lineHeight: '1.6',
          color: 'var(--color-text-primary)',
          backgroundColor: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg-card)',
          border: `1.5px solid ${error ? 'var(--color-critical)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          outline: 'none',
          resize: 'vertical',
          ...style
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {error && (
        <span id={`${inputId}-error`} style={{ fontSize: '0.8rem', color: 'var(--color-critical)', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
