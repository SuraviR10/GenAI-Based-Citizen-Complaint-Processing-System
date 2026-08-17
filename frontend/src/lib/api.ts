import {
  CivicIssue,
  CivicIssueDetail,
  Complaint,
  Notification,
  CitizenDashboardStats,
  ComplaintAnalysisResult,
  SimilaritySearchResult,
  ResponseSimplificationResult,
  UserProfile,
  SystemHealthInfo,
  WorkerProfile,
  WorkerTask,
  WorkerDashboardData,
  CorporationDashboardData,
  CorporationResponseData,
  CorporationAnalyticsData
} from './types';
import { supabase } from './supabase';

const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (rawApiBase && rawApiBase.trim() !== '') 
  ? rawApiBase.trim().replace(/\/$/, '') 
  : (import.meta.env.PROD ? '' : 'http://localhost:8000');

class ApiClient {
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const authHeaders: Record<string, string> = {};

    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${data.session.access_token}`;
      }
      if (data?.session?.user?.id) {
        authHeaders['X-User-Id'] = data.session.user.id;
        authHeaders['X-User-Role'] = data.session.user.user_metadata?.role || 'citizen';
      } else {
        const localProf = localStorage.getItem('civicconnect_auth_profile');
        if (localProf) {
          const parsed = JSON.parse(localProf);
          if (parsed?.id) {
            authHeaders['X-User-Id'] = parsed.id;
            authHeaders['X-User-Role'] = parsed.role || 'citizen';
          }
        }
      }
    } catch (e) {
      // Ignore session retrieval error in offline/preview
    }

    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[CivicConnect API] ${options.method || 'GET'} ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  async checkHealth(): Promise<SystemHealthInfo> {
    return this.request('/health');
  }

  // AI Operations
  async analyzeComplaint(data: {
    original_text: string;
    language?: string;
    area?: string;
    landmark?: string;
    accident_reported?: boolean;
    accident_description?: string;
    duration?: string;
  }): Promise<ComplaintAnalysisResult> {
    return this.request('/api/ai/analyze-complaint', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getFollowUpQuestions(data: {
    original_text: string;
    missing_fields: string[];
    current_category?: string;
    language?: string;
  }): Promise<{ questions: Array<{ field_name: string; question: string; hint?: string; options?: string[] }> }> {
    return this.request('/api/ai/follow-up', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async simplifyResponse(data: {
    official_response: string;
    issue_title?: string;
    language?: string;
  }): Promise<ResponseSimplificationResult> {
    return this.request('/api/ai/simplify-response', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async consolidateSummary(data: {
    issue_id?: string;
    issue_title: string;
    category: string;
    area: string;
    complaint_texts: string[];
    accidents_count?: number;
    injuries_count?: number;
    supporters_count?: number;
  }): Promise<{
    consolidated_title: string;
    executive_summary: string;
    key_symptoms: string[];
    safety_risk_summary?: string;
    is_fallback: boolean;
  }> {
    return this.request('/api/ai/consolidate-summary', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async analyzeImageObservation(data: {
    image_url: string;
    complaint_text?: string;
    category?: string;
  }): Promise<{
    observed_category: string;
    visual_features: string[];
    apparent_severity_rating: number;
    image_clarity: string;
    disclaimer: string;
    is_fallback: boolean;
  }> {
    return this.request('/api/ai/image-observation', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async translateContent(data: {
    text: string;
    target_language: string;
    source_language?: string;
  }): Promise<{
    translated_text: string;
    source_language: string;
    target_language: string;
    is_fallback: boolean;
  }> {
    return this.request('/api/ai/translate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async askCivicAssistant(data: {
    query: string;
    context?: string;
    language?: string;
    role?: string;
    area?: string;
    department?: string;
    user_id?: string;
  }): Promise<{
    answer: string;
    suggested_actions?: string[];
    helpful_links?: string[];
    is_fallback?: boolean;
    language?: string;
  }> {
    return this.request('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Civic Issues
  async listIssues(params: {
    search?: string;
    category?: string;
    area?: string;
    priority?: string;
    status?: string;
    sort?: string;
    citizen_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<CivicIssue[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.area && params.area !== 'all') query.append('area', params.area);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);
    if (params.citizen_id) query.append('citizen_id', params.citizen_id);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());

    return this.request(`/api/issues?${query.toString()}`);
  }

  async getIssueDetail(issueId: string, citizenId?: string): Promise<CivicIssueDetail> {
    const query = citizenId ? `?citizen_id=${encodeURIComponent(citizenId)}` : '';
    return this.request(`/api/issues/${issueId}${query}`);
  }

  async getIssueCorroboration(issueId: string): Promise<any> {
    return this.request(`/api/issues/${issueId}/corroboration`);
  }

  async getIssuePriority(issueId: string): Promise<any> {
    return this.request(`/api/issues/${issueId}/priority`);
  }

  async getIssuePriorityExplanation(issueId: string, language?: string): Promise<any> {
    const query = language ? `?language=${encodeURIComponent(language)}` : '';
    return this.request(`/api/issues/${issueId}/priority-explanation${query}`);
  }

  async generatePriorityExplanation(data: {
    issue_id?: string;
    title: string;
    category: string;
    priority_level: string;
    priority_score: number;
    accidents_count?: number;
    injuries_count?: number;
    support_count?: number;
    complaints_count?: number;
    duration?: string;
    evidence_count?: number;
    language?: string;
  }): Promise<any> {
    return this.request('/api/ai/priority-explanation', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async findSimilarIssues(data: {
    text: string;
    category?: string;
    area?: string;
    landmark?: string;
    threshold?: number;
  }): Promise<SimilaritySearchResult> {
    return this.request('/api/issues/find-similar', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createIssueWithComplaint(data: {
    citizen_id: string;
    original_text: string;
    normalized_text?: string;
    language?: string;
    category: string;
    area: string;
    landmark?: string;
    duration?: string;
    accident_reported?: boolean;
    accident_description?: string;
    latitude?: number;
    longitude?: number;
    priority_score?: number;
    priority_level?: string;
    evidence_urls?: string[];
  }): Promise<{ success: boolean; issue_id: string; complaint_id: string; title: string; status: string; message: string }> {
    return this.request('/api/issues/create-with-complaint', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getIssueTracking(issueId: string): Promise<any> {
    return this.request(`/api/issues/${issueId}/tracking`);
  }

  async toggleIssueSupport(issueId: string, citizenId: string): Promise<{ success: boolean; is_supported: boolean; support_count: number; message: string }> {
    return this.request(`/api/issues/${issueId}/support`, {
      method: 'POST',
      body: JSON.stringify({ citizen_id: citizenId })
    });
  }

  async removeIssueSupport(issueId: string, citizenId: string): Promise<{ success: boolean; is_supported: boolean; support_count: number; message: string }> {
    return this.request(`/api/issues/${issueId}/support?citizen_id=${encodeURIComponent(citizenId)}`, {
      method: 'DELETE'
    });
  }

  async listSupportedIssues(citizenId: string): Promise<CivicIssue[]> {
    return this.request(`/api/issues/supported-by/${encodeURIComponent(citizenId)}`);
  }

  // Complaints
  async linkComplaintToExisting(data: {
    citizen_id: string;
    civic_issue_id: string;
    original_text: string;
    normalized_text?: string;
    language?: string;
    category?: string;
    area: string;
    landmark?: string;
    duration?: string;
    accident_reported?: boolean;
    accident_description?: string;
    auto_support?: boolean;
    evidence_urls?: string[];
  }): Promise<{ success: boolean; complaint_id: string; civic_issue_id: string; message: string }> {
    return this.request('/api/complaints/link-to-existing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listMyComplaints(citizenId: string): Promise<Complaint[]> {
    return this.request(`/api/complaints/my?citizen_id=${encodeURIComponent(citizenId)}`);
  }

  // Dashboard Stats
  async getDashboardStats(citizenId: string, area?: string | null): Promise<CitizenDashboardStats> {
    const query = new URLSearchParams({ citizen_id: citizenId });
    if (area) query.append('area', area);
    return this.request(`/api/stats/dashboard?${query.toString()}`);
  }

  // Notifications
  async listNotifications(userId: string): Promise<Notification[]> {
    return this.request(`/api/notifications?user_id=${encodeURIComponent(userId)}`);
  }

  async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true })
    });
  }

  // Profile
  async getProfile(userId: string): Promise<UserProfile> {
    return this.request(`/api/profile?user_id=${encodeURIComponent(userId)}`);
  }

  async updateProfile(userId: string, data: { full_name?: string; preferred_language?: string; area?: string }): Promise<UserProfile> {
    return this.request(`/api/profile?user_id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ====================================================================
  // CORPORATION MODULE APIS
  // ====================================================================

  async getCorporationDashboard(params?: { department?: string; area?: string }): Promise<CorporationDashboardData> {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'all') query.append('department', params.department);
    if (params?.area && params.area !== 'all') query.append('area', params.area);
    return this.request(`/api/corporation/dashboard?${query.toString()}`);
  }

  async listCorporationIssues(params: {
    search?: string;
    category?: string;
    area?: string;
    priority?: string;
    status?: string;
    department?: string;
    worker_id?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<CivicIssue[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.area && params.area !== 'all') query.append('area', params.area);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.department && params.department !== 'all') query.append('department', params.department);
    if (params.worker_id && params.worker_id !== 'all') query.append('worker_id', params.worker_id);
    if (params.sort) query.append('sort', params.sort);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());

    return this.request(`/api/corporation/issues?${query.toString()}`);
  }

  async getCorporationIssueDetail(issueId: string): Promise<CivicIssueDetail> {
    return this.request(`/api/corporation/issues/${issueId}`);
  }

  async assignWorker(issueId: string, data: {
    worker_id: string;
    assigned_by?: string;
    instructions?: string;
  }): Promise<{ success: boolean; assignment_id: string; worker_name: string; department: string; status: string; message: string }> {
    return this.request(`/api/corporation/issues/${issueId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateIssueStatus(issueId: string, data: {
    status: string;
    actor_id?: string;
    actor_role?: string;
    notes?: string;
  }): Promise<{ success: boolean; issue_id: string; previous_status: string; new_status: string; message: string }> {
    return this.request(`/api/corporation/issues/${issueId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async postCorporationResponse(issueId: string, data: {
    corporation_user_id?: string;
    official_response: string;
    visibility: 'public' | 'internal';
    target_language?: string;
  }): Promise<CorporationResponseData> {
    return this.request(`/api/corporation/issues/${issueId}/responses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listCorporationResponses(issueId: string, includeInternal = true): Promise<CorporationResponseData[]> {
    return this.request(`/api/corporation/issues/${issueId}/responses?include_internal=${includeInternal}`);
  }

  async listWorkers(params?: { department?: string; status?: string; area?: string }): Promise<WorkerProfile[]> {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'all') query.append('department', params.department);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.area && params.area !== 'all') query.append('area', params.area);
    return this.request(`/api/corporation/workers?${query.toString()}`);
  }

  async getWorkerDetail(workerId: string): Promise<WorkerProfile> {
    return this.request(`/api/corporation/workers/${workerId}`);
  }

  async getCorporationAnalytics(): Promise<CorporationAnalyticsData> {
    return this.request('/api/corporation/analytics');
  }

  // ====================================================================
  // WORKER MODULE APIS
  // ====================================================================

  async getWorkerDashboard(workerId: string): Promise<WorkerDashboardData> {
    return this.request(`/api/worker/dashboard?worker_id=${encodeURIComponent(workerId)}`);
  }

  async listWorkerTasks(workerId: string, status?: string): Promise<WorkerTask[]> {
    const query = new URLSearchParams({ worker_id: workerId });
    if (status && status !== 'all') query.append('status', status);
    return this.request(`/api/worker/tasks?${query.toString()}`);
  }

  async getWorkerTaskDetail(taskId: string, workerId?: string): Promise<WorkerTask> {
    const query = workerId ? `?worker_id=${encodeURIComponent(workerId)}` : '';
    return this.request(`/api/worker/tasks/${taskId}${query}`);
  }

  async startInspection(taskId: string, data: {
    worker_id: string;
    notes: string;
    evidence_url?: string;
  }): Promise<{ success: boolean; status: string; message: string }> {
    return this.request(`/api/worker/tasks/${taskId}/inspection`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async submitProgressUpdate(taskId: string, data: {
    worker_id: string;
    description: string;
    update_type?: string;
    evidence_url?: string;
  }): Promise<{ success: boolean; status: string; message: string }> {
    return this.request(`/api/worker/tasks/${taskId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async markTaskComplete(taskId: string, data: {
    worker_id: string;
    completion_notes: string;
    evidence_url?: string;
  }): Promise<{ success: boolean; status: string; message: string }> {
    return this.request(`/api/worker/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async uploadWorkerEvidence(taskId: string, data: {
    worker_id: string;
    storage_path: string;
    description?: string;
    file_type?: string;
    stage?: string;
  }): Promise<{ success: boolean; evidence_id: string; storage_path: string; message: string }> {
    return this.request(`/api/worker/tasks/${taskId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiClient();

