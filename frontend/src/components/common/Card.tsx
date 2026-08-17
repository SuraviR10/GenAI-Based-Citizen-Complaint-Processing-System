import React, { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  isHoverable?: boolean;
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  isHoverable = false,
  children,
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'glass':
        return {
          background: 'var(--color-bg-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: 'var(--shadow-lg)'
        };
      case 'elevated':
        return {
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-3d)'
        };
      case 'bordered':
        return {
          background: 'var(--color-bg-card)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'none'
        };
      default:
        return {
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)'
        };
    }
  };

  return (
    <div
      className={`card-3d ${isHoverable ? 'card-3d-hover' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};
