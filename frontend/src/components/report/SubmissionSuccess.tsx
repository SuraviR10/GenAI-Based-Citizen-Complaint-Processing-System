import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, Check, Building2, Eye, PlusCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export interface SubmissionSuccessProps {
  complaintId: string;
  issueId: string;
  issueTitle: string;
  status: string;
  wasLinkedToExisting?: boolean;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  complaintId,
  issueId,
  issueTitle,
  status,
  wasLinkedToExisting = false
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(complaintId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem 1rem'
      }}
    >
      {/* 3D Check Circle Icon */}
      <div
        className="icon-container-3d-cyan"
        style={{
          width: '76px',
          height: '76px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px rgba(0, 173, 181, 0.35)'
        }}
      >
        <CheckCircle2 size={42} color="var(--color-accent-600)" strokeWidth={2.5} />
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
        {t.successTitle}
      </h2>

      <p style={{ fontSize: '0.975rem', color: 'var(--color-text-secondary)', maxWidth: '480px', lineHeight: 1.5, marginBottom: '2rem' }}>
        {wasLinkedToExisting ? t.step5Subtitle : t.successSubtitle}
      </p>

      {/* Structured Details Card */}
      <Card style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            {t.step5ReviewHeader}
          </span>
          <Badge type="status" value={status || 'reported'} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {t.identifiedProblem}
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-800)', marginTop: '2px' }}>
              {issueTitle}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {t.trackingReferenceLabel}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <code style={{ fontSize: '0.85rem', backgroundColor: 'var(--color-bg-subtle)', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-primary-800)' }}>
                {complaintId}
              </code>
              <button
                type="button"
                onClick={copyId}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent-600)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={t.copyTrackingId}
              >
                {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={`/citizen/tracking/${issueId}`}>
          <Button variant="cyan" size="lg" leftIcon={<Eye size={18} />}>
            {t.trackProblem}
          </Button>
        </Link>

        <Link to="/citizen">
          <Button variant="secondary" size="lg" leftIcon={<Building2 size={18} />}>
            {t.goToDashboardButton}
          </Button>
        </Link>
      </div>
    </div>
  );
};
