import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Users, 
  MapPin, 
  ShieldCheck, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { CorporationAnalyticsData } from '../../lib/types';
import { api } from '../../lib/api';
import { CorporationLayout } from '../../components/layout/CorporationLayout';
import { Button } from '../../components/common/Button';

export const CorporationAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CorporationAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCorporationAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <CorporationLayout>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
            Civic Operations &amp; SLA Analytics
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Municipal performance tracking, priority distribution, resolution efficiency, and crew utilization.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={fetchAnalytics}
          isLoading={isLoading}
        >
          Refresh Analytics
        </Button>
      </div>

      {analytics && (
        <>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '1.75rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Total Issues Logged
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
                {analytics.total_reported}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#00adb5', fontWeight: 600, marginTop: '4px' }}>
                Across all wards
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Total Resolved
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>
                {analytics.total_resolved}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                Verified completed
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Avg Resolution Time
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c' }}>
                {analytics.avg_resolution_hours}h
              </div>
              <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 600, marginTop: '4px' }}>
                Target: &lt; 48.0h SLA
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #bae6fd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} /> Crew Utilization
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7' }}>
                {analytics.worker_utilization_pct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, marginTop: '4px' }}>
                Field crew deployment
              </div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Priority Distribution */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={18} color="#dc2626" /> Priority Triage Distribution
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(analytics.by_priority).map(([p, count]) => {
                  const color = 
                    p === 'critical' ? '#dc2626' :
                    p === 'high' ? '#ea580c' :
                    p === 'medium' ? '#ca8a04' : '#16a34a';
                  return (
                    <div key={p}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#334155', textTransform: 'capitalize' }}>{p}</span>
                        <strong style={{ color: color }}>{count} issues</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            backgroundColor: color,
                            width: `${(count / Math.max(analytics.total_reported, 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Category Breakdown */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={18} color="#00adb5" /> Issues by Municipal Category
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(analytics.by_category).map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                    <span style={{ color: '#334155', fontWeight: 600 }}>{cat}</span>
                    <strong style={{ backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '4px', color: '#0f172a' }}>
                      {count}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Ward / Area Distribution */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={18} color="#0284c7" /> Geographical Distribution (Wards)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(analytics.by_area).map(([ar, count]) => (
                  <div key={ar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                    <span style={{ color: '#334155', fontWeight: 600 }}>{ar}</span>
                    <strong style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>
                      {count} reports
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </CorporationLayout>
  );
};
