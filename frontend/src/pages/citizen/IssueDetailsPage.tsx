import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Camera, 
  Activity, 
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { CivicIssueDetail } from '../../lib/types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Timeline } from '../../components/common/Timeline';
import { SupportButton } from '../../components/issues/SupportButton';
import { AISummaryCard } from '../../components/issues/AISummaryCard';
import { WhyNeedsAttentionCard } from '../../components/issues/WhyNeedsAttentionCard';
import { CorroborationCard } from '../../components/issues/CorroborationCard';
import { AIPriorityExplanationCard } from '../../components/issues/AIPriorityExplanationCard';
import { CorporationResponseCard } from '../../components/issues/CorporationResponseCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { getCategoryLabel } from '../../lib/i18n';

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { success } = useToast();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<CivicIssueDetail | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ explanation?: string; key_factors_summary?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await api.getIssueDetail(id, user?.id);
        setIssue(data);

        // Fetch GenAI priority explanation
        api.getIssuePriorityExplanation(id, language)
          .then((exp) => setAiExplanation(exp))
          .catch((err) => console.warn('AI priority explanation fetch:', err));
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not load civic issue details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, user?.id, language]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success(t.shareIssue, t.copyTrackingId);
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

  return (
    <div className="container container-narrow" style={{ paddingTop: '1.5rem' }}>
      {/* Back Button & Share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
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

        <Button variant="secondary" size="sm" leftIcon={<Share2 size={14} />} onClick={handleShare}>
          {t.shareIssue}
        </Button>
      </div>

      {/* Main Issue Header Card with 3D Depth */}
      <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        {/* Category & Status Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-accent-600)',
                backgroundColor: 'var(--color-accent-100)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(0, 173, 181, 0.2)'
              }}
            >
              {getCategoryLabel(issue.category, language)}
            </span>
            <Badge type="priority" value={issue.priority_level} />
          </div>

          <Badge type="status" value={issue.status} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-800)', lineHeight: 1.3, marginBottom: '1rem' }}>
          {issue.title}
        </h1>

        {/* Location & Reported Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <MapPin size={16} color="var(--color-accent-600)" />
            {issue.area} {issue.landmark ? `• Near ${issue.landmark}` : ''}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={16} />
            {new Date(issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Full Description */}
        <p style={{ fontSize: '0.975rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {issue.description}
        </p>

        {/* Support CTA Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
              {issue.support_count || 0} {t.supporters}
            </p>
            <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
              {t.similarFoundDesc}
            </p>
          </div>

          <SupportButton
            issueId={issue.id}
            initialSupported={issue.has_user_supported}
            initialCount={issue.support_count}
            size="md"
          />
        </div>
      </Card>

      {/* AI-Generated Summary if available */}
      {issue.simplified_response && (
        <AISummaryCard summary={issue.simplified_response} />
      )}

      {/* Why this issue needs attention - System Priority Assessment */}
      <WhyNeedsAttentionCard
        safetyReported={issue.priority_level === 'critical' || issue.priority_level === 'high'}
        accidentsCount={(issue as any).complaints_summary?.citizen_reported_accidents || issue.accident_reports_count || 0}
        supportCount={issue.support_count || 0}
        complaintsCount={issue.complaints_count || 1}
        priorityLevel={issue.priority_level}
      />

      {/* GenAI Priority Explanation */}
      <AIPriorityExplanationCard
        priorityScore={issue.priority_score}
        priorityLevel={issue.priority_level}
        priorityDetails={issue.priority_details}
        explanation={aiExplanation?.explanation}
        keyFactors={aiExplanation?.key_factors_summary}
      />

      {/* Community Corroboration Card */}
      <CorroborationCard
        corroboration={issue.corroboration_details}
        corroborationLevel={issue.corroboration_level || 'moderate'}
        supportCount={issue.support_count || 0}
        complaintsCount={issue.complaints_count || 1}
        evidenceCount={issue.evidence?.length || issue.evidence_count || 0}
        accidentsCount={(issue as any).complaints_summary?.citizen_reported_accidents || issue.accident_reports_count || 0}
        injuriesCount={(issue as any).complaints_summary?.citizen_reported_injuries || issue.injuries_count || 0}
      />

      {/* Corporation Response if present */}
      {issue.official_response && (
        <CorporationResponseCard
          officialResponse={issue.official_response}
          simplifiedResponse={issue.simplified_response}
          createdAt={issue.updated_at}
        />
      )}

      {/* Photos & Evidence Gallery */}
      {issue.evidence && issue.evidence.length > 0 && (
        <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Camera size={18} color="var(--color-accent-600)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
              {t.step5EvidenceFiles} ({issue.evidence.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {issue.evidence.map((evi) => (
              <a
                key={evi.id}
                href={evi.storage_path}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  aspectRatio: '1',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <img
                  src={evi.storage_path}
                  alt="Civic issue evidence"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Real Chronological Progress Timeline */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Activity size={18} color="var(--color-accent-600)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
            {t.officialProgressTimeline}
          </h3>
        </div>

        <Timeline updates={issue.updates} currentStatus={issue.status} />
      </Card>
    </div>
  );
};
