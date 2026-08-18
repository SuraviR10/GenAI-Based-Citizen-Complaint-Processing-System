import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  UserCheck, 
  HardHat, 
  MapPin, 
  Phone, 
  AlertCircle, 
  Send,
  Search,
  Clock,
  Wrench,
  Flame,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Tag
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

const EQUIPMENT_OPTIONS = [
  'Asphalt Hot-Mix & Roller',
  'Suction Jetting Tanker',
  'Electrical Bucket Truck',
  'Hydraulic Mini-Excavator',
  'Traffic Barricades & Cones',
  'Submersible De-Watering Pump',
  'High-Pressure Washer',
  'Sanitation & Hazmat Kit',
  'Manual Crew (Shovels & Rakes)'
];

const DIRECTIVE_TEMPLATES: Record<string, string[]> = {
  'Roads & Footpaths': [
    'Deploy emergency cold-milling and asphalt hot-mix patch crew. Barricade crater perimeter during repair.',
    'Inspect pavement sub-base erosion, clear loose aggregates, and restore pedestrian footpath walkway.',
    'Level sunken manhole cover ring with cement mortar and apply asphalt wearing course.'
  ],
  'Water & Sewage': [
    'Dispatch high-pressure jetting tanker to clear underground pipeline blockage. Contain overflow safely.',
    'Inspect leaking municipal main pipeline, isolate supply valve, and install repair clamp sleeve.',
    'Clear silt and debris accumulation from roadside storm water drain channels.'
  ],
  'Street Lighting': [
    'Deploy bucket truck to replace burnt LED luminaire, test underground feeder cable, and restore illumination.',
    'Inspect junction box short circuit, replace blown ceramic fuse, and seal feeder pillar against rain.',
    'Repair damaged street light pole footing and re-secure exposed armored cables safely.'
  ],
  'Garbage & Sanitation': [
    'Deploy tipper truck and sanitation crew to clear roadside blackspot garbage dump and apply disinfectant powder.',
    'Empty overflowing community waste bins and sanitize surrounding pedestrian area.',
    'Clear construction debris and vegetative waste blocking sidewalk drainage.'
  ],
  'Public Safety & Hazards': [
    'Emergency response: cordon off hazardous structure/tree branch, erect warning signage, and initiate safe removal.',
    'Isolate live electrical hazard, coordinate with utility crew, and safeguard pedestrian pathway.',
    'Inspect dangerous excavation trench and install safety reflector barricades.'
  ]
};

export const WorkerSelectorModal: React.FC<WorkerSelectorModalProps> = ({
  isOpen,
  issue,
  onClose,
  onAssigned
}) => {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  
  // Operational dispatch directives
  const [priorityDirective, setPriorityDirective] = useState<string>('Standard Schedule (48h)');
  const [targetDeadline, setTargetDeadline] = useState<string>('Within 48 Hours');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && issue) {
      setIsLoading(true);
      setError(null);
      setSelectedWorkerId('');
      setSearchQuery('');
      setSelectedEquipment([]);

      // Auto-set priority directive based on issue priority
      if (issue.priority_level === 'critical') {
        setPriorityDirective('🚨 Emergency / Immediate Dispatch');
        setTargetDeadline('Within 24 Hours');
      } else if (issue.priority_level === 'high') {
        setPriorityDirective('⚡ High Urgency (24h-48h)');
        setTargetDeadline('Within 48 Hours');
      } else {
        setPriorityDirective('📋 Standard Schedule (48h)');
        setTargetDeadline('Within 3-5 Days');
      }

      // Default instructions
      setInstructions(`Dispatch to ${issue.area} to inspect and resolve ${issue.title}.`);

      api.listWorkers()
        .then((data: WorkerProfile[]) => {
          setWorkers(data);

          // If the issue already has an assigned worker, preselect them or suggest matching
          if (issue.assigned_worker?.worker_id) {
            setSelectedWorkerId(issue.assigned_worker.worker_id);
          } else if (issue.category) {
            const cat = issue.category.toLowerCase();
            const matched = data.find((w: WorkerProfile) => {
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
        .catch((err: any) => {
          setError(err.message || 'Failed to load workers roster');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, issue]);

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (departmentFilter !== 'all' && w.department !== departmentFilter) {
        return false;
      }
      if (availabilityFilter === 'available' && w.worker_status !== 'available') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = w.full_name.toLowerCase().includes(q);
        const matchesDept = w.department.toLowerCase().includes(q);
        const matchesArea = (w.area || '').toLowerCase().includes(q);
        const matchesPhone = (w.phone || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesArea && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [workers, departmentFilter, availabilityFilter, searchQuery]);

  const currentAssigned = issue?.assigned_worker;
  const isReassigning = Boolean(currentAssigned && currentAssigned.worker_id);

  if (!isOpen || !issue) return null;

  const handleToggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) => 
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleApplyTemplate = (template: string) => {
    setInstructions(template);
  };

  const handleAssign = async () => {
    if (!selectedWorkerId) {
      setError('Please select a field worker from the directory.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.assignWorker(issue.id, {
        worker_id: selectedWorkerId,
        instructions: instructions || `Dispatch to ${issue.area} to inspect and resolve ${issue.title}.`,
        priority_directive: priorityDirective,
        target_deadline: targetDeadline,
        equipment_required: selectedEquipment
      });

      onAssigned(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Assignment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const templatesForCategory = DIRECTIVE_TEMPLATES[issue.category] || DIRECTIVE_TEMPLATES['Roads & Footpaths'];

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
          maxWidth: '680px',
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
              <UserCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isReassigning ? 'Reassign Field Worker' : 'Dispatch Field Crew'}
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: issue.priority_level === 'critical' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 173, 181, 0.25)',
                    color: issue.priority_level === 'critical' ? '#fca5a5' : '#5eead4',
                    textTransform: 'uppercase'
                  }}
                >
                  {issue.priority_level} Priority
                </span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Issue #{issue.id.slice(0, 8)} &bull; {issue.category} &bull; {issue.area}
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
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
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

          {/* Reassignment / Current Assignment Notice */}
          {isReassigning && currentAssigned && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardHat size={16} color="#d97706" />
                <span>
                  Currently assigned to <strong>{currentAssigned.worker_name}</strong> ({currentAssigned.department}). Selecting a new worker will transfer this task and notify both workers.
                </span>
              </div>
            </div>
          )}

          {/* Issue Summary Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              {issue.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>📍 <strong>Area:</strong> {issue.area} {issue.landmark ? `(${issue.landmark})` : ''}</span>
              <span>⚡ <strong>Score:</strong> {issue.priority_score}/100</span>
              <span>👥 <strong>Support:</strong> {issue.support_count} citizens</span>
              <span>🛡️ <strong>Corroboration:</strong> {issue.corroboration_level?.toUpperCase() || 'STRONG'}</span>
            </div>
          </div>

          {/* Worker Selection Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
                1. Select Field Worker:
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Showing {filteredWorkers.length} available personnel
              </span>
            </div>

            {/* Department Filter Pills & Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by worker name, area, phone..."
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem'
                    }}
                  />
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                </div>

                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="all">All Roster</option>
                  <option value="available">Available Only</option>
                </select>
              </div>

              {/* Department Quick Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'Road Maintenance', 'Water & Sewage', 'Street Lighting', 'Garbage & Sanitation', 'Public Safety & Hazards'].map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartmentFilter(dept)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      border: departmentFilter === dept ? '1px solid #00adb5' : '1px solid #e2e8f0',
                      backgroundColor: departmentFilter === dept ? 'rgba(0, 173, 181, 0.12)' : '#ffffff',
                      color: departmentFilter === dept ? '#00adb5' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {dept === 'all' ? 'All Departments' : dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Worker Cards Scroll List */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
                <RefreshCw size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                Loading department workers...
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>
                No workers found matching the search and department filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredWorkers.map((w) => {
                  const isSelected = selectedWorkerId === w.id;
                  const isAvailable = w.worker_status === 'available';
                  const isOnSite = w.worker_status === 'on_site';
                  const isDeptMatch = issue.category.toLowerCase().includes(w.department.toLowerCase().slice(0, 4));

                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorkerId(w.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #00adb5' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? 'rgba(0, 173, 181, 0.06)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 1px #00adb5' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#00adb5' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <HardHat size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {w.full_name}
                            {isDeptMatch && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', backgroundColor: 'rgba(0, 173, 181, 0.15)', color: '#00adb5' }}>
                                ⭐ Recommended
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                            <span>🏢 {w.department}</span>
                            <span>•</span>
                            <span>📍 {w.area || 'Mysuru Zone'}</span>
                            {w.phone && (
                              <>
                                <span>•</span>
                                <span>📞 {w.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '8px',
                            backgroundColor: isAvailable ? 'rgba(22, 163, 74, 0.12)' : isOnSite ? 'rgba(234, 179, 8, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                            color: isAvailable ? '#16a34a' : isOnSite ? '#ca8a04' : '#0284c7',
                            textTransform: 'capitalize'
                          }}
                        >
                          {w.worker_status.replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          {w.active_tasks_count} active task(s)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operational Parameters: Priority & Target SLA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {/* Priority Directive */}
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
                <option value="🚨 Emergency / Immediate Dispatch">🚨 Emergency / Immediate Dispatch (Accident/Hazard)</option>
                <option value="⚡ High Urgency (24h-48h)">⚡ High Urgency (Within 24-48 Hours)</option>
                <option value="📋 Standard Schedule (48h)">📋 Standard Schedule (Within 48 Hours)</option>
                <option value="🛠️ Routine Maintenance">🛠️ Routine Maintenance Schedule</option>
              </select>
            </div>

            {/* Target Resolution SLA */}
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

          {/* Equipment & Special Tools Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              4. Required Heavy Machinery / Equipment Tags:
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
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Wrench size={12} />
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Directives Templates */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} color="#00adb5" /> 5. Work Instructions &amp; Action Plan:
              </label>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Click template to auto-fill</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {templatesForCategory.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    lineHeight: 1.35
                  }}
                >
                  💡 {tpl}
                </button>
              ))}
            </div>

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
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {selectedWorkerId ? 'Crew member selected & ready for dispatch.' : 'Please pick a field worker above.'}
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
              isDisabled={!selectedWorkerId}
            >
              {isReassigning ? 'Confirm Reassignment' : 'Dispatch Worker'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
