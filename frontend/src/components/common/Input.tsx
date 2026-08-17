import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isRequired = false,
  id,
  className = '',
  style,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
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
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          style={{
            width: '100%',
            padding: leftIcon ? '10px 14px 10px 40px' : rightIcon ? '10px 40px 10px 14px' : '10px 14px',
            fontSize: '0.925rem',
            color: 'var(--color-text-primary)',
            backgroundColor: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg-card)',
            border: `1.5px solid ${error ? 'var(--color-critical)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            ...style
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {rightIcon && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>

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

Input.displayName = 'Input';
