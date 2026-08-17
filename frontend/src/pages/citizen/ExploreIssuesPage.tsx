import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Compass, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { CivicIssue } from '../../lib/types';
import { IssueCard } from '../../components/issues/IssueCard';
import { IssueFilterBar } from '../../components/issues/IssueFilterBar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const ExploreIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [area, setArea] = useState(searchParams.get('area') || 'all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Debounce search/filter query to API
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const data = await api.listIssues({
          search: search || undefined,
          category: category !== 'all' ? category : undefined,
          area: area !== 'all' ? area : undefined,
          priority: priority !== 'all' ? priority : undefined,
          status: status !== 'all' ? status : undefined,
          sort,
          citizen_id: user?.id,
          limit: 50
        });
        setIssues(data);
      } catch (err) {
        console.warn('Error querying issues:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchIssues, 250);
    return () => clearTimeout(timer);
  }, [search, category, area, priority, status, sort, user?.id]);

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
            <Compass size={24} color="var(--color-accent-600)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
              {t.exploreTitle}
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {t.exploreSubtitle}
          </p>
        </div>

        <Link to="/citizen/report">
          <Button variant="cyan" leftIcon={<PlusCircle size={18} />}>
            {t.reportProblem}
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <IssueFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        area={area}
        onAreaChange={setArea}
        priority={priority}
        onPriorityChange={setPriority}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Issues Grid / Results */}
      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={<Compass size={32} />}
          title={t.noProblemsFound}
          description={t.noIssuesDescription}
          actionText={t.reportProblem}
          onAction={() => {}}
          actionHref="/citizen/report"
        />
      ) : (
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            {issues.length} {t.communityIssues}
          </div>
          <div className="grid-responsive-cards">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
