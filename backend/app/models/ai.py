from typing import List, Optional
from pydantic import BaseModel, Field

class ComplaintAnalysisRequest(BaseModel):
    original_text: str = Field(..., description="The citizen's raw complaint text in any language")
    language: Optional[str] = Field("English", description="Citizen's stated or detected language")
    area: Optional[str] = Field(None, description="Reported area or locality")
    landmark: Optional[str] = Field(None, description="Reported nearby landmark")
    accident_reported: Optional[bool] = Field(False, description="Whether an accident was reported")
    accident_description: Optional[str] = Field(None, description="Citizen's accident note")
    duration: Optional[str] = Field("not_sure", description="Duration of issue")

class ComplaintAnalysisResponse(BaseModel):
    is_civic_issue: bool = Field(True, description="Whether the text describes a genuine civic/municipal problem (roads, water, garbage, electricity, drainage, parks, safety, etc.)")
    rejection_reason: Optional[str] = Field(None, description="Citizen-friendly explanation if the complaint is not a civic issue")
    category: str = Field(..., description="Extracted civic category (e.g., Road Infrastructure, Water & Sewage, Street Lighting, Waste Management, Public Safety)")
    problem_title: str = Field(..., description="Clear concise title of the civic problem")
    normalized_text: str = Field(..., description="Clear, professional summary of the issue")
    detected_language: str = Field(..., description="Detected input language (e.g. English, Kannada, Hindi)")
    area: str = Field(..., description="Identified or normalized area")
    landmark: Optional[str] = Field(None, description="Extracted landmark")
    safety_concern: bool = Field(..., description="Whether this constitutes an active public safety hazard")
    severity_score: int = Field(..., ge=1, le=5, description="Initial urgency score from 1 (minor) to 5 (critical)")
    suggested_priority: str = Field(..., description="Suggested priority: low, medium, high, critical")
    reported_accidents_count: int = Field(0, description="Count of accidents referenced by citizen")
    estimated_duration: str = Field("not_sure", description="Normalized duration")
    missing_critical_info: List[str] = Field(default_factory=list, description="List of missing details needed for quick resolution (e.g. precise location, pole number)")
    is_fallback: bool = Field(False, description="Whether this analysis used the heuristic fallback engine")

class FollowUpRequest(BaseModel):
    original_text: str
    missing_fields: List[str]
    current_category: Optional[str] = None
    language: Optional[str] = "English"

class FollowUpQuestion(BaseModel):
    field_name: str
    question: str
    hint: Optional[str] = None
    options: Optional[List[str]] = None

class FollowUpResponse(BaseModel):
    questions: List[FollowUpQuestion]

class ResponseSimplificationRequest(BaseModel):
    official_response: str = Field(..., description="Official bureaucratic response from municipal corporation")
    issue_title: Optional[str] = Field(None, description="Title of the issue")
    language: Optional[str] = Field("English", description="Target language for simplified explanation")

class ResponseSimplificationResponse(BaseModel):
    simplified_summary: str = Field(..., description="Clear, citizen-friendly explanation without bureaucratic jargon")
    key_action_points: List[str] = Field(default_factory=list, description="Clear action points on what is happening or will happen")
    estimated_timeframe: Optional[str] = Field(None, description="Extracted timeframe or deadline if mentioned")
    current_status_meaning: str = Field(..., description="What this means for the citizen right now")
    is_fallback: bool = Field(False)

class CivicConsolidationRequest(BaseModel):
    issue_id: Optional[str] = None
    issue_title: str
    category: str
    area: str
    complaint_texts: List[str] = Field(..., description="List of raw or normalized citizen reports to synthesize")
    accidents_count: int = 0
    injuries_count: int = 0
    supporters_count: int = 0

class CivicConsolidationResponse(BaseModel):
    consolidated_title: str
    executive_summary: str
    key_symptoms: List[str]
    safety_risk_summary: Optional[str] = None
    is_fallback: bool = False

class ImageObservationRequest(BaseModel):
    image_url: str
    complaint_text: Optional[str] = None
    category: Optional[str] = None

class ImageObservationResponse(BaseModel):
    observed_category: str
    visual_features: List[str]
    apparent_severity_rating: int = Field(..., ge=1, le=5)
    image_clarity: str = "clear"
    disclaimer: str = "AI-assisted visual observation. AI cannot verify complaint authenticity."
    is_fallback: bool = False

class TranslationRequest(BaseModel):
    text: str
    target_language: str = Field("English", description="Target language: English, Kannada, Hindi")
    source_language: Optional[str] = None

class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    is_fallback: bool = False

