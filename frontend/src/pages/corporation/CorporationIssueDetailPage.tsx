import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  ShieldAlert, 
  AlertTriangle, 
  HardHat, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2,
  FileText,
  Lock,
  Eye,
  Phone
} from 'lucide-react';
import { CivicIssueDetail } from '../../lib/types';
import { api } from '../../lib/api';
import { CorporationLayout } from '../../components/layout/CorporationLayout';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WorkerSelectorModal } from '../../components/corporation/WorkerSelectorModal';
import { ResponseComposerModal } from '../../components/corporation/ResponseComposerModal';
import { StatusTransitionModal } from '../../components/corporation/StatusTransitionModal';
import { CitizenReportsModal } from '../../components/corporation/CitizenReportsModal';
import { useToast } from '../../context/ToastContext';

export const CorporationIssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [issue, setIssue] = useState<CivicIssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState<boolean>(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getCorporationIssueDetail(id);
      setIssue(data);
    } catch (err: any) {
      error('Failed to load issue', err.message || 'Issue not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <CorporationLayout>
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          Loading municipal issue dossier #{id?.slice(0, 8)}...
        </div>
      </CorporationLayout>
    );
  }

  if (!issue) {
    return (
      <CorporationLayout>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2>Issue Not Found</h2>
          <Link to="/corporation/issues">
            <Button variant="primary" size="md">Back to Issues</Button>
          </Link>
        </div>
      </CorporationLayout>
    );
  }

  const assignmentInfo = issue.complaints_summary?.assignment;

  return (
    <CorporationLayout>
      {/* Top Back Nav & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <Link
          to="/corporation/issues"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Back to Triage Queue
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => setIsStatusModalOpen(true)}
          >
            Update Status
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<MessageSquare size={14} />}
            onClick={() => setIsResponseModalOpen(true)}
          >
            Post Official Statement
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserCheck size={14} />}
            onClick={() => setIsAssignModalOpen(true)}
          >
            {assignmentInfo ? 'Reassign Worker' : 'Assign Field Crew'}
          </Button>
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <PriorityBadge level={issue.priority_level} size="md" showScore score={issue.priority_score} />
            <StatusBadge status={issue.status} size="md" />
            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
              {issue.category}
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
            Logged: {new Date(issue.created_at).toLocaleString()}
          </span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.3 }}>
          {issue.title}
        </h1>

        <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.55, margin: '0 0 16px 0' }}>
          {issue.description}
        </p>

        {/* Location & Quick Triage Strip */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '14px', fontSize: '0.85rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
            <MapPin size={16} color="#00adb5" /> {issue.area} {issue.landmark ? `• ${issue.landmark}` : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="#0284c7" /> {issue.complaints_count} reports merged ({issue.support_count} supporters)
          </span>
          <button
            type="button"
            onClick={() => setIsReportsModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00adb5',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Inspect All {issue.complaints_count} Citizen Submissions →
          </button>
        </div>
      </div>

      {/* Work Completion Resolution Banner */}
      {issue.status === 'completed' && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(22, 163, 74, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#166534' }}>
                Municipal Work Completed &amp; Issue Resolved
              </div>
              <div style={{ fontSize: '0.82rem', color: '#15803d' }}>
                The assigned field crew has completed on-site repairs. Citizens and municipal officers can view the completed audit timeline.
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
            Verified Resolution
          </span>
        </div>
      )}

      {/* Grid: Triage Intelligence & Dispatch Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Card: Priority & Safety Breakdown */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} color="#e2703a" /> Deterministic Priority Factors
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#475569' }}>Total Priority Score:</span>
              <strong style={{ color: '#0f172a' }}>{issue.priority_score} / 100 ({issue.priority_level.toUpperCase()})</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#475569' }}>Accident Reports:</span>
              <strong style={{ color: (issue.accident_reports_count || 0) > 0 ? '#dc2626' : '#0f172a' }}>
                {issue.accident_reports_count || 0} citizen accidents logged
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#475569' }}>Community Support:</span>
              <strong style={{ color: '#00adb5' }}>{issue.support_count} verified citizen votes</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#475569' }}>Corroboration Confidence:</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>
                🛡️ {issue.corroboration_level ? issue.corroboration_level.toUpperCase() : 'STRONG'} (Consolidated Multi-Report)
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Assigned Worker Status */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardHat size={18} color="#00adb5" /> Field Crew Assignment
            </h3>

            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(true)}>
              {assignmentInfo ? 'Change' : 'Assign'}
            </Button>
          </div>

          {assignmentInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    👷 {assignmentInfo.worker_name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    🏢 {assignmentInfo.department}
                  </div>
                </div>

                {assignmentInfo.phone && (
                  <a
                    href={`tel:${assignmentInfo.phone}`}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Phone size={12} /> Call Crew
                  </a>
                )}
              </div>

              {/* Directives & SLA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                {(assignmentInfo as any).priority_directive && (
                  <div>
                    <strong style={{ color: '#0f172a' }}>Directive: </strong>
                    <span style={{ color: '#00adb5', fontWeight: 700 }}>{(assignmentInfo as any).priority_directive}</span>
                  </div>
                )}
                {(assignmentInfo as any).target_deadline && (
                  <div>
                    <strong style={{ color: '#0f172a' }}>Target SLA: </strong>
                    <span style={{ color: '#ea580c', fontWeight: 700 }}>{(assignmentInfo as any).target_deadline}</span>
                  </div>
                )}
                {assignmentInfo.instructions && (
                  <div style={{ color: '#334155', marginTop: '2px' }}>
                    <strong style={{ color: '#0f172a' }}>Instructions: </strong>
                    {assignmentInfo.instructions}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Dispatched: {new Date(assignmentInfo.assigned_at).toLocaleString()}</span>
                <span style={{ color: issue.status === 'completed' ? '#16a34a' : '#0284c7', fontWeight: 700 }}>
                  Status: {issue.status === 'completed' ? 'Completed & Resolved' : 'Dispatched / In Progress'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' }}>
                No worker currently dispatched to this issue.
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
                Dispatch Worker Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Official Responses History */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={18} color="#e2703a" /> Corporation Response History ({issue.responses.length})
          </h3>

          <Button variant="primary" size="sm" onClick={() => setIsResponseModalOpen(true)}>
            + Post Statement
          </Button>
        </div>

        {issue.responses.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No official responses posted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {issue.responses.map((r) => {
              const isPublic = r.visibility === 'public';
              return (
                <div
                  key={r.id}
                  style={{
                    border: isPublic ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                    backgroundColor: isPublic ? '#ffffff' : '#fffaf5',
                    borderRadius: '10px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: isPublic ? 'rgba(0, 173, 181, 0.1)' : 'rgba(226, 112, 58, 0.15)',
                        color: isPublic ? '#00adb5' : '#c2410c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isPublic ? <Eye size={12} /> : <Lock size={12} />} {isPublic ? 'PUBLIC NOTICE' : 'INTERNAL NOTE'}
                    </span>

                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong>Official Notice: </strong>{r.official_response}
                  </div>

                  {r.simplified_response && (
                    <div style={{ fontSize: '0.85rem', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px' }}>
                      <strong>✨ Citizen Plain-Language Summary: </strong>{r.simplified_response}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Audit Timeline */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={18} color="#00adb5" /> Official Audit &amp; Field Timeline
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #e2e8f0' }}>
          {issue.updates.map((u) => (
            <div key={u.id} style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-23px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#00adb5',
                  border: '2px solid #ffffff'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  {u.status.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {new Date(u.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                {u.description}
              </p>
              {u.evidence_url && (
                <div style={{ marginTop: '6px' }}>
                  <img src={u.evidence_url} alt="Timeline evidence" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <WorkerSelectorModal
        isOpen={isAssignModalOpen}
        issue={issue}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={(res) => {
          success('Worker Assigned', res.message || 'Worker assigned.');
          fetchDetail();
        }}
      />

      <ResponseComposerModal
        isOpen={isResponseModalOpen}
        issue={issue}
        onClose={() => setIsResponseModalOpen(false)}
        onResponsePosted={(res) => {
          success('Response Published', 'Official municipal response posted.');
          fetchDetail();
        }}
      />

      <StatusTransitionModal
        isOpen={isStatusModalOpen}
        issue={issue}
        onClose={() => setIsStatusModalOpen(false)}
        onStatusUpdated={(res) => {
          success('Status Updated', res.message || 'Status updated.');
          fetchDetail();
        }}
      />

      <CitizenReportsModal
        isOpen={isReportsModalOpen}
        issueDetail={issue}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </CorporationLayout>
  );
};
