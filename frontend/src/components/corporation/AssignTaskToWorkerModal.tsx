import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardHat, 
  Send, 
  AlertCircle, 
  MapPin, 
  Clock, 
  Wrench, 
  Sparkles,
  Flame,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { CivicIssue, WorkerProfile } from '../../lib/types';
import { api } from '../../lib/api';
import { Button } from '../common/Button';
import { PriorityBadge } from '../common/Badge';

export interface AssignTaskToWorkerModalProps {
  isOpen: boolean;
  worker: WorkerProfile | null;
  onClose: () => void;
  onAssigned: (res: any) => void;
}

const EQUIPMENT_OPTIONS = [
  'Asphalt Hot-Mix & Roller',
  'Suction Jetting Tanker',
  'Electrical Bucket Truck',
  'Hydraulic Mini-Excavator',
  'Traffic Barricades & Cones',
  'Submersible De-Watering Pump',
  'Sanitation & Hazmat Kit',
  'Manual Crew (Shovels & Rakes)'
];

export const AssignTaskToWorkerModal: React.FC<AssignTaskToWorkerModalProps> = ({
  isOpen,
  worker,
  onClose,
  onAssigned
}) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [priorityDirective, setPriorityDirective] = useState<string>('Standard Schedule (48h)');
  const [targetDeadline, setTargetDeadline] = useState<string>('Within 48 Hours');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && worker) {
      setIsLoading(true);
      setError(null);
      setSelectedIssueId('');
      setSelectedEquipment([]);

      // Fetch open issues (unassigned or active)
      api.listCorporationIssues({ sort: 'priority' })
        .then((data: CivicIssue[]) => {
          // Filter issues not completed, prioritizing same department
          const openIssues = data.filter((i) => i.status !== 'completed');
          setIssues(openIssues);
          
          // Auto-select first matching department issue if available
          const deptMatch = openIssues.find((i) => 
            i.category.toLowerCase().includes(worker.department.toLowerCase().slice(0, 4))
          );
          if (deptMatch) {
            setSelectedIssueId(deptMatch.id);
            setInstructions(`Assigned to ${worker.full_name} (${worker.department}) to inspect and resolve ${deptMatch.title} at ${deptMatch.area}.`);
          } else if (openIssues.length > 0) {
            setSelectedIssueId(openIssues[0].id);
            setInstructions(`Assigned to ${worker.full_name} (${worker.department}) to inspect and resolve ${openIssues[0].title}.`);
          }
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to load open civic issues.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, worker]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  const handleToggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) => 
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleIssueSelect = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    setInstructions(`Dispatch to ${issue.area} to inspect and resolve ${issue.title}.`);
    if (issue.priority_level === 'critical') {
      setPriorityDirective('🚨 Emergency / Immediate Dispatch');
      setTargetDeadline('Within 24 Hours');
    } else if (issue.priority_level === 'high') {
      setPriorityDirective('⚡ High Urgency (24h-48h)');
      setTargetDeadline('Within 48 Hours');
    }
  };

  const handleAssign = async () => {
    if (!selectedIssueId || !worker) {
      setError('Please select an issue to assign.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.assignWorker(selectedIssueId, {
        worker_id: worker.id,
        instructions: instructions || `Dispatch to ${selectedIssue?.area} to inspect and resolve ${selectedIssue?.title}.`,
        priority_directive: priorityDirective,
        target_deadline: targetDeadline,
        equipment_required: selectedEquipment
      });

      onAssigned(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign issue to worker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !worker) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: '660px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 173, 181, 0.2)',
                border: '1px solid #00adb5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00adb5'
              }}
            >
              <HardHat size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Dispatch Task to {worker.full_name}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {worker.department} &bull; Zone: {worker.area || 'Mysuru Citywide'} &bull; Status: {worker.worker_status.replace('_', ' ')}
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
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Issue Selector Section */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              1. Select Open Civic Issue to Assign:
            </label>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading active issues...</div>
            ) : issues.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                No open civic issues available for assignment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                {issues.map((iss) => {
                  const isSelected = selectedIssueId === iss.id;
                  const isDeptMatch = iss.category.toLowerCase().includes(worker.department.toLowerCase().slice(0, 4));

                  return (
                    <div
                      key={iss.id}
                      onClick={() => handleIssueSelect(iss)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #00adb5' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? 'rgba(0, 173, 181, 0.06)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <PriorityBadge level={iss.priority_level} size="sm" showScore score={iss.priority_score} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                            {iss.title}
                          </span>
                          {isDeptMatch && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00adb5' }}>
                              Department Match
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '10px' }}>
                          <span>📍 {iss.area} {iss.landmark ? `(${iss.landmark})` : ''}</span>
                          <span>•</span>
                          <span>🏢 {iss.category}</span>
                          <span>•</span>
                          <span>👥 {iss.support_count} supporters</span>
                        </div>
                      </div>

                      {iss.assigned_worker && (
                        <span style={{ fontSize: '0.7rem', color: '#ea580c', backgroundColor: '#fff7ed', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                          Replaces: {iss.assigned_worker.worker_name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operational Parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                2. Operational Directive:
              </label>
              <select
                value={priorityDirective}
                onChange={(e) => setPriorityDirective(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="🚨 Emergency / Immediate Dispatch">🚨 Emergency / Immediate Dispatch</option>
                <option value="⚡ High Urgency (24h-48h)">⚡ High Urgency (Within 24-48 Hours)</option>
                <option value="📋 Standard Schedule (48h)">📋 Standard Schedule (Within 48 Hours)</option>
                <option value="🛠️ Routine Maintenance">🛠️ Routine Maintenance</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                3. Target Resolution SLA:
              </label>
              <select
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Within 24 Hours">Within 24 Hours (Emergency)</option>
                <option value="Within 48 Hours">Within 48 Hours (Standard SLA)</option>
                <option value="Within 3 to 5 Days">Within 3 to 5 Days</option>
                <option value="Within 1 Week">Within 1 Week</option>
              </select>
            </div>
          </div>

          {/* Equipment Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              4. Heavy Equipment / Special Machinery:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EQUIPMENT_OPTIONS.map((eq) => {
                const isChecked = selectedEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => handleToggleEquipment(eq)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      border: isChecked ? '1px solid #00adb5' : '1px solid #cbd5e1',
                      backgroundColor: isChecked ? 'rgba(0, 173, 181, 0.12)' : '#f8fafc',
                      color: isChecked ? '#00adb5' : '#475569',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Wrench size={12} />
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directives Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              5. Work Instructions for {worker.full_name}:
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Carry out initial site inspection, report crater dimensions, coordinate asphalt hot-mix repair crew..."
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
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {selectedIssueId ? 'Issue selected for assignment.' : 'Please select an issue.'}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" size="md" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Send size={16} />}
              isLoading={isSubmitting}
              onClick={handleAssign}
              isDisabled={!selectedIssueId}
            >
              Dispatch Task Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
