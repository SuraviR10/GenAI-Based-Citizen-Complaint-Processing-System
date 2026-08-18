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
    if (status === 'completed' || (status as string) === 'resolved') return 4;
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

  const isResolved = issue.status === 'completed' || (issue.status as string) === 'resolved';
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
              width: isResolved ? '90%' : `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}%`,
              height: '3px',
              backgroundColor: isResolved ? '#10b981' : 'var(--color-accent-500)',
              transition: 'width 0.4s ease',
              zIndex: 2
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const isStepDone = isResolved ? true : idx < currentStepIdx;
            const isCurrent = !isResolved && idx === currentStepIdx;

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
                    backgroundColor: isResolved
                      ? '#10b981'
                      : isStepDone
                      ? 'var(--color-accent-500)'
                      : isCurrent
                      ? 'var(--color-primary-800)'
                      : 'var(--color-bg-card)',
                    color: isStepDone || isCurrent || isResolved ? '#ffffff' : 'var(--color-text-muted)',
                    border: isResolved
                      ? '2px solid #10b981'
                      : isCurrent
                      ? '3px solid var(--color-accent-400)'
                      : isStepDone
                      ? '2px solid var(--color-accent-500)'
                      : '2px solid var(--color-border)',
                    boxShadow: isResolved
                      ? '0 0 12px rgba(16, 185, 129, 0.45)'
                      : isCurrent
                      ? '0 0 12px rgba(0, 173, 181, 0.45)'
                      : 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  {isStepDone || isResolved ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </div>

                <span
                  style={{
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    fontWeight: isCurrent || (isResolved && idx === 4) ? 700 : isStepDone ? 600 : 500,
                    color: isResolved && idx === 4
                      ? '#10b981'
                      : isCurrent
                      ? 'var(--color-primary-800)'
                      : isStepDone
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
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
            backgroundColor: isResolved ? '#f0fdf4' : 'var(--color-bg-subtle)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: isResolved ? '1.5px solid #86efac' : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            className={isResolved ? '' : 'icon-container-3d-cyan'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isResolved ? '#dcfce7' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isResolved ? <Check size={22} color="#16a34a" strokeWidth={3} /> : <Activity size={20} />}
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isResolved ? '#15803d' : 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {isResolved ? 'Issue Resolved' : t.currentStatusBanner}
            </span>
            <p style={{ fontSize: '0.925rem', fontWeight: 700, color: isResolved ? '#166534' : 'var(--color-primary-800)' }}>
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
