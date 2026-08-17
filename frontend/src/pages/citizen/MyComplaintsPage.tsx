import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, ArrowRight, Eye, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { Complaint } from '../../lib/types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { getCategoryLabel } from '../../lib/i18n';

export const MyComplaintsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      const citizenId = user?.id || profile?.id;
      try {
        const data = await api.listMyComplaints(citizenId);
        setComplaints(data);
      } catch (err) {
        console.warn('Error loading citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [user?.id, profile?.id]);

  return (
    <div className="container container-narrow" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="var(--color-accent-600)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
              {t.myComplaintsTitle}
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {t.myComplaintsSubtitle}
          </p>
        </div>

        <Link to="/citizen/report">
          <Button variant="cyan" leftIcon={<PlusCircle size={18} />}>
            {t.reportProblem}
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title={t.noComplaintsTitle}
          description={t.noComplaintsDescription}
          actionText={t.reportProblem}
          onAction={() => {}}
          actionHref="/citizen/report"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map((comp) => (
            <Card key={comp.id} isHoverable style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-accent-600)',
                    backgroundColor: 'var(--color-accent-100)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {getCategoryLabel(comp.category || 'General Civic', language)}
                </span>
                <Badge type="status" value={comp.status} size="sm" />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
                {comp.normalized_text || comp.original_text}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--color-accent-600)" />
                  {comp.area} {comp.landmark ? `• Near ${comp.landmark}` : ''}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {new Date(comp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {comp.civic_issue_id && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                    {t.connectedToCommunityIssue}: <strong>{comp.issue?.title || (comp as any).issue_title || comp.normalized_text || 'Civic Issue'}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/citizen/issues/${comp.civic_issue_id}`}>
                      <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>
                        {t.viewDetailsAction}
                      </Button>
                    </Link>
                    <Link to={`/citizen/tracking/${comp.civic_issue_id}`}>
                      <Button variant="cyan" size="sm" rightIcon={<ArrowRight size={14} />}>
                        {t.trackProgressAction}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
