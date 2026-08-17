import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'cyan';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isFullWidth?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  isFullWidth = false,
  isDisabled,
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const actualDisabled = disabled || isDisabled || isLoading;
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '0.825rem', borderRadius: '8px', gap: '6px' },
    md: { padding: '10px 18px', fontSize: '0.925rem', borderRadius: '10px', gap: '8px' },
    lg: { padding: '14px 24px', fontSize: '1.025rem', borderRadius: '12px', gap: '10px' }
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary-800)',
      color: '#ffffff',
      border: '1px solid var(--color-primary-700)',
      boxShadow: '0 4px 12px rgba(11, 25, 44, 0.2)'
    },
    secondary: {
      backgroundColor: 'var(--color-bg-subtle)',
      color: 'var(--color-primary-800)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    },
    cyan: {
      backgroundColor: 'var(--color-accent-500)',
      color: '#ffffff',
      border: '1px solid var(--color-accent-600)',
      boxShadow: '0 4px 14px rgba(0, 173, 181, 0.35)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary-800)',
      border: '1.5px solid var(--color-border)'
    },
    danger: {
      backgroundColor: 'var(--color-critical)',
      color: '#ffffff',
      border: '1px solid #dc2626',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid transparent'
    }
  };

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        cursor: actualDisabled ? 'not-allowed' : 'pointer',
        opacity: actualDisabled ? 0.6 : 1,
        transition: 'all var(--transition-normal)',
        width: isFullWidth ? '100%' : 'auto',
        textDecoration: 'none',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
      disabled={actualDisabled}
      {...props}
    >
      {isLoading && <Loader2 size={18} className="animate-spin" style={{ marginRight: '6px' }} />}
      {!isLoading && leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
    </button>
  );
};
