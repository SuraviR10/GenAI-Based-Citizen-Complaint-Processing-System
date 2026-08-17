import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestionButtonsProps {
  role: string;
  language: 'English' | 'Kannada' | 'Hindi';
  onSelectSuggestion: (text: string) => void;
}

export const SuggestionButtons: React.FC<SuggestionButtonsProps> = ({
  role,
  language,
  onSelectSuggestion
}) => {
  const roleClean = (role || 'citizen').toLowerCase();

  const getSuggestions = () => {
    if (roleClean === 'worker') {
      if (language === 'Kannada') {
        return [
          'ನನ್ನ ಕೆಲಸಗಳ ಪಟ್ಟಿ?',
          'ಹೆಚ್ಚಿನ ಆದ್ಯತೆಯ ಕೆಲಸ ಯಾವುದು?',
          'ಪರಿಶೀಲನೆ ಫೋಟೋ ನಿಯಮಗಳು?'
        ];
      } else if (language === 'Hindi') {
        return [
          'मेरे आवंटित कार्य कौन से हैं?',
          'सर्वोच्च प्राथमिकता वाला कार्य?',
          'निरीक्षण फोटो दिशानिर्देश?'
        ];
      }
      return [
        'What are my assigned tasks?',
        'Highest priority task?',
        'Inspection photo guidelines'
      ];
    }

    if (roleClean === 'corporation') {
      if (language === 'Kannada') {
        return [
          'ತುರ್ತು ಸಮಸ್ಯೆಗಳು (Critical)?',
          'ಮೈಸೂರು ನಗರದ ಒಟ್ಟು ವರದಿಗಳು?',
          'ಸಿಬ್ಬಂದಿ ಹಂಚಿಕೆ ಪರಿಶೀಲಿಸಿ'
        ];
      } else if (language === 'Hindi') {
        return [
          'गंभीर (Critical) समस्याएं?',
          'मैसूर नगर निगम सांख्यिकी?',
          'कार्यकर्ता आवंटन की स्थिति'
        ];
      }
      return [
        'Critical triage issues?',
        'City-wide civic statistics',
        'Field crew assignments'
      ];
    }

    // Citizen Role
    if (language === 'Kannada') {
      return [
        'ನನ್ನ ಬಡಾವಣೆಯ ಸಮಸ್ಯೆಗಳು?',
        'ನನ್ನ ದೂರುಗಳ ಸ್ಥಿತಿ ಏನು?',
        'ಆದ್ಯತೆ ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ?'
      ];
    } else if (language === 'Hindi') {
      return [
        'मेरे क्षेत्र की समस्याएं?',
        'मेरी शिकायतों की स्थिति?',
        'प्राथमिकता की गणना कैसे होती है?'
      ];
    }
    return [
      'Issues in my area?',
      'Show my reported complaints',
      'Why is an issue marked Critical?'
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div
      className="no-scrollbar"
      style={{
        padding: '8px 12px',
        backgroundColor: '#f1f5f9',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#64748b',
          flexShrink: 0
        }}
      >
        <Sparkles size={13} color="#00adb5" />
        <span>Suggestions:</span>
      </div>
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelectSuggestion(s)}
          style={{
            whiteSpace: 'nowrap',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0f7fa';
            e.currentTarget.style.borderColor = '#00adb5';
            e.currentTarget.style.color = '#008b92';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#334155';
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
};
