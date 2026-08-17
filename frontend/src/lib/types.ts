// ====================================================================
// CIVICCONNECT AI - CORE TYPES & INTERFACES
// ====================================================================

export type UserRole = 'citizen' | 'worker' | 'corporation';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'reported' | 'reviewed' | 'assigned' | 'inspection' | 'in_progress' | 'completed' | 'rejected';
export type DurationOption = 'less_than_month' | '1_to_6_months' | 'more_than_6_months' | 'not_sure';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  preferred_language: string;
  area: string | null;
  department?: string | null;
  phone?: string | null;
  worker_status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  priority_score: number;
  priority_level: PriorityLevel;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
  support_count: number;
  complaints_count: number;
  has_user_supported?: boolean;
  evidence_count?: number;
  latest_update?: string | null;
  official_response?: string | null;
  simplified_response?: string | null;
}

export interface IssueUpdateItem {
  id: string;
  issue_id: string;
  updated_by?: string | null;
  status: IssueStatus;
  description: string;
  update_type?: string | null;
  evidence_url?: string | null;
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  issue_id: string;
  complaint_id?: string | null;
  uploaded_by: string;
  storage_path: string;
  file_type: string;
  description?: string | null;
  created_at: string;
}

export interface OfficialResponseItem {
  id: string;
  issue_id: string;
  corporation_user_id?: string | null;
  official_response: string;
  simplified_response?: string | null;
  visibility?: 'public' | 'internal';
  created_at: string;
}

export interface CorroborationIndicator {
  signal: string;
  value: any;
  description: string;
}

export interface CorroborationResult {
  issue_id?: string;
  corroboration_level: 'low' | 'moderate' | 'high' | 'strong';
  corroboration_label: string;
  corroboration_score: number;
  independent_complaints_count: number;
  community_supporters_count: number;
  evidence_media_count: number;
  citizen_reported_accidents_count: number;
  reported_injuries_count: number;
  location_consistency: string;
  indicators: CorroborationIndicator[];
  disclaimer: string;
}

export interface PriorityFactors {
  severity_score: number;
  accidents_score: number;
  injuries_score: number;
  community_support_score: number;
  duration_score: number;
  evidence_score: number;
  category_risk_score: number;
  total_score: number;
}

export interface PriorityCalculationResult {
  issue_id?: string;
  priority_level: PriorityLevel;
  priority_score: number;
  factors: PriorityFactors;
  calculated_at: string;
  explanation_summary: string;
}

export interface PriorityExplanationResult {
  issue_id: string;
  priority_level: PriorityLevel;
  priority_score: number;
  explanation: string;
  key_factors_summary: string[];
  is_fallback: boolean;
  disclaimer: string;
}

export interface CivicIssueDetail extends CivicIssue {
  updates: IssueUpdateItem[];
  evidence: EvidenceItem[];
  responses: OfficialResponseItem[];
  similar_issues?: CivicIssue[];
  corroboration_level?: 'low' | 'moderate' | 'high' | 'strong';
  accident_reports_count?: number;
  injuries_count?: number;
  complaints_summary?: {
    total_complaints: number;
    citizen_reported_accidents: number;
    citizen_reported_injuries?: number;
    assignment?: {
      assignment_id: string;
      worker_id: string;
      worker_name: string;
      department: string;
      phone?: string | null;
      status: string;
      instructions?: string | null;
      assigned_at: string;
    };
  };
  corroboration_details?: CorroborationResult;
  priority_details?: PriorityCalculationResult;
}

export interface Complaint {
  id: string;
  citizen_id: string;
  civic_issue_id: string | null;
  original_text: string;
  normalized_text?: string | null;
  language: string;
  category?: string | null;
  area: string;
  landmark?: string | null;
  duration?: DurationOption | string;
  accident_reported: boolean;
  accident_description?: string | null;
  injuries_count?: number;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
  issue?: CivicIssue | null;
}

export interface Notification {
  id: string;
  user_id: string;
  issue_id?: string | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CitizenDashboardStats {
  my_reports_count: number;
  supported_issues_count: number;
  in_progress_count: number;
  resolved_count: number;
  nearby_issues_count: number;
  user_area?: string | null;
}

export interface ComplaintAnalysisResult {
  is_civic_issue?: boolean;
  rejection_reason?: string | null;
  category: string;
  problem_title: string;
  normalized_text: string;
  detected_language: string;
  area: string;
  landmark: string | null;
  safety_concern: boolean;
  severity_score: number;
  suggested_priority: PriorityLevel | string;
  reported_accidents_count: number;
  estimated_duration: string;
  missing_critical_info: string[];
  is_fallback: boolean;
}

export interface SimilarIssueMatch {
  id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  landmark?: string | null;
  status: IssueStatus;
  priority_level: PriorityLevel;
  support_count: number;
  complaint_count: number;
  latest_update?: string | null;
  created_at: string;
  similarity_score: number;
  location_match?: boolean;
  recommendation?: 'strong_match' | 'possible_match' | 'low_match';
  match_reasons: string[];
}

export interface SimilaritySearchResult {
  found_matches: boolean;
  matched_issues: SimilarIssueMatch[];
  suggested_action: 'link_existing' | 'create_new';
}

export interface ResponseSimplificationResult {
  simplified_summary: string;
  key_action_points: string[];
  estimated_timeframe?: string | null;
  current_status_meaning: string;
  is_fallback: boolean;
}

export interface SystemHealthInfo {
  status: string;
  mode?: 'supabase_live' | 'local_preview';
  supabase: string;
  supabase_details?: {
    status: string;
    message: string;
    url?: string;
  };
  groq: string;
}

// ====================================================================
// WORKER & CORPORATION TYPES
// ====================================================================

export interface WorkerProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'worker';
  department: string;
  phone?: string | null;
  area?: string | null;
  worker_status: 'available' | 'assigned' | 'on_site' | 'busy' | 'inactive';
  active_tasks_count: number;
  completed_tasks_count: number;
}

export interface WorkerTask {
  id: string;
  issue_id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  landmark?: string | null;
  priority_level: PriorityLevel;
  priority_score: number;
  status: IssueStatus;
  assigned_at: string;
  instructions?: string | null;
  required_action: string;
  citizen_photos: string[];
  worker_photos: string[];
  recent_updates: IssueUpdateItem[];
  accident_reported: boolean;
  accident_description?: string | null;
  created_at: string;
}

export interface WorkerDashboardData {
  worker_name: string;
  department: string;
  assigned_count: number;
  pending_inspection_count: number;
  in_progress_count: number;
  completed_count: number;
  active_tasks: WorkerTask[];
}

export interface DepartmentWorkload {
  department: string;
  active_issues: number;
  critical_issues: number;
  in_progress: number;
  resolved: number;
  total_workers: number;
  available_workers: number;
}

export interface WorkerWorkload {
  id: string;
  name: string;
  department: string;
  area?: string | null;
  status: string;
  assigned_tasks: number;
  active_tasks: number;
  completed_tasks: number;
}

export interface CorporationDashboardData {
  total_active_issues: number;
  critical_issues: number;
  high_priority_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  total_unresolved: number;
  department_workloads: DepartmentWorkload[];
  worker_workloads: WorkerWorkload[];
}

export interface CorporationResponseData {
  id: string;
  issue_id: string;
  corporation_user_id?: string | null;
  official_response: string;
  simplified_response?: string | null;
  visibility: 'public' | 'internal';
  created_at: string;
}

export interface CorporationAnalyticsData {
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
  by_area: Record<string, number>;
  by_status: Record<string, number>;
  avg_resolution_hours: number;
  total_resolved: number;
  total_reported: number;
  worker_utilization_pct: number;
}

export const MYSORE_AREAS = [
  'Vijayanagar',
  'Gokulam',
  'Jayalakshmipuram',
  'Kuvempunagar',
  'Saraswathipuram',
  'Hebbal',
  'TK Layout',
  'Vontikoppal (VV Mohalla)',
  'Nazarbad',
  'Chamundipuram',
  'JP Nagar (Mysore)',
  'Dattagalli',
  'Lashkar Mohalla',
  'Yadavagiri',
  'Srirampura',
  'Bannimantap',
  'Alanahalli',
  'Metagalli',
  'Ramakrishnanagar',
  'Ashokapuram',
  'Siddhartha Layout',
  'Devaraja Mohalla',
  'Agrahara',
  'KRS Road',
  'Mandi Mohalla',
  'Bogadi',
  'Roopa Nagar',
  'Vidyaranyapuram',
  'Hootagalli',
  'Ilavala',
  'Udayagiri',
  'Shivarampet',
  'Ittigegudu',
  'Siddarthanagar'
] as const;

export const CIVIC_DEPARTMENTS = [
  'Road Maintenance & Pavements',
  'Water Supply & Drainage',
  'Solid Waste Management',
  'Street Lighting & Electrical',
  'Public Safety & Hazards',
  'Parks & Horticulture',
  'Traffic & Signage'
] as const;


