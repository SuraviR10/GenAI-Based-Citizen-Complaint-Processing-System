import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HardHat, 
  CheckSquare, 
  Ban 
} from 'lucide-react';
import { CivicIssue, IssueStatus } from '../../lib/types';
import { api } from '../../lib/api';
import { Button } from '../common/Button';

export interface StatusTransitionModalProps {
  isOpen: boolean;
  issue: CivicIssue | null;
  onClose: () => void;
  onStatusUpdated: (updatedResult: any) => void;
}

export const StatusTransitionModal: React.FC<StatusTransitionModalProps> = ({
  isOpen,
  issue,
  onClose,
  onStatusUpdated
}) => {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue?.status || 'reviewed');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const statusOptions: Array<{ value: IssueStatus; label: string; desc: string; icon: React.ReactNode; color: string }> = [
    { value: 'reviewed', label: 'Reviewed & Classified', desc: 'Classification confirmed by engineering desk.', icon: <Clock size={16} />, color: '#0369a1' },
    { value: 'assigned', label: 'Assigned to Worker', desc: 'Work order dispatched to field team.', icon: <HardHat size={16} />, color: '#ca8a04' },
    { value: 'inspection', label: 'Under Inspection', desc: 'Field crew assessing on-site damage.', icon: <RefreshCw size={16} />, color: '#854d0e' },
    { value: 'in_progress', label: 'Repair In Progress', desc: 'Active road surfacing/drain jetting.', icon: <RefreshCw size={16} />, color: '#ea580c' },
    { value: 'completed', label: 'Completed & Resolved', desc: 'Field repair successfully certified.', icon: <CheckCircle2 size={16} />, color: '#16a34a' },
    { value: 'rejected', label: 'Rejected / Duplicate', desc: 'Out of municipal jurisdiction or duplicate.', icon: <Ban size={16} />, color: '#dc2626' }
  ];

  const handleUpdate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.updateIssueStatus(issue.id, {
        status: selectedStatus,
        actor_role: 'corporation',
        notes: notes || `Issue status changed from ${issue.status} to ${selectedStatus}.`
      });

      onStatusUpdated(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0b192c',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 173, 181, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00adb5'
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Update Issue Status
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Current Status: <strong style={{ textTransform: 'capitalize' }}>{issue.status.replace('_', ' ')}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
            {statusOptions.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #00adb5' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? 'rgba(0, 173, 181, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: opt.color }}>{opt.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={16} color="#00adb5" />}
                </div>
              );
            })}
          </div>

          {/* Transition Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Official Audit Notes / Reason:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Engineering inspection complete. Site classified as emergency repair priority due to school proximity..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#f8fafc'
          }}
        >
          <Button variant="outline" size="md" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={handleUpdate}
          >
            Apply Status Transition
          </Button>
        </div>
      </div>
    </div>
  );
};
