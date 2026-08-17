import React, { useState } from 'react';
import { ThumbsUp, Check, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

export interface SupportButtonProps {
  issueId: string;
  initialSupported?: boolean;
  initialCount?: number;
  onCountChanged?: (newCount: number, isSupported: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  issueId,
  initialSupported = false,
  initialCount = 0,
  onCountChanged,
  size = 'md'
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [isSupported, setIsSupported] = useState(initialSupported);
  const [supportCount, setSupportCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      error('Please sign in to support this civic issue.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.toggleIssueSupport(issueId, user.id);
      setIsSupported(res.is_supported);
      setSupportCount(res.support_count);
      if (onCountChanged) onCountChanged(res.support_count, res.is_supported);

      if (res.is_supported) {
        success('Supported!', 'You are now backing this community issue.');
      } else {
        success('Support removed', 'You removed your support from this issue.');
      }
    } catch (err: any) {
      error('Could not update support', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSupported) {
    return (
      <Button
        variant="secondary"
        size={size}
        leftIcon={<Check size={16} color="var(--color-success)" strokeWidth={3} />}
        onClick={handleToggle}
        isLoading={isLoading}
        style={{
          borderColor: 'var(--color-success-border)',
          backgroundColor: 'var(--color-success-bg)',
          color: '#065f46',
          fontWeight: 700
        }}
        title="Click to remove your support"
      >
        <span>Supported ({supportCount})</span>
      </Button>
    );
  }

  return (
    <Button
      variant="cyan"
      size={size}
      leftIcon={<ThumbsUp size={16} />}
      onClick={handleToggle}
      isLoading={isLoading}
      title="Support this community problem"
    >
      <span>Support ({supportCount})</span>
    </Button>
  );
};
