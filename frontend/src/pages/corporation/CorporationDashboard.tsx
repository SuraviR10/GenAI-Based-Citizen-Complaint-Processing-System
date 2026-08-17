import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  CheckCircle2, 
  HardHat, 
  Filter, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { CivicIssue, CorporationDashboardData } from '../../lib/types';
import { api } from '../../lib/api';
import { CorporationLayout } from '../../components/layout/CorporationLayout';
import { DepartmentWorkloadCard } from '../../components/corporation/DepartmentWorkloadCard';
import { IssueTable } from '../../components/corporation/IssueTable';
import { WorkerSelectorModal } from '../../components/corporation/WorkerSelectorModal';
import { ResponseComposerModal } from '../../components/corporation/ResponseComposerModal';
import { StatusTransitionModal } from '../../components/corporation/StatusTransitionModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const CorporationDashboard: React.FC = () => {
  const { success, info } = useToast();

  const [stats, setStats] = useState<CorporationDashboardData | null>(null);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [activeModalIssue, setActiveModalIssue] = useState<CivicIssue | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashStats, issueList] = await Promise.all([
        api.getCorporationDashboard(),
        api.listCorporationIssues({
          department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
          priority: selectedPriority !== 'all' ? selectedPriority : undefined,
          search: searchQuery || undefined,
          sort: 'priority'
        })
      ]);
      setStats(dashStats);
      setIssues(issueList);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDepartment, selectedPriority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <CorporationLayout>
      {/* Top Banner / Triage Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
            Municipal Operations Dashboard
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Real-time civic issue intake, deterministic triage, department dispatch, and public response management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={loadData}
            isLoading={isLoading}
          >
            Refresh Feed
          </Button>

          <Link to="/corporation/issues">
            <Button variant="primary" size="sm" rightIcon={<ArrowUpRight size={14} />}>
              All Issues Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Triage Metrics Bar */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '1.75rem'
          }}
        >
          {/* Active Issues */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Active Civic Issues
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
              {stats.total_active_issues}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#00adb5', fontWeight: 600, marginTop: '4px' }}>
              Unresolved in city system
            </div>
          </div>

          {/* Critical Priority */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={14} /> Critical Priority
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626' }}>
              {stats.critical_issues}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
              Immediate hazard / accidents
            </div>
          </div>

          {/* High Priority */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> High Urgency
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c' }}>
              {stats.high_priority_issues}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 600, marginTop: '4px' }}>
              Broad community support
            </div>
          </div>

          {/* In Progress / Active Crews */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #bae6fd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardHat size={14} /> In Progress
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7' }}>
              {stats.in_progress_issues}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, marginTop: '4px' }}>
              Crews actively on site
            </div>
          </div>

          {/* Resolved */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Resolved
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>
              {stats.resolved_issues}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
              Repairs completed
            </div>
          </div>
        </div>
      )}

      {/* Department Breakdown Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Department Workloads &amp; Capacity
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Click any department to filter issues queue below
            </span>
          </div>

          {selectedDepartment !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedDepartment('all')}
              style={{
                fontSize: '0.78rem',
                color: '#00adb5',
                background: 'transparent',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset to All Departments
            </button>
          )}
        </div>

        {stats?.department_workloads && (
          <DepartmentWorkloadCard
            workloads={stats.department_workloads}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={(dept) => {
              setSelectedDepartment(selectedDepartment === dept ? 'all' : dept);
            }}
          />
        )}
      </div>

      {/* Priority Issues Queue Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Priority Triage Queue ({issues.length})
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Ranked deterministically by score (0-100) factoring accidents, injuries, and community support
            </span>
          </div>

          {/* Quick Filters & Search */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, landmark..."
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  width: '180px'
                }}
              />
            </form>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>
        </div>

        {/* Issue Table */}
        <IssueTable
          issues={issues}
          onAssignClick={(issue) => {
            setActiveModalIssue(issue);
            setIsAssignModalOpen(true);
          }}
          onResponseClick={(issue) => {
            setActiveModalIssue(issue);
            setIsResponseModalOpen(true);
          }}
          onStatusClick={(issue) => {
            setActiveModalIssue(issue);
            setIsStatusModalOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <WorkerSelectorModal
        isOpen={isAssignModalOpen}
        issue={activeModalIssue}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={(res) => {
          success('Worker Assigned', res.message || 'Field task assigned successfully.');
          loadData();
        }}
      />

      <ResponseComposerModal
        isOpen={isResponseModalOpen}
        issue={activeModalIssue}
        onClose={() => setIsResponseModalOpen(false)}
        onResponsePosted={(res) => {
          success('Response Published', 'Official municipal statement posted with AI citizen summary.');
          loadData();
        }}
      />

      <StatusTransitionModal
        isOpen={isStatusModalOpen}
        issue={activeModalIssue}
        onClose={() => setIsStatusModalOpen(false)}
        onStatusUpdated={(res) => {
          success('Status Updated', res.message || 'Issue status updated.');
          loadData();
        }}
      />
    </CorporationLayout>
  );
};
