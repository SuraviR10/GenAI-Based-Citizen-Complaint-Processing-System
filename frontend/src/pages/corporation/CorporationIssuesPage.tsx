import React, { useState, useEffect, useMemo } from 'react';
import { 
  ListOrdered, 
  Search, 
  Filter, 
  RefreshCw, 
  UserCheck, 
  MessageSquare, 
  MapPin, 
  Flame, 
  ShieldAlert,
  HardHat
} from 'lucide-react';
import { CivicIssue, MYSORE_AREAS } from '../../lib/types';
import { api } from '../../lib/api';
import { CorporationLayout } from '../../components/layout/CorporationLayout';
import { IssueTable } from '../../components/corporation/IssueTable';
import { WorkerSelectorModal } from '../../components/corporation/WorkerSelectorModal';
import { ResponseComposerModal } from '../../components/corporation/ResponseComposerModal';
import { StatusTransitionModal } from '../../components/corporation/StatusTransitionModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const CorporationIssuesPage: React.FC = () => {
  const { success } = useToast();

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [area, setArea] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [crewFilter, setCrewFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('priority');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [activeModalIssue, setActiveModalIssue] = useState<CivicIssue | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await api.listCorporationIssues({
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        area: area !== 'all' ? area : undefined,
        priority: priority !== 'all' ? priority : undefined,
        status: status !== 'all' ? status : undefined,
        sort: sort
      });
      setIssues(data);
    } catch (err: any) {
      console.error('Error listing corporation issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [category, area, priority, status, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setArea('all');
    setPriority('all');
    setStatus('all');
    setCrewFilter('all');
    setSort('priority');
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (crewFilter === 'unassigned') {
        return !issue.assigned_worker || !issue.assigned_worker.worker_id;
      }
      if (crewFilter === 'assigned') {
        return Boolean(issue.assigned_worker && issue.assigned_worker.worker_id);
      }
      return true;
    });
  }, [issues, crewFilter]);

  return (
    <CorporationLayout>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
            Priority Issues Directory &amp; Dispatch
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Browse, filter, and triage municipal complaints ranked by deterministic priority score.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={fetchIssues}
          isLoading={isLoading}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Multi-Factor Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Search Term:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keywords, landmark, area..."
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem'
                  }}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Department Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">All Departments</option>
                <option value="Roads & Footpaths">Roads &amp; Footpaths</option>
                <option value="Water & Sewage">Water &amp; Sewage</option>
                <option value="Street Lighting">Street Lighting</option>
                <option value="Garbage & Sanitation">Garbage &amp; Sanitation</option>
                <option value="Public Safety & Hazards">Public Safety &amp; Hazards</option>
              </select>
            </div>

            {/* Ward / Area */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Municipal Ward / Area:
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">All Mysuru Localities</option>
                {MYSORE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}, Mysuru
                  </option>
                ))}
              </select>
            </div>

            {/* Crew Dispatch Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Field Crew Dispatch:
              </label>
              <select
                value={crewFilter}
                onChange={(e) => setCrewFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">All Crew Statuses</option>
                <option value="unassigned">⚠️ Unassigned Only (Needs Dispatch)</option>
                <option value="assigned">👷 Dispatched Crew</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Priority Level:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical (Score 80+)</option>
                <option value="high">High (Score 60-79)</option>
                <option value="medium">Medium (Score 40-59)</option>
                <option value="low">Low (Score 0-39)</option>
              </select>
            </div>

            {/* Lifecycle Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Lifecycle Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">All Lifecycle States</option>
                <option value="reported">Reported</option>
                <option value="reviewed">Reviewed</option>
                <option value="assigned">Assigned</option>
                <option value="inspection">Under Inspection</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Sort Order:
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="priority">Priority Score (Highest First)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Filter size={14} />}>
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Issue Table */}
      <IssueTable
        issues={filteredIssues}
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

      {/* Modals */}
      <WorkerSelectorModal
        isOpen={isAssignModalOpen}
        issue={activeModalIssue}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={(res) => {
          success('Worker Dispatched', res.message || 'Field task assigned successfully.');
          fetchIssues();
        }}
      />

      <ResponseComposerModal
        isOpen={isResponseModalOpen}
        issue={activeModalIssue}
        onClose={() => setIsResponseModalOpen(false)}
        onResponsePosted={(res) => {
          success('Response Published', 'Official statement posted.');
          fetchIssues();
        }}
      />

      <StatusTransitionModal
        isOpen={isStatusModalOpen}
        issue={activeModalIssue}
        onClose={() => setIsStatusModalOpen(false)}
        onStatusUpdated={(res) => {
          success('Status Updated', res.message || 'Issue status updated.');
          fetchIssues();
        }}
      />
    </CorporationLayout>
  );
};
