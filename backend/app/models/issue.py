from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# ====================================================================
# 1. ENUMS & CONSTANTS
# ====================================================================

class CivicCategory(str, Enum):
    ROADS = "Roads & Footpaths"
    GARBAGE = "Garbage & Sanitation"
    DRAINAGE = "Water & Sewage"
    STREETLIGHTS = "Street Lighting"
    WATER_SUPPLY = "Water Supply & Tankers"
    TRAFFIC = "Traffic & Parking"
    PUBLIC_SAFETY = "Public Safety & Hazards"
    PARKS = "Parks & Environment"
    ELECTRICITY = "Electricity & Power"
    OTHER = "Other Civic Issue"

    @classmethod
    def from_str(cls, value: Optional[str]) -> "CivicCategory":
        if not value:
            return cls.OTHER
        v = value.strip().lower()
        if "road" in v or "pothole" in v or "footpath" in v:
            return cls.ROADS
        if "garb" in v or "trash" in v or "sanit" in v or "waste" in v:
            return cls.GARBAGE
        if "sewage" in v or "drain" in v or "gutter" in v:
            return cls.DRAINAGE
        if "light" in v or "lamp" in v or "dark" in v:
            return cls.STREETLIGHTS
        if "water" in v or "tanker" in v:
            return cls.WATER_SUPPLY
        if "traffic" in v or "signal" in v:
            return cls.TRAFFIC
        if "safe" in v or "hazard" in v or "danger" in v or "fire" in v:
            return cls.PUBLIC_SAFETY
        if "park" in v or "tree" in v or "garden" in v:
            return cls.PARKS
        if "electr" in v or "wire" in v or "power" in v:
            return cls.ELECTRICITY
        return cls.OTHER

class IssueStatus(str, Enum):
    REPORTED = "reported"
    REVIEWED = "reviewed"
    UNDER_REVIEW = "reviewed"
    ASSIGNED = "assigned"
    WORKER_ASSIGNED = "assigned"
    INSPECTION = "inspection"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    RESOLVED = "completed"
    REJECTED = "rejected"

class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CorroborationLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


# ====================================================================
# 2. CIVIC ISSUE MODELS
# ====================================================================

class CivicIssueBase(BaseModel):
    title: str = Field(..., description="Objective, concise title of civic problem")
    description: str = Field(..., description="Detailed description of civic issue")
    category: str = Field("Roads & Footpaths", description="Civic category")
    area: str = Field(..., description="Locality / Ward name")
    landmark: Optional[str] = Field(None, description="Nearby prominent landmark")
    latitude: Optional[float] = Field(None, description="Latitude GPS coordinate")
    longitude: Optional[float] = Field(None, description="Longitude GPS coordinate")
    priority_score: int = Field(1, ge=0, le=100, description="Priority score from 0 to 100")
    priority_level: PriorityLevel = Field(PriorityLevel.MEDIUM, description="low, medium, high, critical")
    status: IssueStatus = Field(IssueStatus.REPORTED, description="reported, reviewed, assigned, in_progress, completed, rejected")

class CivicIssueCreate(CivicIssueBase):
    pass

class CivicIssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    area: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority_score: Optional[int] = Field(None, ge=0, le=100)
    priority_level: Optional[PriorityLevel] = None
    status: Optional[IssueStatus] = None

class CivicIssueResponse(CivicIssueBase):
    id: str
    created_at: datetime
    updated_at: datetime
    support_count: int = 0
    complaints_count: int = 0
    has_user_supported: bool = False
    evidence_count: int = 0
    latest_update: Optional[str] = None
    official_response: Optional[str] = None
    simplified_response: Optional[str] = None
    corroboration_level: Optional[str] = "low"
    accident_reports_count: Optional[int] = 0
    injuries_count: Optional[int] = 0
    assigned_worker: Optional[dict] = None

class CivicIssueDetailResponse(CivicIssueResponse):
    updates: List[dict] = Field(default_factory=list)
    evidence: List[dict] = Field(default_factory=list)
    responses: List[dict] = Field(default_factory=list)
    accident_reports: List[dict] = Field(default_factory=list)
    complaints_summary: Optional[dict] = None
    corroboration_details: Optional[dict] = None
    priority_details: Optional[dict] = None


# ====================================================================
# 3. COMMUNITY SUPPORT MODELS
# ====================================================================

class SupportToggleRequest(BaseModel):
    citizen_id: str

class SupportToggleResponse(BaseModel):
    success: bool
    is_supported: bool
    support_count: int
    message: str

class SupportCountResponse(BaseModel):
    issue_id: str
    support_count: int
    is_supported: bool = False


# ====================================================================
# 4. SIMILARITY & CONSOLIDATION MODELS
# ====================================================================

class SimilaritySearchRequest(BaseModel):
    text: str = Field(..., description="Complaint or problem text to compare")
    category: Optional[str] = Field(None, description="Civic category")
    area: Optional[str] = Field(None, description="Locality / area name")
    landmark: Optional[str] = Field(None, description="Nearby landmark")
    threshold: Optional[float] = Field(0.40, description="Similarity threshold (0.0 to 1.0)")

class SimilarIssueMatch(BaseModel):
    id: str
    title: str
    description: str
    category: str
    area: str
    landmark: Optional[str] = None
    status: str
    priority_level: str
    support_count: int = 0
    complaint_count: int = 0
    latest_update: Optional[str] = None
    created_at: datetime
    similarity_score: float = Field(..., description="Cosine / location hybrid score between 0.0 and 1.0")
    location_match: bool = Field(True, description="Whether the area/neighborhood matches")
    recommendation: str = Field("possible_match", description="'strong_match', 'possible_match', or 'low_match'")
    match_reasons: List[str] = Field(default_factory=list, description="Plain English reasons for recommendation")

class SimilaritySearchResponse(BaseModel):
    found_matches: bool
    matched_issues: List[SimilarIssueMatch]
    suggested_action: str = Field("create_new", description="'link_existing' or 'create_new'")

class CreateIssueWithComplaintRequest(BaseModel):
    citizen_id: str
    original_text: str
    normalized_text: Optional[str] = None
    language: Optional[str] = "English"
    category: str
    area: str
    landmark: Optional[str] = None
    duration: Optional[str] = "not_sure"
    accident_reported: Optional[bool] = False
    accident_description: Optional[str] = None
    injuries_count: Optional[int] = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority_score: Optional[int] = 2
    priority_level: Optional[str] = "medium"
    evidence_urls: Optional[List[str]] = Field(default_factory=list)

class CreateIssueResponse(BaseModel):
    success: bool
    issue_id: str
    complaint_id: str
    title: str
    status: str
    message: str


# ====================================================================
# 5. EVIDENCE & ACCIDENT MODELS
# ====================================================================

class AccidentReportCreate(BaseModel):
    citizen_id: str
    civic_issue_id: str
    complaint_id: Optional[str] = None
    description: str
    injuries: int = Field(0, ge=0, description="Citizen-reported injuries count")
    severity: str = Field("minor", description="minor, moderate, severe")

class AccidentReportResponse(BaseModel):
    id: str
    civic_issue_id: str
    complaint_id: Optional[str] = None
    user_id: Optional[str] = None
    description: str
    injuries: int
    severity: str
    created_at: datetime
    disclaimer: str = "Citizen-reported information (not independently verified)"


# ====================================================================
# 6. CORROBORATION & PRIORITY MODELS
# ====================================================================

class CorroborationIndicator(BaseModel):
    signal: str
    value: Any
    description: str

class CorroborationResponse(BaseModel):
    issue_id: str
    corroboration_level: CorroborationLevel
    corroboration_score: float = Field(..., ge=0.0, le=100.0)
    independent_complaints_count: int
    community_supporters_count: int
    evidence_media_count: int
    citizen_reported_accidents_count: int
    reported_injuries_count: int
    location_consistency: str
    indicators: List[CorroborationIndicator]
    disclaimer: str = "Based on independent citizen-reported community signals."

class PriorityFactors(BaseModel):
    severity_score: float = Field(..., description="Baseline severity contribution (0-25)")
    accidents_score: float = Field(..., description="Accident reports contribution (0-20)")
    injuries_score: float = Field(..., description="Injuries contribution (0-15)")
    community_support_score: float = Field(..., description="Community support contribution (0-15)")
    duration_score: float = Field(..., description="Duration contribution (0-10)")
    evidence_score: float = Field(..., description="Evidence media contribution (0-10)")
    category_risk_score: float = Field(..., description="Category baseline risk contribution (0-5)")
    total_score: int = Field(..., ge=0, le=100)

class PriorityCalculationResponse(BaseModel):
    issue_id: str
    priority_level: PriorityLevel
    priority_score: int = Field(..., ge=0, le=100)
    factors: PriorityFactors
    calculated_at: datetime
    explanation_summary: Optional[str] = None

class PriorityExplanationRequest(BaseModel):
    issue_id: str
    target_language: Optional[str] = "English"

class PriorityExplanationResponse(BaseModel):
    issue_id: str
    priority_level: PriorityLevel
    priority_score: int
    explanation: str
    key_factors_summary: List[str]
    is_fallback: bool = False
    disclaimer: str = "AI-generated explanation based on structured citizen reports and system calculations."


# ====================================================================
# 7. WORKER & ASSIGNMENT MODELS
# ====================================================================

class WorkerStatus(str, Enum):
    AVAILABLE = "available"
    ASSIGNED = "assigned"
    ON_SITE = "on_site"
    BUSY = "busy"
    INACTIVE = "inactive"

class WorkerProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str = "worker"
    department: str
    phone: Optional[str] = None
    area: Optional[str] = None
    worker_status: str = "available"
    active_tasks_count: int = 0
    completed_tasks_count: int = 0

class WorkerAssignmentRequest(BaseModel):
    worker_id: str
    assigned_by: Optional[str] = None
    instructions: Optional[str] = None
    priority_directive: Optional[str] = "Standard Dispatch"
    target_deadline: Optional[str] = None
    equipment_required: Optional[List[str]] = Field(default_factory=list)

class WorkerAssignmentResponse(BaseModel):
    success: bool
    assignment_id: str
    issue_id: str
    worker_id: str
    worker_name: str
    department: str
    status: str
    assigned_at: datetime
    message: str

class WorkerInspectionRequest(BaseModel):
    worker_id: str
    notes: str = Field(..., description="Inspection findings and site assessment")
    evidence_url: Optional[str] = None

class WorkerProgressUpdateRequest(BaseModel):
    worker_id: str
    description: str = Field(..., description="Details on repair or progress executed on site")
    update_type: Optional[str] = Field("progress", description="inspection, progress, obstacle, repair_start, completed")
    evidence_url: Optional[str] = None

class WorkerTaskCompleteRequest(BaseModel):
    worker_id: str
    completion_notes: str = Field(..., description="Summary of resolution and completed work")
    evidence_url: Optional[str] = None

class WorkerEvidenceUploadRequest(BaseModel):
    worker_id: str
    storage_path: str
    description: Optional[str] = None
    file_type: str = "image/jpeg"
    stage: str = "during_repair" # before_repair, during_repair, after_repair

class WorkerTaskResponse(BaseModel):
    id: str
    issue_id: str
    title: str
    description: str
    category: str
    area: str
    landmark: Optional[str] = None
    priority_level: PriorityLevel
    priority_score: int
    status: IssueStatus
    assigned_at: datetime
    instructions: Optional[str] = None
    priority_directive: Optional[str] = "Standard Dispatch"
    target_deadline: Optional[str] = None
    equipment_required: List[str] = Field(default_factory=list)
    assigned_by: Optional[str] = None
    assigned_by_name: Optional[str] = None
    required_action: str
    citizen_photos: List[str] = Field(default_factory=list)
    worker_photos: List[str] = Field(default_factory=list)
    recent_updates: List[dict] = Field(default_factory=list)
    accident_reported: bool = False
    accident_description: Optional[str] = None
    created_at: datetime

class WorkerDashboardStats(BaseModel):
    worker_name: str
    department: str
    assigned_count: int = 0
    pending_inspection_count: int = 0
    in_progress_count: int = 0
    completed_count: int = 0
    active_tasks: List[WorkerTaskResponse] = Field(default_factory=list)


# ====================================================================
# 8. CORPORATION DASHBOARD & MANAGEMENT MODELS
# ====================================================================

class DepartmentWorkloadItem(BaseModel):
    department: str
    active_issues: int
    critical_issues: int
    in_progress: int
    resolved: int
    total_workers: int
    available_workers: int

class WorkerWorkloadItem(BaseModel):
    id: str
    name: str
    department: str
    area: Optional[str] = None
    status: str
    assigned_tasks: int
    active_tasks: int
    completed_tasks: int

class CorporationDashboardStatsResponse(BaseModel):
    total_active_issues: int
    critical_issues: int
    high_priority_issues: int
    in_progress_issues: int
    resolved_issues: int
    total_unresolved: int
    department_workloads: List[DepartmentWorkloadItem] = Field(default_factory=list)
    worker_workloads: List[WorkerWorkloadItem] = Field(default_factory=list)

class CorporationResponseCreateRequest(BaseModel):
    corporation_user_id: Optional[str] = None
    official_response: str = Field(..., min_length=5, description="Formal municipal notice/statement")
    visibility: str = Field("public", description="'public' or 'internal'")
    target_language: Optional[str] = "English"

class CorporationResponseItem(BaseModel):
    id: str
    issue_id: str
    corporation_user_id: Optional[str] = None
    official_response: str
    simplified_response: Optional[str] = None
    visibility: str = "public"
    created_at: datetime

class StatusTransitionRequest(BaseModel):
    status: IssueStatus
    actor_id: Optional[str] = None
    actor_role: str = "corporation"
    notes: Optional[str] = None

class CorporationAnalyticsResponse(BaseModel):
    by_priority: Dict[str, int]
    by_category: Dict[str, int]
    by_area: Dict[str, int]
    by_status: Dict[str, int]
    avg_resolution_hours: float
    total_resolved: int
    total_reported: int
    worker_utilization_pct: float

