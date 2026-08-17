import React from 'react';
import { DepartmentWorkload } from '../../lib/types';
import { HardHat, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export interface DepartmentWorkloadCardProps {
  workloads: DepartmentWorkload[];
  selectedDepartment?: string;
  onSelectDepartment?: (dept: string) => void;
}

export const DepartmentWorkloadCard: React.FC<DepartmentWorkloadCardProps> = ({
  workloads,
  selectedDepartment,
  onSelectDepartment
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
      {workloads.map((w) => {
        const isSelected = selectedDepartment === w.department;
        const hasCritical = w.critical_issues > 0;

        return (
          <div
            key={w.department}
            onClick={() => onSelectDepartment && onSelectDepartment(w.department)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: isSelected ? '2px solid #00adb5' : '1px solid #e2e8f0',
              padding: '16px',
              boxShadow: isSelected ? '0 4px 12px rgba(0, 173, 181, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
              cursor: onSelectDepartment ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {w.department}
                </h4>
                {hasCritical && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <AlertTriangle size={11} /> {w.critical_issues} Critical
                  </span>
                )}
              </div>

              {/* Counts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '12px 0' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{w.active_issues}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Active</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>{w.in_progress}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>In Progress</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>{w.resolved}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Resolved</div>
                </div>
              </div>
            </div>

            {/* Crew Capacity Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HardHat size={14} color="#00adb5" /> Crew Capacity
              </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {w.available_workers} / {w.total_workers} Available
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
