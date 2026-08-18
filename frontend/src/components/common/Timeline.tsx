import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Wrench, 
  CheckCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { IssueStatus, IssueUpdateItem } from '../../lib/types';
import { Badge } from './Badge';

export interface TimelineProps {
  updates: IssueUpdateItem[];
  currentStatus?: IssueStatus;
}

export const Timeline: React.FC<TimelineProps> = ({ updates, currentStatus }) => {
  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case 'reported':
        return <FileText size={16} color="var(--color-primary-800)" />;
      case 'reviewed':
        return <Clock size={16} color="#3b82f6" />;
      case 'assigned':
        return <UserCheck size={16} color="#f59e0b" />;
      case 'inspection':
      case 'in_progress':
        return <Wrench size={16} color="#c2410c" />;
      case 'completed':
      case 'resolved' as any:
        return <CheckCheck size={16} color="#10b981" />;
      case 'rejected':
        return <AlertCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="var(--color-text-muted)" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (!updates || updates.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        No progress updates recorded yet. The municipal corporation will update this timeline as actions are taken.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '2rem', marginTop: '1rem', marginBottom: '1rem' }}>
      {/* Vertical Spine */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          backgroundColor: 'var(--color-border)',
          zIndex: 1
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {updates.map((item, index) => {
          const isLatest = index === updates.length - 1;

          return (
            <div key={item.id || index} style={{ position: 'relative', zIndex: 2 }}>
              {/* Timeline Bullet Node with 3D shadow */}
              <div
                style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-card)',
                  border: isLatest ? '2px solid var(--color-accent-500)' : '2px solid var(--color-border)',
                  boxShadow: isLatest ? '0 0 10px rgba(0, 173, 181, 0.4)' : 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getStatusIcon(item.status)}
              </div>

              {/* Event Content Card */}
              <div
                style={{
                  backgroundColor: isLatest ? 'var(--color-bg-subtle)' : 'transparent',
                  padding: isLatest ? '12px 16px' : '4px 0',
                  borderRadius: 'var(--radius-md)',
                  border: isLatest ? '1px solid var(--color-border)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <Badge type="status" value={item.status} size="sm" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.5, marginTop: '4px' }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
