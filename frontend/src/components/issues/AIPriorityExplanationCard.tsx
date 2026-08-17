import React from 'react';
import { Sparkles, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { PriorityExplanationResult, PriorityCalculationResult } from '../../lib/types';

export interface AIPriorityExplanationCardProps {
  priorityScore: number;
  priorityLevel: string;
  explanation?: string;
  keyFactors?: string[];
  priorityDetails?: PriorityCalculationResult;
  isFallback?: boolean;
}

export const AIPriorityExplanationCard: React.FC<AIPriorityExplanationCardProps> = ({
  priorityScore,
  priorityLevel,
  explanation,
  keyFactors = [],
  priorityDetails,
  isFallback = false
}) => {
  const displayExplanation = explanation || priorityDetails?.explanation_summary || (
    `This issue has been evaluated with a priority score of ${priorityScore}/100 (${priorityLevel.toUpperCase()}) based on reported safety concerns, community support volume, and duration.`
  );

  return (
    <Card
      style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        borderLeft: '4px solid var(--color-accent-600)',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-accent-600)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
            Why This Issue Received {priorityLevel.toUpperCase()} Priority
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            color: 'var(--color-accent-600)',
            backgroundColor: 'var(--color-accent-100)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(0, 173, 181, 0.2)'
          }}
        >
          AI-generated priority explanation
        </span>
      </div>

      <p style={{ fontSize: '0.925rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '12px' }}>
        {displayExplanation}
      </p>

      {/* Structured key factor pills */}
      {keyFactors.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {keyFactors.map((factor, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <CheckCircle2 size={13} color="var(--color-accent-600)" />
              {factor}
            </span>
          ))}
        </div>
      )}

      {/* Priority Factor Breakdown Bar if available */}
      {priorityDetails?.factors && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            fontSize: '0.775rem',
            color: 'var(--color-text-secondary)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '6px' }}>
            <span>Deterministic Urgency Score</span>
            <span style={{ color: 'var(--color-primary-800)' }}>{priorityDetails.priority_score} / 100</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            <span>Severity: {priorityDetails.factors.severity_score}/25</span>
            <span>Accidents: {priorityDetails.factors.accidents_score}/20</span>
            <span>Injuries: {priorityDetails.factors.injuries_score}/15</span>
            <span>Community: {priorityDetails.factors.community_support_score}/15</span>
            <span>Duration: {priorityDetails.factors.duration_score}/10</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '12px' }}>
        <Info size={13} style={{ flexShrink: 0 }} />
        <span>Explanation generated using structured citizen facts only without altering calculated scores.</span>
      </div>
    </Card>
  );
};
