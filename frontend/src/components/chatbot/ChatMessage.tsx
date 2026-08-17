import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatAction } from '../../services/chatbotService';
import { SourceIndicator } from './SourceIndicator';
import { ActionButton } from './ActionButton';

interface ChatMessageProps {
  message: ChatMessageType;
  onActionClick: (action: ChatAction) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: '6px'
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: isUser
            ? '#0b192c'
            : message.isError
            ? '#fee2e2'
            : '#00adb5',
          color: message.isError && !isUser ? '#dc2626' : '#ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
      >
        {isUser ? (
          <User size={15} />
        ) : message.isError ? (
          <AlertCircle size={15} />
        ) : (
          <Bot size={15} />
        )}
      </div>

      {/* Bubble */}
      <div
        className={
          isUser
            ? 'civic-chat-bubble-user'
            : message.isError
            ? 'civic-chat-bubble-error'
            : 'civic-chat-bubble-ai'
        }
      >
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
          {message.text}
        </div>

        {/* Verified Data Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceIndicator sources={message.sources} />
        )}

        {/* Action Triggers */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <ActionButton actions={message.actions} onActionClick={onActionClick} />
        )}

        {/* Timestamp */}
        <div
          style={{
            fontSize: '0.65rem',
            marginTop: '6px',
            textAlign: 'right',
            color: isUser ? 'rgba(255, 255, 255, 0.6)' : '#94a3b8',
            fontWeight: 500
          }}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
