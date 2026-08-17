import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Activity,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { CivicIssueDetail, IssueStatus } from '../../lib/types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Timeline } from '../../components/common/Timeline';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { getCategoryLabel } from '../../lib/i18n';

export const TrackingPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<CivicIssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const STATUS_STEPS: Array<{ key: IssueStatus; label: string; description: string }> = [
    { key: 'reported', label: t.reportedStatus, description: t.trackingStep1Desc },
    { key: 'reviewed', label: t.reviewedStatus, description: t.trackingStep2Desc },
    { key: 'assigned', label: t.assignedStatus, description: t.trackingStep3Desc },
    { key: 'in_progress', label: t.inProgressStatus, description: t.trackingStep4Desc },
    { key: 'completed', label: t.resolvedStatus, description: t.trackingStep5Desc }
  ];

  useEffect(() => {
    if (!issueId) return;

    const loadTracking = async () => {
      setLoading(true);
      try {
        const data = await api.getIssueDetail(issueId, user?.id);
        setIssue(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not load tracking information.');
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [issueId, user?.id]);

  const getCurrentStepIndex = (status: IssueStatus) => {
    const order: IssueStatus[] = ['reported', 'reviewed', 'assigned', 'in_progress', 'completed'];
    const idx = order.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="container container-narrow" style={{ paddingTop: '2rem' }}>
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  if (errorMsg || !issue) {
    return (
      <div className="container container-narrow" style={{ paddingTop: '3rem' }}>
        <ErrorState
          title={t.noProblemsFound}
          message={errorMsg || t.noIssuesDescription}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const currentStepIdx = getCurrentStepIndex(issue.status);

  return (
    <div className="container container-narrow" style={{ paddingTop: '1.5rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={16} />
          <span>{t.backButton}</span>
        </button>
      </div>

      {/* Header Card */}
      <Card style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-600)', textTransform: 'uppercase' }}>
            {getCategoryLabel(issue.category, language)} • {t.trackingReferenceLabel}: #{issue.id.slice(0, 8)}
          </span>
          <Badge type="status" value={issue.status} />
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-800)', lineHeight: 1.35, marginBottom: '8px' }}>
          {issue.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            <MapPin size={14} color="var(--color-accent-600)" />
            {issue.area} {issue.landmark ? `(Near ${issue.landmark})` : ''}
          </span>
          <span>•</span>
          <span>{new Date(issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </Card>

      {/* Visual Tracking Stepper Card */}
      <Card style={{ padding: '2rem 1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '1.75rem', textAlign: 'center' }}>
          {t.realTimeProgressTitle}
        </h3>

        {/* Stepper Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '640px', margin: '0 auto 2rem auto' }}>
          {/* Connector Line */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '5%',
              right: '5%',
              height: '3px',
              backgroundColor: 'var(--color-border)',
              zIndex: 1
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '5%',
              width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}%`,
              height: '3px',
              backgroundColor: 'var(--color-accent-500)',
              transition: 'width 0.4s ease',
              zIndex: 2
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 3,
                  width: `${100 / STATUS_STEPS.length}%`
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isDone
                      ? 'var(--color-accent-500)'
                      : isCurrent
                      ? 'var(--color-primary-800)'
                      : 'var(--color-bg-card)',
                    color: isDone || isCurrent ? '#ffffff' : 'var(--color-text-muted)',
                    border: isCurrent
                      ? '3px solid var(--color-accent-400)'
                      : isDone
                      ? '2px solid var(--color-accent-500)'
                      : '2px solid var(--color-border)',
                    boxShadow: isCurrent ? '0 0 12px rgba(0, 173, 181, 0.45)' : 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </div>

                <span
                  style={{
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                    color: isCurrent ? 'var(--color-primary-800)' : isDone ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current State Info Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div className="icon-container-3d-cyan" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)' }}>
            <Activity size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {t.currentStatusBanner}
            </span>
            <p style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
              {STATUS_STEPS[currentStepIdx]?.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Chronological Action Updates Timeline */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '1rem' }}>
          {t.detailedWorkTimeline}
        </h3>
        <Timeline updates={issue.updates} currentStatus={issue.status} />
      </Card>
    </div>
  );
};
