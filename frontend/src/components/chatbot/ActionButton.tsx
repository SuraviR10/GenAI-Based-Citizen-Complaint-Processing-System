import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { ChatAction } from '../../services/chatbotService';

interface ActionButtonProps {
  actions?: ChatAction[];
  onActionClick: (action: ChatAction) => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ actions, onActionClick }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#00adb5',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0, 173, 181, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#008b92';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#00adb5';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <span>{action.label}</span>
          <ArrowRight size={13} />
        </button>
      ))}
    </div>
  );
};
