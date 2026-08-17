import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface AISummaryCardProps {
  summary: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <Card
      style={{
        backgroundColor: '#f0fdfa',
        border: '1.5px solid #99f6e4',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#0d9488" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e' }}>
            AI-Generated Summary
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#0d9488', opacity: 0.9 }}>
          Automated Triage Synthesis
        </span>
      </div>

      <p style={{ fontSize: '0.925rem', color: '#134e4a', lineHeight: 1.55 }}>
        {summary}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#0d9488', marginTop: '8px' }}>
        <Info size={13} />
        <span>Generated from consolidated citizen reports to aid quick comprehension.</span>
      </div>
    </Card>
  );
};
