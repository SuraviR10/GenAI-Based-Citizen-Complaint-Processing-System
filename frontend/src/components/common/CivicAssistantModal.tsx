import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  HelpCircle, 
  ArrowRight, 
  ExternalLink,
  Bot,
  User,
  Loader2,
  Globe,
  Building2,
  HardHat,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  suggestedActions?: string[];
  helpfulLinks?: string[];
  timestamp?: string;
}

type ChatLang = 'English' | 'Kannada' | 'Hindi';

export const CivicAssistantModal: React.FC = () => {
  const { profile, user, isCitizen, isCorporation, isWorker } = useAuth();
  const { language: appLang } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [chatLang, setChatLang] = useState<ChatLang>((appLang as ChatLang) || 'English');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync with global app language when it changes
  useEffect(() => {
    if (appLang === 'Kannada' || appLang === 'Hindi' || appLang === 'English') {
      setChatLang(appLang as ChatLang);
    }
  }, [appLang]);

  const activeRole = profile?.role || (isCorporation ? 'corporation' : isWorker ? 'worker' : 'citizen');
  const activeArea = profile?.area || 'Gokulam';

  // Role & Language Adaptive Greeting
  const getInitialGreeting = (role: string, lang: ChatLang) => {
    if (role === 'worker') {
      if (lang === 'Kannada') {
        return `ನಮಸ್ಕಾರ ${profile?.full_name || 'ಫೀಲ್ಡ್ ವರ್ಕರ್'}! ನಾನು ನಿಮ್ಮ ಫೀಲ್ಡ್ ಆಪರೇಷನ್ಸ್ AI ಸಹಾಯಕ. ನಿಮ್ಮ ನಿಯೋಜಿತ ಕಾಮಗಾರಿಗಳು, ಸ್ಥಳ ಪರಿಶೀಲನೆ ಫೋಟೋ ನಿಯಮಗಳು ಮತ್ತು ದುರಸ್ತಿ ಪ್ರಕ್ರಿಯೆ ಬಗ್ಗೆ ಕೇಳಿ.`;
      }
      if (lang === 'Hindi') {
        return `नमस्ते ${profile?.full_name || 'फील्ड वर्कर'}! मैं आपका फील्ड ऑपरेशंस AI सहायक हूँ। अपने आवंटित कार्यों, निरीक्षण फोटो के नियमों और मरम्मत प्रक्रिया के बारे में पूछें।`;
      }
      return `Hello ${profile?.full_name || 'Field Crew'}! I am your real-time Field Operations AI Assistant. Ask me about your assigned tasks, inspection photo protocols, or status updates.`;
    }

    if (role === 'corporation') {
      if (lang === 'Kannada') {
        return `ನಮಸ್ಕಾರ ಅಧಿಕಾರಿಗಳೇ! ನಾನು ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಲೈವ್ AI ಆಪರೇಷನ್ಸ್ ಗೈಡ್. ಟ್ರಯೇಜ್ ಬ್ಯಾಕ್‌ಲಾಗ್, ತುರ್ತು ರಸ್ತೆ/ಒಳಚರಂಡಿ ವರದಿಗಳು ಅಥವಾ ಸಿಬ್ಬಂದಿ ನಿಯೋಜನೆ ಕುರಿತು ಕೇಳಿ.`;
      }
      if (lang === 'Hindi') {
        return `नमस्ते अधिकारी महोदय! मैं मैसूर नगर निगम (MCC) लाइव AI ऑपरेशंस गाइड हूँ। ट्राइएज बैकलॉग, उच्च प्राथमिकता समस्याओं या कार्यकर्ता आवंटन के बारे में पूछें।`;
      }
      return `Welcome, Official! I am your MCC Live Operations AI Assistant. Ask me about real-time triage queues, critical backlog across Mysuru wards, or crew assignments.`;
    }

    // Citizen
    if (lang === 'Kannada') {
      return `ನಮಸ್ಕಾರ ${profile?.full_name || 'ನಾಗರಿಕರೇ'}! ನಾನು ಮೈಸೂರು ಪಾಲಿಕೆಯ ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ಮಾರ್ಗದರ್ಶಿ. ${activeArea} ದ ಲೈವ್ ಸಮಸ್ಯೆಗಳು, ದೂರು ಸಲ್ಲಿಕೆ ಅಥವಾ ಪ್ರಗತಿ ಪರಿಶೀಲನೆ ಕುರಿತು ಕೇಳಿ.`;
    }
    if (lang === 'Hindi') {
      return `नमस्ते ${profile?.full_name || 'नागरिक'}! मैं मैसूर नगर निगम सिविककनेक्ट AI गाइड हूँ। ${activeArea} की लाइव समस्याओं, शिकायत दर्ज करने या प्रगति देखने के बारे में पूछें।`;
    }
    return `Hello ${profile?.full_name || 'Citizen'}! I am your real-time Mysuru CivicConnect AI Guide. Ask me about live issues in ${activeArea}, reporting potholes, or tracking MCC repairs.`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: getInitialGreeting(activeRole, chatLang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // When language changes, add a language transition notice
  const handleLanguageChange = (newLang: ChatLang) => {
    setChatLang(newLang);
    const greeting = getInitialGreeting(activeRole, newLang);
    setMessages((prev) => [
      ...prev,
      {
        sender: 'assistant',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Dynamic Role & Language Quick Action Prompts
  const getQuickQuestions = () => {
    if (activeRole === 'worker') {
      if (chatLang === 'Kannada') {
        return [
          { label: 'ನನ್ನ ಕೆಲಸಗಳಾವವು?', q: 'ನನಗೆ ಮೈಸೂರಿನಲ್ಲಿ ನಿಯೋಜಿಸಲಾದ ಕಾರ್ಯಗಳಾವವು?' },
          { label: 'ಪರಿಶೀಲನೆ ಫೋಟೋ ನಿಯಮಗಳು?', q: 'ಸ್ಥಳ ತಪಾಸಣೆ ಮತ್ತು ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ನಿಯಮಗಳೇನು?' },
          { label: 'ಪೂರ್ಣಗೊಳಿಸುವುದು ಹೇಗೆ?', q: 'ಕಾಮಗಾರಿ ಮುಗಿದ ನಂತರ ಪೂರ್ಣಗೊಂಡ ಸ್ಥಿತಿ ಹೇಗೆ ದಾಖಲಿಸುವುದು?' }
        ];
      }
      if (chatLang === 'Hindi') {
        return [
          { label: 'मेरे कार्य कौन से हैं?', q: 'मुझे मैसूर में कौन से कार्य आवंटित किए गए हैं?' },
          { label: 'निरीक्षण फोटो नियम?', q: 'स्थल निरीक्षण और फोटो अपलोड के क्या नियम हैं?' },
          { label: 'कार्य पूर्ण कैसे करें?', q: 'कार्य पूरा होने पर रिपोर्ट कैसे सबमिट करें?' }
        ];
      }
      return [
        { label: 'My Assigned Tasks?', q: 'What are my active assigned tasks in Mysuru?' },
        { label: 'Inspection Photo Rules?', q: 'What are the field inspection photo and notes requirements?' },
        { label: 'How to Complete Task?', q: 'How do I submit completion proof and close a work order?' }
      ];
    }

    if (activeRole === 'corporation') {
      if (chatLang === 'Kannada') {
        return [
          { label: 'ಬಾಕಿ ತುರ್ತು ಸಮಸ್ಯೆಗಳು?', q: 'ಮೈಸೂರಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ಬಾಕಿ ಇರುವ ಅಧಿಕ ಆದ್ಯತೆಯ ಸಮಸ್ಯೆಗಳಾವವು?' },
          { label: `${activeArea} ವಾರ್ಡ್ ಸ್ಥಿತಿ?`, q: `${activeArea} ವಾರ್ಡ್‌ನಲ್ಲಿ ಎಷ್ಟು ಸಕ್ರಿಯ ಸಮಸ್ಯೆಗಳಿವೆ?` },
          { label: 'ಕೆಲಸಗಾರರ ನಿಯೋಜನೆ?', q: 'ತುರ್ತು ಕಾಮಗಾರಿಗಳಿಗೆ ಫೀಲ್ಡ್ ಸಿಬ್ಬಂದಿ ನಿಯೋಜನೆ ಮಾಡುವುದು ಹೇಗೆ?' }
        ];
      }
      if (chatLang === 'Hindi') {
        return [
          { label: 'लंबित महत्वपूर्ण मामले?', q: 'मैसूर में वर्तमान में उच्च प्राथमिकता वाली कौन सी समस्याएं लंबित हैं?' },
          { label: `${activeArea} वार्ड स्थिति?`, q: `${activeArea} वार्ड में कितनी सक्रिय समस्याएं हैं?` },
          { label: 'कार्यकर्ता आवंटन?', q: 'आपातकालीन मरम्मत के लिए फील्ड क्रू कैसे आवंटित करें?' }
        ];
      }
      return [
        { label: 'Triage Backlog Summary?', q: 'What is the current triage backlog and critical issues count across Mysuru?' },
        { label: `${activeArea} Ward Summary?`, q: `How many active civic issues are reported in ${activeArea}?` },
        { label: 'Worker Dispatch Status?', q: 'How do I review corroboration and assign field crews?' }
      ];
    }

    // Citizen
    if (chatLang === 'Kannada') {
      return [
        { label: `${activeArea} ಸಮಸ್ಯೆಗಳಾವವು?`, q: `${activeArea} ಮೈಸೂರಿನಲ್ಲಿ ಸದ್ಯಕ್ಕೆ ಇರುವ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳಾವವು?` },
        { label: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?', q: 'ರಸ್ತೆ ಗುಂಡಿ ಅಥವಾ ಒಳಚರಂಡಿ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?' },
        { label: 'ಆದ್ಯತಾ ಅಂಕ ಎಂದರೇನು?', q: 'ಸಮಸ್ಯೆಯ ಆದ್ಯತಾ ಅಂಕ (Priority Score) ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ?' },
        { label: 'ಬೆಂಬಲ ನೀಡುವುದು ಹೇಗೆ?', q: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಮಸ್ಯೆಗೆ ಬೆಂಬಲ (Support) ನೀಡುವುದರಿಂದ ಏನು ಪ್ರಯೋಜನ?' }
      ];
    }
    if (chatLang === 'Hindi') {
      return [
        { label: `${activeArea} में समस्याएं?`, q: `${activeArea} मैसूर में वर्तमान में कौन सी समस्याएं दर्ज हैं?` },
        { label: 'समस्या कैसे दर्ज करें?', q: 'गड्ढे या कचरे की समस्या की रिपोर्ट कैसे दर्ज करें?' },
        { label: 'प्राथमिकता स्कोर क्या है?', q: 'समस्या का प्राथमिकता स्कोर (Priority Score) कैसे तय होता है?' },
        { label: 'समर्थन कैसे काम करता है?', q: 'मौजूदा समस्या का समर्थन (Support) करने से क्या लाभ होता है?' }
      ];
    }
    return [
      { label: `Issues in ${activeArea}?`, q: `What are the live civic issues reported in ${activeArea}, Mysuru?` },
      { label: 'How to Report Problem?', q: 'How do I report a pothole or water leak in my area?' },
      { label: 'How is Priority Calculated?', q: 'How is the deterministic 0-100 priority score calculated?' },
      { label: 'What does Support mean?', q: 'What does supporting an existing problem mean and how does it help?' }
    ];
  };

  const handleSend = async (userQuery?: string) => {
    const textToSend = userQuery || query;
    if (!textToSend.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text: textToSend, timestamp: timeStr };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await api.askCivicAssistant({
        query: textToSend,
        language: chatLang,
        role: activeRole,
        area: activeArea,
        department: profile?.department || undefined,
        user_id: user?.id || profile?.id || undefined
      });

      const aiMsg: ChatMessage = {
        sender: 'assistant',
        text: res.answer,
        suggestedActions: res.suggested_actions,
        helpfulLinks: res.helpful_links,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackText = chatLang === 'Kannada'
        ? `ಮೈಸೂರು ಪಾಲಿಕೆ (MCC) ಲೈವ್ ಮಾಹಿತಿ: ${activeArea} ನಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ಪರಿಹಾರ ಕಾರ್ಯ ಪ್ರಗತಿಯಲ್ಲಿದೆ. ನೀವು 'Report a Problem' ಮೂಲಕ ಹೊಸ ದೂರು ದಾಖಲಿಸಬಹುದು.`
        : chatLang === 'Hindi'
        ? `मैसूर नगर निगम (MCC) लाइव जानकारी: ${activeArea} में नागरिक समस्याओं का समाधान जारी है। आप 'Report a Problem' के माध्यम से नई रिपोर्ट दर्ज कर सकते हैं।`
        : `MCC Mysuru Live: Real-time municipal triage is active for ${activeArea}. You can report issues, support community reports, and track field repairs live.`;

      const fallbackMsg: ChatMessage = {
        sender: 'assistant',
        text: fallbackText,
        suggestedActions: ['Report a Problem', 'Explore Issues'],
        helpfulLinks: ['/citizen/report', '/citizen/issues'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Color theme per role
  const theme = activeRole === 'worker' 
    ? { primary: '#b45309', accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a', tag: 'FIELD CREW AI' }
    : activeRole === 'corporation'
    ? { primary: '#1e3a8a', accent: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', tag: 'MCC OFFICIAL AI' }
    : { primary: '#0b192c', accent: '#00adb5', bg: '#f0fdfa', border: '#ccfbf1', tag: 'CITIZEN AI GUIDE' };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Civic AI Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '50px',
          backgroundColor: theme.primary,
          color: '#ffffff',
          border: `1.5px solid ${theme.accent}`,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.35)`,
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: theme.accent,
            color: '#0b192c'
          }}
        >
          <Sparkles size={14} />
        </span>
        <span>
          {activeRole === 'worker' ? 'Worker AI Assistant' : activeRole === 'corporation' ? 'MCC AI Assistant' : 'AI Civic Guide'}
        </span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #cbd5e1',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: theme.primary,
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: `1px solid ${theme.accent}`,
                    color: theme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {activeRole === 'worker' ? <HardHat size={18} /> : activeRole === 'corporation' ? <Building2 size={18} /> : <Bot size={18} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      CivicConnect AI
                    </h3>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        backgroundColor: theme.accent,
                        color: '#0b192c',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {theme.tag}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Mysuru MCC Live • {activeArea}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Assistant"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Language Switcher Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={12} /> Language / ಭಾಷೆ / भाषा:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['English', 'Kannada', 'Hindi'] as ChatLang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLanguageChange(l)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: chatLang === l ? theme.accent : 'transparent',
                      color: chatLang === l ? '#0b192c' : '#e2e8f0',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {l === 'English' ? 'EN' : l === 'Kannada' ? 'ಕನ್ನಡ' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Questions Strip */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {getQuickQuestions().map((qq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qq.q)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {qq.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#fafbfc'
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: isUser ? theme.primary : '#ffffff',
                      color: isUser ? '#ffffff' : '#0f172a',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      boxShadow: isUser ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {m.text}
                  </div>

                  {/* Timestamp */}
                  {m.timestamp && (
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px', padding: '0 4px' }}>
                      {m.timestamp}
                    </span>
                  )}

                  {/* Optional helpful links & actions */}
                  {m.helpfulLinks && m.helpfulLinks.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {m.helpfulLinks.map((link, lIdx) => (
                        <Link
                          key={lIdx}
                          to={link}
                          onClick={() => setIsOpen(false)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#00adb5',
                            backgroundColor: 'rgba(0, 173, 181, 0.1)',
                            border: '1px solid rgba(0, 173, 181, 0.25)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{link.includes('report') ? '📝 Report' : link.includes('issues') ? '📋 View Issues' : link.includes('worker') ? '👷 Tasks' : link.includes('corporation') ? '🏛️ Triage' : 'Open'}</span>
                          <ExternalLink size={10} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem', padding: '6px 0' }}>
                <Loader2 size={14} className="animate-spin" />
                <span>
                  {chatLang === 'Kannada' ? 'ಲೈವ್ ಡೇಟಾ ಹುಡುಕಲಾಗುತ್ತಿದೆ...' : chatLang === 'Hindi' ? 'लाइव डेटा प्राप्त हो रहा है...' : 'Querying real-time database...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                chatLang === 'Kannada'
                  ? 'ಲೈವ್ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ಗೋಕುಲಂ ಸಮಸ್ಯೆಗಳು, ನನ್ನ ಕೆಲಸಗಳು)...'
                  : chatLang === 'Hindi'
                  ? 'लाइव प्रश्न पूछें (उदा: गोकुलम समस्याएं, मेरे कार्य)...'
                  : 'Ask a live question (e.g. issues in Gokulam, my tasks)...'
              }
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: theme.accent,
                color: '#0b192c',
                border: 'none',
                cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !query.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

