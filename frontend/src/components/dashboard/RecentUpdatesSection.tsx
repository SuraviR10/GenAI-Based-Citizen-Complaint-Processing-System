import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';

export interface RecentUpdateItem {
  id: string;
  issue_id: string;
  issue_title: string;
  status: string;
  description: string;
  created_at: string;
}

export interface RecentUpdatesSectionProps {
  updates: RecentUpdateItem[];
}

export const RecentUpdatesSection: React.FC<RecentUpdatesSectionProps> = ({ updates }) => {
  const { t } = useLanguage();

  if (!updates || updates.length === 0) {
    return (
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Activity size={20} color="var(--color-accent-600)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            {t.recentUpdatesTitle}
          </h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {t.recentUpdatesEmpty}
        </p>
      </Card>
    );
  }

  return (
    <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--color-accent-600)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            {t.recentUpdatesTitle}
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {updates.map((item) => (
          <Link
            key={item.id}
            to={`/citizen/tracking/${item.issue_id}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Badge type="status" value={item.status} size="sm" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.issue_title}
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {item.description}
              </p>
              <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ color: 'var(--color-accent-600)', marginTop: '4px' }}>
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};
