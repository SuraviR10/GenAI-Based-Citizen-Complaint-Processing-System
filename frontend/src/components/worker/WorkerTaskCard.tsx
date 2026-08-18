import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  HardHat, 
  CheckCircle2, 
  Camera, 
  ArrowRight, 
  Navigation,
  FileText,
  ShieldAlert,
  Wrench,
  Flame,
  Calendar
} from 'lucide-react';
import { WorkerTask } from '../../lib/types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';

export interface WorkerTaskCardProps {
  task: WorkerTask;
  onInspectionClick?: (task: WorkerTask) => void;
  onProgressClick?: (task: WorkerTask) => void;
  onCompleteClick?: (task: WorkerTask) => void;
}

export const WorkerTaskCard: React.FC<WorkerTaskCardProps> = ({
  task,
  onInspectionClick,
  onProgressClick,
  onCompleteClick
}) => {
  const isCompleted = task.status === 'completed';
  const isAssigned = task.status === 'assigned';
  const isInspection = task.status === 'inspection';
  const isInProgress = task.status === 'in_progress';

  const isEmergency = task.priority_directive?.includes('Emergency') || task.priority_level === 'critical';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: isEmergency ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
        padding: '20px',
        boxShadow: isEmergency ? '0 4px 12px rgba(220, 38, 38, 0.08)' : '0 2px 6px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header: Urgency & Action Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <PriorityBadge level={task.priority_level} size="sm" showScore score={task.priority_score} />
          <StatusBadge status={task.status} size="sm" />

          {task.priority_directive && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: isEmergency ? '#fef2f2' : '#f0f9ff',
                color: isEmergency ? '#dc2626' : '#0284c7',
                border: isEmergency ? '1px solid #fecaca' : '1px solid #bae6fd'
              }}
            >
              {task.priority_directive}
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '12px',
            backgroundColor: isCompleted ? '#f0fdf4' : isInProgress ? '#fff7ed' : isInspection ? '#fefce8' : '#f1f5f9',
            color: isCompleted ? '#16a34a' : isInProgress ? '#ea580c' : isInspection ? '#ca8a04' : '#475569',
            border: isCompleted ? '1px solid #bbf7d0' : isInProgress ? '1px solid #fed7aa' : '1px solid #fef08a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {task.required_action}
        </span>
      </div>

      {/* Task Title & Category */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
          🏢 {task.category} &bull; Assigned #{task.id.slice(0, 8)}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>
          {task.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
          {task.description}
        </p>
      </div>

      {/* Location, SLA Target, & Safety Signals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
            <MapPin size={15} color="#00adb5" />
            <span>{task.area} {task.landmark ? `• ${task.landmark}` : ''}</span>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.area + ' ' + (task.landmark || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem',
              color: '#0284c7',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Navigation size={12} /> Directions
          </a>
        </div>

        {/* SLA Target & Dispatch Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} color="#ea580c" />
            <span>Target SLA: <strong style={{ color: '#ea580c' }}>{task.target_deadline || 'Within 48 Hours'}</strong></span>
          </div>

          <div>
            Dispatched at: <strong>{new Date(task.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        </div>

        {task.accident_reported && (
          <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={13} /> Citizen Accidents Reported: {task.accident_description || 'Severe hazard for two-wheelers'}
          </div>
        )}
      </div>

      {/* Equipment Required Section */}
      {task.equipment_required && task.equipment_required.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={13} color="#00adb5" /> Machinery &amp; Equipment Required:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {task.equipment_required.map((eq) => (
              <span
                key={eq}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1'
                }}
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Corporation Instructions */}
      {task.instructions && (
        <div style={{ fontSize: '0.82rem', color: '#334155', backgroundColor: 'rgba(0, 173, 181, 0.06)', borderLeft: '3px solid #00adb5', padding: '10px 12px', borderRadius: '0 8px 8px 0' }}>
          <div style={{ fontWeight: 800, color: '#00adb5', marginBottom: '2px' }}>
            📋 Corporation Directives:
          </div>
          <div>{task.instructions}</div>
        </div>
      )}

      {/* Action Buttons for Mobile Execution */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        {isAssigned && onInspectionClick && (
          <Button
            type="button"
            variant="cyan"
            size="sm"
            leftIcon={<Camera size={14} />}
            onClick={() => onInspectionClick(task)}
            style={{ flex: 1 }}
          >
            Start Site Inspection
          </Button>
        )}

        {(isInspection || isInProgress) && onProgressClick && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<HardHat size={14} />}
            onClick={() => onProgressClick(task)}
            style={{ flex: 1 }}
          >
            Log Progress
          </Button>
        )}

        {!isCompleted && onCompleteClick && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={14} />}
            onClick={() => onCompleteClick(task)}
            style={{ flex: 1 }}
          >
            Mark Completed
          </Button>
        )}

        {isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} /> Field Work Successfully Completed
          </div>
        )}
      </div>
    </div>
  );
};
