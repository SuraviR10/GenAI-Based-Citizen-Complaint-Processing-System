import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  UserCheck, 
  Users, 
  Eye, 
  ShieldCheck, 
  MessageSquare, 
  ArrowUpRight 
} from 'lucide-react';
import { CivicIssue } from '../../lib/types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';

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
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No issues found matching the selected filters.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px', width: '90px' }}>Priority</th>
              <th style={{ padding: '12px 16px', minWidth: '240px' }}>Civic Problem &amp; Location</th>
              <th style={{ padding: '12px 16px', width: '130px' }}>Department</th>
              <th style={{ padding: '12px 16px', width: '110px' }}>Corroboration</th>
              <th style={{ padding: '12px 16px', width: '120px' }}>Status</th>
              <th style={{ padding: '12px 16px', width: '150px' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => {
              const hasAccidents = (issue as any).accident_reports_count > 0 || issue.priority_level === 'critical';
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
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <PriorityBadge level={issue.priority_level} size="sm" showScore score={issue.priority_score} />
                      {hasAccidents && (
                        <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <AlertTriangle size={11} /> Safety Risk
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Title, Description & Location */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <div>
                      <Link 
                        to={`/corporation/issues/${issue.id}`}
                        style={{ 
                          fontWeight: 700, 
                          color: '#0f172a', 
                          textDecoration: 'none',
                          fontSize: '0.92rem',
                          display: 'inline-block',
                          marginBottom: '4px'
                        }}
                      >
                        {issue.title}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#64748b' }}>
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
                  <td style={{ padding: '14px 16px', verticalAlign: 'top', color: '#334155', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {issue.category}
                    </span>
                  </td>

                  {/* Corroboration Level */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 
                          issue.support_count >= 50 ? 'rgba(22, 163, 74, 0.12)' :
                          issue.support_count >= 10 ? 'rgba(2, 132, 199, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                        color: 
                          issue.support_count >= 50 ? '#15803d' :
                          issue.support_count >= 10 ? '#0369a1' : '#475569'
                      }}
                    >
                      {issue.support_count >= 50 ? '🛡️ Strong' : issue.support_count >= 10 ? 'Moderate' : 'Initial'}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <StatusBadge status={issue.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {onAssignClick && issue.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onAssignClick(issue)}
                          title="Assign Field Worker"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserCheck size={13} color="#00adb5" /> Assign
                        </button>
                      )}

                      {onResponseClick && (
                        <button
                          type="button"
                          onClick={() => onResponseClick(issue)}
                          title="Post Official Statement"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MessageSquare size={13} color="#e2703a" /> Respond
                        </button>
                      )}

                      <Link
                        to={`/corporation/issues/${issue.id}`}
                        style={{
                          padding: '4px 8px',
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
                        <Eye size={13} /> View
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
