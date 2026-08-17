import React, { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
  language: 'English' | 'Kannada' | 'Hindi';
  area: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  loading,
  language,
  area
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getPlaceholder = () => {
    if (language === 'Kannada') {
      return `${area} ದ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ... (ಉದಾ: ರಸ್ತೆ ಗುಂಡಿ, ದೂರುಗಳು)`;
    }
    if (language === 'Hindi') {
      return `${area} की समस्याओं के बारे में पूछें... (उदा: गड्ढे, शिकायतें)`;
    }
    return `Ask about ${area} issues, complaints, repairs...`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="civic-chat-input-bar">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={loading}
          className="civic-chat-input-field"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="civic-chat-send-btn"
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
      <div style={{ marginTop: '2px', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8' }}>
        Grounded in live Mysore City Corporation (MCC) data.
      </div>
    </div>
  );
};
