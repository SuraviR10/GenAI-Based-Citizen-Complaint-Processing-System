import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while communicating with the civic services.',
  onRetry
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-critical-bg)',
        border: '1px solid var(--color-critical-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#ffffff',
          color: 'var(--color-critical)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1rem'
        }}
      >
        <AlertTriangle size={28} />
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#b91c1c', maxWidth: '440px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={16} />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
