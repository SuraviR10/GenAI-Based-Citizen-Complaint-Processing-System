import React, { ReactNode } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  FileText, 
  ShieldAlert,
  Flame,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { PriorityLevel, IssueStatus } from '../../lib/types';

export interface BadgeProps {
  type?: 'priority' | 'status' | 'category' | 'ai' | 'neutral';
  value?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'neutral';
  size?: 'sm' | 'md';
  customLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  type = 'status',
  value,
  variant,
  size = 'md',
  customLabel,
  className = '',
  style,
  children
}) => {
  // If children or variant are passed directly
  if (children || variant) {
    let variantClass = 'badge-neutral';
    let Icon = FileText;

    if (variant === 'success') {
      variantClass = 'badge-low';
      Icon = CheckCircle2;
    } else if (variant === 'warning') {
      variantClass = 'badge-medium';
      Icon = Clock;
    } else if (variant === 'danger') {
      variantClass = 'badge-critical';
      Icon = AlertCircle;
    } else if (variant === 'info' || variant === 'cyan') {
      variantClass = 'badge-info';
      Icon = Sparkles;
    }

    const paddingStyle = size === 'sm' ? { padding: '2px 8px', fontSize: '0.725rem' } : { padding: '4px 10px', fontSize: '0.775rem' };

    return (
      <span
        className={`badge ${variantClass} ${className}`}
        style={{ ...paddingStyle, ...style }}
      >
        <Icon size={size === 'sm' ? 12 : 14} aria-hidden="true" />
        <span>{children || value || ''}</span>
      </span>
    );
  }

  const rawValue = value || '';
  const normalized = rawValue.toLowerCase().replace(/[\s-]/g, '_');

  let badgeClass = 'badge-neutral';
  let Icon = FileText;
  let label = customLabel || rawValue;

  if (type === 'priority') {
    switch (normalized as PriorityLevel) {
      case 'critical':
        badgeClass = 'badge-critical';
        Icon = Flame;
        label = customLabel || 'Critical Priority';
        break;
      case 'high':
        badgeClass = 'badge-high';
        Icon = AlertTriangle;
        label = customLabel || 'High Priority';
        break;
      case 'medium':
        badgeClass = 'badge-medium';
        Icon = Clock;
        label = customLabel || 'Medium Priority';
        break;
      case 'low':
        badgeClass = 'badge-low';
        Icon = CheckCircle2;
        label = customLabel || 'Low Priority';
        break;
      default:
        badgeClass = 'badge-neutral';
        Icon = ShieldAlert;
    }
  } else if (type === 'status') {
    switch (normalized) {
      case 'reported':
        badgeClass = 'badge-neutral';
        Icon = FileText;
        label = customLabel || 'Reported';
        break;
      case 'reviewed':
        badgeClass = 'badge-info';
        Icon = Clock;
        label = customLabel || 'Corporation Reviewed';
        break;
      case 'assigned':
        badgeClass = 'badge-medium';
        Icon = UserCheck;
        label = customLabel || 'Worker Assigned';
        break;
      case 'in_progress':
        badgeClass = 'badge-high';
        Icon = Clock;
        label = customLabel || 'Work in Progress';
        break;
      case 'completed':
      case 'resolved':
        badgeClass = 'badge-low';
        Icon = CheckCircle2;
        label = customLabel || 'Resolved';
        break;
      case 'rejected':
        badgeClass = 'badge-critical';
        Icon = XCircle;
        label = customLabel || 'Declined';
        break;
      default:
        badgeClass = 'badge-neutral';
        Icon = FileText;
    }
  } else if (type === 'ai') {
    badgeClass = 'badge-info';
    Icon = Sparkles;
    label = customLabel || 'AI-Assisted';
  }

  const paddingStyle = size === 'sm' ? { padding: '2px 8px', fontSize: '0.725rem' } : { padding: '4px 10px', fontSize: '0.775rem' };

  return (
    <span
      className={`badge ${badgeClass} ${className}`}
      style={{ ...paddingStyle, ...style }}
      aria-label={`${type}: ${label}`}
    >
      <Icon size={size === 'sm' ? 12 : 14} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ level: string; size?: 'sm' | 'md'; showScore?: boolean; score?: number; style?: React.CSSProperties }> = ({
  level,
  size = 'md',
  showScore,
  score,
  style
}) => {
  const customLabel = showScore && score !== undefined ? `${level.toUpperCase()} (${score})` : undefined;
  return <Badge type="priority" value={level} size={size} customLabel={customLabel} style={style} />;
};

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md'; style?: React.CSSProperties }> = ({
  status,
  size = 'md',
  style
}) => {
  return <Badge type="status" value={status} size={size} style={style} />;
};

