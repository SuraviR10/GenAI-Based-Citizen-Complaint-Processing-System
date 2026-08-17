import React from 'react';
import { AlertTriangle, ThumbsUp, Users, Clock, ShieldAlert, Info } from 'lucide-react';
import { Card } from '../common/Card';

export interface WhyNeedsAttentionProps {
  safetyReported: boolean;
  accidentsCount: number;
  supportCount: number;
  complaintsCount: number;
  priorityLevel: string;
}

export const WhyNeedsAttentionCard: React.FC<WhyNeedsAttentionProps> = ({
  safetyReported,
  accidentsCount,
  supportCount,
  complaintsCount,
  priorityLevel
}) => {
  return (
    <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
          Why this issue needs attention
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '3px 8px',
            borderRadius: '4px'
          }}
        >
          Citizen-reported information
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {/* Safety Factor */}
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: safetyReported || accidentsCount > 0 ? '#fef2f2' : 'var(--color-bg-subtle)',
            border: `1px solid ${safetyReported || accidentsCount > 0 ? '#fecaca' : 'var(--color-border)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: safetyReported ? 'var(--color-critical)' : 'var(--color-text-secondary)', marginBottom: '4px' }}>
            <ShieldAlert size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Safety Hazard</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: safetyReported ? '#991b1b' : 'var(--color-text-primary)' }}>
            {accidentsCount > 0
              ? `${accidentsCount} citizen-reported collision(s)`
              : safetyReported
              ? 'Active hazard flagged'
              : 'No collisions reported'}
          </p>
        </div>

        {/* Community Support */}
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-600)', marginBottom: '4px' }}>
            <ThumbsUp size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Community Backing</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            {supportCount} verified supporters
          </p>
        </div>

        {/* Number of Reports */}
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', marginBottom: '4px' }}>
            <Users size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Citizen Complaints</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            {complaintsCount} combined citizen report(s)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '12px' }}>
        <Info size={13} />
        <span>Priority scores are calculated based on safety impact, community support volume, and duration.</span>
      </div>
    </Card>
  );
};
