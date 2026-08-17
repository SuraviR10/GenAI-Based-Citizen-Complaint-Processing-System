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
  ShieldAlert
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

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '18px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header: Urgency & Action Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PriorityBadge level={task.priority_level} size="sm" showScore score={task.priority_score} />
          <StatusBadge status={task.status} size="sm" />
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

      {/* Task Title & Description */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>
          {task.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
          {task.description}
        </p>
      </div>

      {/* Location & Safety Warning */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

        {task.accident_reported && (
          <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <AlertTriangle size={13} /> Citizen Accidents Reported: {task.accident_description || 'Severe hazard for two-wheelers'}
          </div>
        )}
      </div>

      {/* Official Instructions */}
      {task.instructions && (
        <div style={{ fontSize: '0.8rem', color: '#334155', backgroundColor: 'rgba(0, 173, 181, 0.06)', borderLeft: '3px solid #00adb5', padding: '8px 12px', borderRadius: '0 6px 6px 0' }}>
          <span style={{ fontWeight: 700, color: '#00adb5' }}>Directives: </span>
          {task.instructions}
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
