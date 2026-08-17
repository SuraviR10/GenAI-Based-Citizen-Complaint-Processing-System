import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  HardHat, 
  MapPin, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Send 
} from 'lucide-react';
import { CivicIssue, WorkerProfile } from '../../lib/types';
import { api } from '../../lib/api';
import { Button } from '../common/Button';

export interface WorkerSelectorModalProps {
  isOpen: boolean;
  issue: CivicIssue | null;
  onClose: () => void;
  onAssigned: (assignmentResult: any) => void;
}

export const WorkerSelectorModal: React.FC<WorkerSelectorModalProps> = ({
  isOpen,
  issue,
  onClose,
  onAssigned
}) => {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setSelectedWorkerId('');
      setInstructions('');

      api.listWorkers()
        .then((data) => {
          setWorkers(data);
          // Suggest appropriate worker based on category
          if (issue?.category) {
            const cat = issue.category.toLowerCase();
            let matched = data.find(w => {
              const dept = w.department.toLowerCase();
              if (cat.includes('road') && dept.includes('road')) return true;
              if (cat.includes('water') && dept.includes('water')) return true;
              if (cat.includes('light') && dept.includes('light')) return true;
              if (cat.includes('garb') && dept.includes('garb')) return true;
              if (cat.includes('safety') && dept.includes('safety')) return true;
              return false;
            });
            if (matched) {
              setSelectedWorkerId(matched.id);
            } else if (data.length > 0) {
              setSelectedWorkerId(data[0].id);
            }
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load workers');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, issue]);

  if (!isOpen || !issue) return null;

  const handleAssign = async () => {
    if (!selectedWorkerId) {
      setError('Please select a field worker.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.assignWorker(issue.id, {
        worker_id: selectedWorkerId,
        instructions: instructions || `Dispatch to ${issue.area} to inspect and resolve ${issue.title}.`
      });

      onAssigned(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Assignment failed. Please try again.');
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
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
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Assign Field Worker
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Issue #{issue.id.slice(0, 8)} &bull; {issue.category}
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

        {/* Modal Body */}
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

          {/* Issue Summary Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {issue.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '12px' }}>
              <span>📍 {issue.area}</span>
              <span>⚡ Priority: <strong style={{ textTransform: 'capitalize' }}>{issue.priority_level}</strong></span>
              <span>👥 {issue.support_count} supporters</span>
            </div>
          </div>

          {/* Select Worker List */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Select Department Worker:
            </label>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>Loading field crew directory...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {workers.map((w) => {
                  const isSelected = selectedWorkerId === w.id;
                  const isAvailable = w.worker_status === 'available';

                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorkerId(w.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #00adb5' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? 'rgba(0, 173, 181, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#00adb5' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <HardHat size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                            {w.full_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                            <span>🏢 {w.department}</span>
                            <span>•</span>
                            <span>📍 {w.area || 'Citywide'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: isAvailable ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 179, 8, 0.15)',
                            color: isAvailable ? '#16a34a' : '#ca8a04',
                            textTransform: 'capitalize'
                          }}
                        >
                          {w.worker_status.replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                          {w.active_tasks_count} active task(s)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Work Instructions */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Work Instructions &amp; Priority Directives:
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Inspect crater depth, deploy asphalt hot-mix patch crew, barricade damaged section during repair..."
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

        {/* Modal Footer */}
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
            leftIcon={<Send size={16} />}
            isLoading={isSubmitting}
            onClick={handleAssign}
            isDisabled={!selectedWorkerId}
          >
            Assign Task
          </Button>
        </div>
      </div>
    </div>
  );
};
