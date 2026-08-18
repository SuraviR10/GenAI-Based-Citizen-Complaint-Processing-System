import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  UserCheck, 
  Users, 
  Eye, 
  MessageSquare, 
  HardHat,
  Phone,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { CivicIssue } from '../../lib/types';
import { PriorityBadge, StatusBadge } from '../common/Badge';

export interface IssueTableProps {
  issues: CivicIssue[];
  onAssignClick?: (issue: CivicIssue) => void;
  onStatusClick?: (issue: CivicIssue) => void;
  onResponseClick?: (issue: CivicIssue) => void;
}

export const IssueTable: React.FC<IssueTableProps> = ({
  issues,
  onAssignClick,
  onStatusClick,
  onResponseClick
}) => {
  if (issues.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>No civic issues found matching the selected filters.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 14px', width: '90px' }}>Priority</th>
              <th style={{ padding: '12px 14px', minWidth: '220px' }}>Civic Problem &amp; Ward</th>
              <th style={{ padding: '12px 14px', width: '130px' }}>Department</th>
              <th style={{ padding: '12px 14px', minWidth: '150px' }}>Assigned Field Crew</th>
              <th style={{ padding: '12px 14px', width: '110px' }}>Status</th>
              <th style={{ padding: '12px 14px', width: '180px' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => {
              const hasAccidents = (issue as any).accident_reports_count > 0 || issue.priority_level === 'critical';
              const assignedWorker = issue.assigned_worker;
              const isAssigned = Boolean(assignedWorker && assignedWorker.worker_name);

              return (
                <tr 
                  key={issue.id} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Priority & Score */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <PriorityBadge level={issue.priority_level} size="sm" showScore score={issue.priority_score} />
                      {hasAccidents && (
                        <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <AlertTriangle size={11} /> Hazard Risk
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Title, Description & Location */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <div>
                      <Link 
                        to={`/corporation/issues/${issue.id}`}
                        style={{ 
                          fontWeight: 700, 
                          color: '#0f172a', 
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          display: 'inline-block',
                          marginBottom: '4px',
                          lineHeight: 1.35
                        }}
                      >
                        {issue.title}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} color="#00adb5" /> {issue.area} {issue.landmark ? `• ${issue.landmark}` : ''}
                        </span>
                        <span>&bull;</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Users size={12} /> {issue.complaints_count} reports ({issue.support_count} supporters)
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category / Department */}
                  <td style={{ padding: '14px', verticalAlign: 'top', color: '#334155', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', display: 'inline-block' }}>
                      {issue.category}
                    </span>
                  </td>

                  {/* Assigned Field Crew */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    {isAssigned ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HardHat size={14} color="#00adb5" />
                          <span>{assignedWorker?.worker_name}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {assignedWorker?.department}
                        </div>
                        {assignedWorker?.phone && (
                          <div style={{ fontSize: '0.7rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <Phone size={10} /> {assignedWorker.phone}
                          </div>
                        )}
                        {assignedWorker?.target_deadline && (
                          <div style={{ fontSize: '0.68rem', color: '#ea580c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '1px' }}>
                            <Clock size={10} /> SLA: {assignedWorker.target_deadline}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: issue.priority_level === 'critical' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(234, 179, 8, 0.15)',
                            color: issue.priority_level === 'critical' ? '#dc2626' : '#b45309',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <AlertTriangle size={11} /> Unassigned
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
                          Needs crew dispatch
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <StatusBadge status={issue.status} size="sm" />
                  </td>

                  {/* Quick Actions */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Assign / Reassign Button */}
                      {onAssignClick && issue.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onAssignClick(issue)}
                          title={isAssigned ? 'Reassign Field Worker' : 'Assign Field Crew'}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: isAssigned ? '1px solid #cbd5e1' : '1px solid #00adb5',
                            backgroundColor: isAssigned ? '#ffffff' : '#00adb5',
                            color: isAssigned ? '#0f172a' : '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <UserCheck size={13} color={isAssigned ? '#00adb5' : '#ffffff'} />
                          {isAssigned ? 'Reassign' : 'Assign Crew'}
                        </button>
                      )}

                      {/* Status Transition Button */}
                      {onStatusClick && (
                        <button
                          type="button"
                          onClick={() => onStatusClick(issue)}
                          title="Update Lifecycle Status"
                          style={{
                            padding: '4px 7px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <RefreshCw size={12} /> Status
                        </button>
                      )}

                      {/* Official Statement / Response Button */}
                      {onResponseClick && (
                        <button
                          type="button"
                          onClick={() => onResponseClick(issue)}
                          title="Post Official Corporation Response"
                          style={{
                            padding: '4px 7px',
                            borderRadius: '6px',
                            border: '1px solid #fed7aa',
                            backgroundColor: '#fffaf5',
                            color: '#c2410c',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <MessageSquare size={12} /> Respond
                        </button>
                      )}

                      {/* View Dossier Button */}
                      <Link
                        to={`/corporation/issues/${issue.id}`}
                        style={{
                          padding: '4px 7px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Eye size={12} /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
