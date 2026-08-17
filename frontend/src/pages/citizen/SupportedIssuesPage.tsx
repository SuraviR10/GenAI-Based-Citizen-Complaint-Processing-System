import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { CivicIssue } from '../../lib/types';
import { IssueCard } from '../../components/issues/IssueCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const SupportedIssuesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSupported = async () => {
      setLoading(true);
      const citizenId = user?.id || profile?.id;
      try {
        const data = await api.listSupportedIssues(citizenId);
        setIssues(data);
      } catch (err) {
        console.warn('Error loading supported issues:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSupported();
  }, [user?.id, profile?.id]);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
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
            <ThumbsUp size={24} color="var(--color-accent-600)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
              {t.supportedIssuesTitle}
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {t.supportedIssuesSubtitle}
          </p>
        </div>

        <Link to="/citizen/issues">
          <Button variant="secondary" leftIcon={<Compass size={18} />}>
            {t.exploreMoreIssues}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid-responsive-cards">
          <LoadingSkeleton variant="card" count={4} />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          icon={<ThumbsUp size={32} />}
          title={t.noSupportedIssuesTitle}
          description={t.noSupportedIssuesDesc}
          actionText={t.exploreProblems}
          onAction={() => {}}
          actionHref="/citizen/issues"
        />
      ) : (
        <div className="grid-responsive-cards">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};
