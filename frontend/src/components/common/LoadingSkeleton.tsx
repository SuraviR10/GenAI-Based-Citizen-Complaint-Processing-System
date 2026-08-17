import React from 'react';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'line' | 'avatar' | 'list';
  count?: number;
  height?: string;
  width?: string;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  height,
  width = '100%',
  className = ''
}) => {
  const shimmerStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 'var(--radius-md)'
  };

  const renderSkeleton = (key: number) => {
    if (variant === 'line') {
      return (
        <div
          key={key}
          style={{
            ...shimmerStyle,
            height: height || '16px',
            width,
            marginBottom: '8px'
          }}
        />
      );
    }

    if (variant === 'avatar') {
      return (
        <div
          key={key}
          style={{
            ...shimmerStyle,
            width: width || '44px',
            height: height || '44px',
            borderRadius: 'var(--radius-full)'
          }}
        />
      );
    }

    if (variant === 'list') {
      return (
        <div
          key={key}
          style={{
            padding: '1rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            backgroundColor: 'var(--color-bg-card)'
          }}
        >
          <div style={{ ...shimmerStyle, height: '18px', width: '60%', marginBottom: '10px' }} />
          <div style={{ ...shimmerStyle, height: '14px', width: '90%', marginBottom: '6px' }} />
          <div style={{ ...shimmerStyle, height: '14px', width: '40%' }} />
        </div>
      );
    }

    // Default 'card' skeleton
    return (
      <div
        key={key}
        className="card-3d"
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          backgroundColor: 'var(--color-bg-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ ...shimmerStyle, height: '22px', width: '30%', borderRadius: 'var(--radius-full)' }} />
          <div style={{ ...shimmerStyle, height: '22px', width: '20%', borderRadius: 'var(--radius-full)' }} />
        </div>
        <div style={{ ...shimmerStyle, height: '20px', width: '75%', marginBottom: '12px' }} />
        <div style={{ ...shimmerStyle, height: '14px', width: '100%', marginBottom: '6px' }} />
        <div style={{ ...shimmerStyle, height: '14px', width: '85%', marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ ...shimmerStyle, height: '16px', width: '35%' }} />
          <div style={{ ...shimmerStyle, height: '32px', width: '25%', borderRadius: '8px' }} />
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </>
  );
};
