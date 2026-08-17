import React, { useRef, useEffect } from 'react';
import { Bot, X, RotateCcw, Building2, HardHat, UserCheck, Globe } from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatAction } from '../../services/chatbotService';
import { ChatMessage } from './ChatMessage';
import { SuggestionButtons } from './SuggestionButtons';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  loading: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  onSend: (text?: string) => void;
  onActionClick: (action: ChatAction) => void;
  onClearHistory: () => void;
  activeLanguage: 'English' | 'Kannada' | 'Hindi';
  onLanguageChange: (lang: 'English' | 'Kannada' | 'Hindi') => void;
  role: string;
  userName: string;
  userArea: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  loading,
  inputValue,
  onInputChange,
  onSend,
  onActionClick,
  onClearHistory,
  activeLanguage,
  onLanguageChange,
  role,
  userName,
  userArea
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

  const roleClean = (role || 'citizen').toLowerCase();

  const getRoleHeader = () => {
    if (roleClean === 'worker') {
      return {
        title: 'Field Crew Operations AI',
        subtitle: `MCC Worker Channel • ${userArea}`,
        badge: '👷 Field Crew',
        headerClass: 'civic-chat-header-worker'
      };
    }
    if (roleClean === 'corporation') {
      return {
        title: 'MCC Official AI Assistant',
        subtitle: `Triage & Operations • Mysuru`,
        badge: '🏛️ MCC Official',
        headerClass: 'civic-chat-header-corporation'
      };
    }
    return {
      title: 'CivicConnect AI Guide',
      subtitle: `Mysuru City Corporation • ${userArea}`,
      badge: '👤 Citizen',
      headerClass: 'civic-chat-header-citizen'
    };
  };

  const headerInfo = getRoleHeader();

  return (
    <div className="civic-chat-window">
      {/* Header */}
      <div className={headerInfo.headerClass} style={{ color: '#ffffff', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <Bot size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {headerInfo.title}
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff'
                  }}
                >
                  {headerInfo.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.82)', margin: '2px 0 0 0' }}>
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={onClearHistory}
              title="Reset Conversation"
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              title="Close Chat"
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Language Selector Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '10px',
            padding: '4px 10px',
            fontSize: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.7rem', fontWeight: 600 }}>
            <Globe size={13} />
            <span>Language:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {(['English', 'Kannada', 'Hindi'] as const).map((lang) => {
              const isSelected = activeLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.85)',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lang === 'English' ? 'EN' : lang === 'Kannada' ? 'ಕನ್ನಡ' : 'हिन्दी'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="civic-chat-messages">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onActionClick={onActionClick} />
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '0.75rem', padding: '6px 0' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#00adb5',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bot size={16} />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                padding: '8px 12px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <span
                className="animate-ping"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#00adb5',
                  display: 'inline-block'
                }}
              />
              <span style={{ fontWeight: 600, color: '#334155' }}>
                {activeLanguage === 'Kannada'
                  ? 'ಲೈವ್ ಡೇಟಾ ಪಡೆಯಲಾಗುತ್ತಿದೆ...'
                  : activeLanguage === 'Hindi'
                  ? 'लाइव डेटा प्राप्त किया जा रहा है...'
                  : 'Retrieving live MCC data...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <SuggestionButtons
        role={role}
        language={activeLanguage}
        onSelectSuggestion={(s) => onSend(s)}
      />

      {/* Input Bar */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={() => onSend()}
        loading={loading}
        language={activeLanguage}
        area={userArea}
      />
    </div>
  );
};
