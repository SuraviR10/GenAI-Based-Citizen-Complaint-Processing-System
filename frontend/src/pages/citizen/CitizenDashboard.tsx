import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ThumbsUp, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { CivicIssue, CitizenDashboardStats } from '../../lib/types';
import { HeroBanner } from '../../components/dashboard/HeroBanner';
import { StatCard } from '../../components/dashboard/StatCard';
import { NearbyIssuesSection } from '../../components/dashboard/NearbyIssuesSection';
import { RecentUpdatesSection, RecentUpdateItem } from '../../components/dashboard/RecentUpdatesSection';
import { QuickActionGrid } from '../../components/dashboard/QuickActionGrid';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const CitizenDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState<CitizenDashboardStats>({
    my_reports_count: 0,
    supported_issues_count: 0,
    in_progress_count: 0,
    resolved_count: 0,
    nearby_issues_count: 0,
    user_area: profile?.area || 'Gokulam'
  });

  const [nearbyIssues, setNearbyIssues] = useState<CivicIssue[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const citizenId = user?.id || profile?.id;
      const userArea = profile?.area || 'Gokulam';

      try {
        // 1. Fetch Real Stats
        const statsData = await api.getDashboardStats(citizenId, userArea);
        setStats(statsData);

        // 2. Fetch Nearby Issues in User's Area
        const issuesData = await api.listIssues({
          area: userArea,
          status: 'all',
          citizen_id: citizenId,
          limit: 6
        });
        setNearbyIssues(issuesData);

        // 3. Extract Recent Updates
        const updatesList: RecentUpdateItem[] = [];
        for (const issue of issuesData) {
          if (issue.latest_update) {
            updatesList.push({
              id: `${issue.id}_upd`,
              issue_id: issue.id,
              issue_title: issue.title,
              status: issue.status,
              description: issue.latest_update,
              created_at: issue.updated_at
            });
          }
        }
        setRecentUpdates(updatesList.slice(0, 4));
      } catch (err) {
        console.warn('Could not fetch real dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, profile?.area]);

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      {/* Hero Visual Area */}
      <HeroBanner
        userName={profile?.full_name}
        userArea={profile?.area || stats.user_area}
      />

      {/* Real Statistics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        <StatCard
          label={t.myReports}
          value={stats.my_reports_count}
          subtitle={t.dashboard}
          icon={<FileText size={20} />}
          accentColor="var(--color-primary-800)"
          onClick={() => navigate('/citizen/complaints')}
        />

        <StatCard
          label={t.supportedIssues}
          value={stats.supported_issues_count}
          subtitle={t.communityIssues}
          icon={<ThumbsUp size={20} />}
          accentColor="var(--color-accent-500)"
          onClick={() => navigate('/citizen/supported')}
        />

        <StatCard
          label={t.inProgressStatus}
          value={stats.in_progress_count}
          subtitle={t.activeRepairs}
          icon={<Clock size={20} />}
          accentColor="#f59e0b"
          onClick={() => navigate('/citizen/issues?status=in_progress')}
        />

        <StatCard
          label={t.resolvedStatus}
          value={stats.resolved_count}
          subtitle={t.completedFixes}
          icon={<CheckCircle2 size={20} />}
          accentColor="var(--color-success)"
          onClick={() => navigate('/citizen/issues?status=completed')}
        />
      </div>

      {loading ? (
        <div style={{ marginBottom: '2.5rem' }}>
          <LoadingSkeleton variant="card" count={2} />
        </div>
      ) : (
        <>
          {/* Quick Action Grid */}
          <QuickActionGrid />

          {/* Problems Near You Section */}
          <NearbyIssuesSection
            issues={nearbyIssues}
            userArea={profile?.area || stats.user_area || null}
            loading={loading}
          />

          {/* Recent Municipal Updates */}
          <RecentUpdatesSection updates={recentUpdates} />
        </>
      )}
    </div>
  );
};
