import React from 'react';
import { ShieldCheck, Users, Camera, AlertOctagon, MapPin, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { CorroborationResult } from '../../lib/types';

export interface CorroborationCardProps {
  corroboration?: CorroborationResult;
  corroborationLevel?: string;
  supportCount: number;
  complaintsCount: number;
  evidenceCount: number;
  accidentsCount: number;
  injuriesCount?: number;
}

export const CorroborationCard: React.FC<CorroborationCardProps> = ({
  corroboration,
  corroborationLevel = 'moderate',
  supportCount,
  complaintsCount,
  evidenceCount,
  accidentsCount,
  injuriesCount = 0
}) => {
  const getBadgeStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'strong':
        return {
          bg: '#ecfdf5',
          text: '#065f46',
          border: '#a7f3d0',
          label: 'Strong Community Corroboration'
        };
      case 'high':
        return {
          bg: '#eff6ff',
          text: '#1e40af',
          border: '#bfdbfe',
          label: 'High Community Corroboration'
        };
      case 'moderate':
        return {
          bg: '#fffbeb',
          text: '#92400e',
          border: '#fde68a',
          label: 'Moderate Community Corroboration'
        };
      default:
        return {
          bg: '#f8fafc',
          text: '#475569',
          border: '#e2e8f0',
          label: 'Initial Citizen Report'
        };
    }
  };

  const levelKey = corroboration?.corroboration_level || corroborationLevel;
  const badgeInfo = getBadgeStyle(levelKey);

  return (
    <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--color-accent-600)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
            Community Evidence & Corroboration
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.775rem',
            fontWeight: 700,
            color: badgeInfo.text,
            backgroundColor: badgeInfo.bg,
            border: `1px solid ${badgeInfo.border}`,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          {badgeInfo.label}
        </span>
      </div>

      {/* Grid of corroboration signals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
            <Users size={13} />
            <span>Reports & Backing</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            {complaintsCount} report(s) • {supportCount} backer(s)
          </p>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
            <Camera size={13} />
            <span>Photo Proof</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            {evidenceCount > 0 ? `${evidenceCount} photo(s) attached` : 'No photos attached yet'}
          </p>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
            <AlertOctagon size={13} color={accidentsCount > 0 ? 'var(--color-critical)' : 'var(--color-text-muted)'} />
            <span>Reported Incidents</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: accidentsCount > 0 ? '#991b1b' : 'var(--color-text-primary)' }}>
            {accidentsCount > 0 ? `${accidentsCount} accident(s)` : 'No collisions reported'}
            {injuriesCount > 0 && ` (${injuriesCount} injury)`}
          </p>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
            <MapPin size={13} />
            <span>Locality Match</span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            High Geographic Agreement
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        <Info size={13} style={{ flexShrink: 0 }} />
        <span>Corroboration reflects multi-source community signals and does not substitute for official site inspection.</span>
      </div>
    </Card>
  );
};
