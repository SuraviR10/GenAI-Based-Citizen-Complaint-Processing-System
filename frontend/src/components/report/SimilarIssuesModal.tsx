import React from 'react';
import { SimilarIssueMatch } from '../../lib/types';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ThumbsUp, MessageSquare, MapPin, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface SimilarIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: SimilarIssueMatch[];
  onSelectExistingIssue: (issueId: string) => void;
  onProceedAsNew: () => void;
  isLinking?: boolean;
}

export const SimilarIssuesModal: React.FC<SimilarIssuesModalProps> = ({
  isOpen,
  onClose,
  matches,
  onSelectExistingIssue,
  onProceedAsNew,
  isLinking = false
}) => {
  const { t } = useLanguage();

  if (!matches || matches.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.similarModalTitle}
      subtitle={t.similarModalSubtitle}
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Button variant="outline" onClick={onProceedAsNew}>
            {t.differentProblemButton}
          </Button>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {t.similarFoundDesc}
          </span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {matches.map((match) => (
          <Card
            key={match.id}
            style={{
              padding: '1.25rem',
              border: '1.5px solid var(--color-accent-400)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {/* Header: Area & Priority */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-accent-600)', fontWeight: 700 }}>
                <MapPin size={14} />
                <span>{match.area}</span>
                {match.landmark && <span>• Near {match.landmark}</span>}
              </div>
              <Badge type="priority" value={match.priority_level} size="sm" />
            </div>

            {/* Title */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary-800)', lineHeight: 1.4, marginBottom: '6px' }}>
              {match.title}
            </h4>

            {/* Description */}
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              {match.description}
            </p>

            {/* Friendly match reasons */}
            {match.match_reasons && match.match_reasons.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-accent-100)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  color: 'var(--color-accent-600)',
                  marginBottom: '12px'
                }}
              >
                <Sparkles size={14} style={{ flexShrink: 0 }} />
                <span><strong>{t.similarMatchScore}:</strong> {match.match_reasons.join(', ')}</span>
              </div>
            )}

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <ThumbsUp size={14} color="var(--color-accent-600)" />
                  {match.support_count || 0} {t.supporters}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MessageSquare size={14} />
                  {match.complaint_count || 1} {t.myReports}
                </span>
              </div>

              <Button
                variant="cyan"
                size="sm"
                leftIcon={<Check size={16} />}
                onClick={() => onSelectExistingIssue(match.id)}
                isLoading={isLinking}
              >
                {t.sameProblemButton}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
};
