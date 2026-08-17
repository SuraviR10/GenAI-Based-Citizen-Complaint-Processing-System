import React, { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
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
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: '10px 38px 10px 14px',
            fontSize: '0.925rem',
            color: 'var(--color-text-primary)',
            backgroundColor: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg-card)',
            border: `1.5px solid ${error ? 'var(--color-critical)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...style
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronDown size={18} />
        </span>
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

Select.displayName = 'Select';
