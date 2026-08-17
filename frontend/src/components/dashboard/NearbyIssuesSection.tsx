import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ThumbsUp, MessageSquare } from 'lucide-react';
import { CivicIssue } from '../../lib/types';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { getCategoryLabel } from '../../lib/i18n';

export interface NearbyIssuesSectionProps {
  issues: CivicIssue[];
  userArea: string | null;
  loading: boolean;
}

export const NearbyIssuesSection: React.FC<NearbyIssuesSectionProps> = ({
  issues,
  userArea,
  loading
}) => {
  const { language, t } = useLanguage();

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={20} color="var(--color-accent-600)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
              {t.problemsNearYou}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {t.exploreSubtitle} {userArea || 'Gokulam'}
          </p>
        </div>

        <Link
          to="/citizen/issues"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-accent-600)',
            textDecoration: 'none'
          }}
        >
          <span>{t.viewAllCommunityIssues}</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Issues Grid / Empty State */}
      {issues.length === 0 ? (
        <EmptyState
          icon={<MapPin size={28} />}
          title={`${t.noProblemsFound} ${userArea || ''}`}
          description={t.noIssuesDescription}
          actionText={t.reportProblem}
          onAction={() => {}}
          actionHref="/citizen/report"
        />
      ) : (
        <div className="grid-responsive-cards">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/citizen/issues/${issue.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card
                isHoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem'
                }}
              >
                <div>
                  {/* Category & Priority Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
                      {getCategoryLabel(issue.category, language)}
                    </span>
                    <Badge type="priority" value={issue.priority_level} size="sm" />
                  </div>

                  {/* Issue Title */}
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-800)',
                      lineHeight: 1.4,
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {issue.title}
                  </h3>

                  {/* Description snippet */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {issue.description}
                  </p>
                </div>

                {/* Card Footer with counts & status */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.775rem',
                      color: 'var(--color-text-muted)',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--color-border)'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <ThumbsUp size={14} color="var(--color-accent-600)" />
                      {issue.support_count || 0} {t.supporters}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={14} />
                      {issue.complaints_count || 1} {t.myReports}
                    </span>
                    <div style={{ marginLeft: 'auto' }}>
                      <Badge type="status" value={issue.status} size="sm" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
