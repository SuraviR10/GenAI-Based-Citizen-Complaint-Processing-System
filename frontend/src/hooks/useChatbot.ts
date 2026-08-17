/**
 * CivicConnect AI — useChatbot Hook
 * Manages conversational state, multi-turn memory, active language, and tool action dispatching.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { chatbotService, ChatMessage, ChatAction } from '../services/chatbotService';

export function useChatbot() {
  const { user } = useAuth();
  const { language: appLanguage } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'English' | 'Kannada' | 'Hindi'>('English');
  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Synchronize initial language with app language if supported
  useEffect(() => {
    if (appLanguage === 'Kannada') setActiveLanguage('Kannada');
    else if (appLanguage === 'Hindi') setActiveLanguage('Hindi');
    else setActiveLanguage('English');
  }, [appLanguage]);

  // Initial greeting message when conversation starts
  useEffect(() => {
    if (messages.length === 0) {
      const roleName = user?.role === 'corporation' ? 'MCC Official' : (user?.role === 'worker' ? 'Field Crew' : 'Citizen');
      const area = user?.area || 'Mysuru';

      let greeting = `Hello ${user?.full_name || 'Resident'}! I am your real-time CivicConnect AI Assistant for Mysuru Municipal Corporation (MCC). Ask me about live issues in ${area}, tracking repairs, or reporting problems.`;
      if (activeLanguage === 'Kannada') {
        greeting = `ನಮಸ್ಕಾರ ${user?.full_name || 'ನಾಗರಿಕರೇ'}! ನಾನು ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ಮಾರ್ಗದರ್ಶಿ. ${area} ದ ಲೈವ್ ಸಮಸ್ಯೆಗಳು, ದೂರು ಸಲ್ಲಿಕೆ ಅಥವಾ ಕಾಮಗಾರಿ ಪ್ರಗತಿಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಕೇಳಿ.`;
      } else if (activeLanguage === 'Hindi') {
        greeting = `नमस्ते ${user?.full_name || 'नागरिक'}! मैं मैसूर नगर निगम (MCC) सिविककनेक्ट AI गाइड हूँ। ${area} की समस्याओं, रिपोर्ट दर्ज करने या कार्य प्रगति के बारे में पूछें।`;
      }

      setMessages([
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: activeLanguage,
          sources: [{ type: 'system', label: `MCC Mysuru ${roleName} Channel` }]
        }
      ]);
    }
  }, [user, activeLanguage, messages.length]);

  const sendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        message: text,
        conversation_id: conversationId,
        language: activeLanguage
      });

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: response.language,
        sources: response.sources,
        actions: response.actions
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: activeLanguage === 'Kannada'
          ? 'ಕ್ಷಮಿಸಿ, ಲೈವ್ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
          : (activeLanguage === 'Hindi'
            ? 'क्षमा करें, लाइव जानकारी प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।'
            : "I'm unable to access the latest CivicConnect live information right now. Please try again."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [inputValue, loading, conversationId, activeLanguage]);

  const handleActionClick = useCallback((action: ChatAction) => {
    if (action.url) {
      navigate(action.url);
      setIsOpen(false);
    }
  }, [navigate]);

  const clearHistory = useCallback(async () => {
    if (conversationId) {
      try {
        await chatbotService.resetConversation(conversationId);
      } catch (e) {
        // ignore
      }
    }
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setConversationId(newId);
    setMessages([]);
  }, [conversationId]);

  return {
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
    userRole: user?.role || 'citizen',
    userName: user?.full_name || 'Resident',
    userArea: user?.area || 'Gokulam'
  };
}
