import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { CivicIssue } from '../../lib/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { SupportButton } from './SupportButton';
import { useLanguage } from '../../context/LanguageContext';
import { getCategoryLabel } from '../../lib/i18n';

export interface IssueCardProps {
  issue: CivicIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { language, t } = useLanguage();

  return (
    <Card
      isHoverable
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div>
        {/* Top: Category & Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-accent-600)',
              backgroundColor: 'var(--color-accent-100)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(0, 173, 181, 0.2)'
            }}
          >
            {getCategoryLabel(issue.category, language)}
          </span>
          <Badge type="priority" value={issue.priority_level} size="sm" />
        </div>

        {/* Title */}
        <Link to={`/citizen/issues/${issue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--color-primary-800)',
              lineHeight: 1.35,
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {issue.title}
          </h3>
        </Link>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
          <MapPin size={15} color="var(--color-accent-600)" />
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{issue.area}</span>
          {issue.landmark && <span>• Near {issue.landmark}</span>}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {issue.description}
        </p>
      </div>

      {/* Footer with counts and actions */}
      <div>
        {issue.latest_update && (
          <div
            style={{
              fontSize: '0.775rem',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: '6px 10px',
              borderRadius: '6px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <Clock size={13} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Latest: {issue.latest_update}
            </span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SupportButton
              issueId={issue.id}
              initialSupported={issue.has_user_supported}
              initialCount={issue.support_count}
              size="sm"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={14} /> {issue.complaints_count || 1}
            </span>
          </div>

          <Link
            to={`/citizen/issues/${issue.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-accent-600)',
              textDecoration: 'none'
            }}
          >
            <span>{t.viewDetailsAction}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
};
