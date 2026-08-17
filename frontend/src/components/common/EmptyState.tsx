import React, { ReactNode } from 'react';
import { FileQuestion, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryAction?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px dashed var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        className="icon-container-3d-cyan"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '1.25rem'
        }}
      >
        {icon || <FileQuestion size={32} />}
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
        {description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionText && onAction && (
          <Button variant="cyan" leftIcon={<PlusCircle size={18} />} onClick={onAction}>
            {actionText}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
};
