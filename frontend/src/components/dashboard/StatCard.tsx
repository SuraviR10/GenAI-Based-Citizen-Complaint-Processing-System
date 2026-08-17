import React, { ReactNode } from 'react';
import { Card } from '../common/Card';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accentColor?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accentColor = 'var(--color-accent-500)',
  subtitle,
  onClick
}) => {
  return (
    <Card
      isHoverable={Boolean(onClick)}
      onClick={onClick}
      style={{
        padding: '1.25rem 1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      {/* Top row: Label & 3D Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <div
          className="icon-container-3d"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            color: accentColor
          }}
        >
          {icon}
        </div>
      </div>

      {/* Value Counter */}
      <div>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-800)', lineHeight: 1 }}>
          {value}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Subtle bottom indicator bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '1.5rem',
          right: '1.5rem',
          height: '3px',
          backgroundColor: accentColor,
          borderRadius: '2px',
          opacity: 0.8
        }}
      />
    </Card>
  );
};
