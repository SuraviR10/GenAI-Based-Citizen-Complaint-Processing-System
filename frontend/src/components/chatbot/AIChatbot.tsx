import React from 'react';
import { Bot } from 'lucide-react';
import { useChatbot } from '../../hooks/useChatbot';
import { ChatWindow } from './ChatWindow';

export const AIChatbot: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    activeLanguage,
    setActiveLanguage,
    messages,
    loading,
    inputValue,
    setInputValue,
    sendMessage,
    handleActionClick,
    clearHistory,
    userRole,
    userName,
    userArea
  } = useChatbot();

  return (
    <>
      {/* Floating Chat Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="civic-chat-launcher"
          aria-label="Open CivicConnect AI Assistant"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} color="#ffffff" />
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                display: 'flex',
                width: '10px',
                height: '10px'
              }}
            >
              <span
                className="animate-ping"
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  height: '100%',
                  width: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#a7f3d0',
                  opacity: 0.75
                }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  borderRadius: '50%',
                  height: '10px',
                  width: '10px',
                  backgroundColor: '#ffffff'
                }}
              />
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.2 }}>Civic AI Assistant</span>
            <span style={{ fontSize: '0.68rem', color: '#e0f2fe', fontWeight: 600, lineHeight: 1.2 }}>
              {userRole === 'corporation'
                ? 'MCC Triage & Ops'
                : userRole === 'worker'
                ? 'Field Crew Assistant'
                : 'Live Mysuru Support'}
            </span>
          </div>
        </button>
      )}

      {/* Main Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        loading={loading}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={sendMessage}
        onActionClick={handleActionClick}
        onClearHistory={clearHistory}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        role={userRole}
        userName={userName}
        userArea={userArea}
      />
    </>
  );
};
