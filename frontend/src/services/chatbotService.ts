/**
 * CivicConnect AI — Frontend Chatbot Service
 * Typed client for interacting with the backend GenAI chatbot API (/api/chat).
 */

import { api } from '../lib/api';

export interface ChatAction {
  type: 'navigate' | 'action';
  label: string;
  url?: string;
  action_id?: string;
}

export interface ChatSource {
  type: string;
  label: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  language?: string;
  context?: string;
}

export interface ChatResponse {
  message: string;
  language: string;
  sources: ChatSource[];
  actions: ChatAction[];
  conversation_id: string;
}

export class ChatbotApiService {
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return api.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async resetConversation(conversation_id: string): Promise<void> {
    await api.request('/api/chat/reset', {
      method: 'POST',
      body: JSON.stringify({ conversation_id })
    });
  }
}

export const chatbotService = new ChatbotApiService();
