from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ComplaintLinkRequest(BaseModel):
    citizen_id: str
    civic_issue_id: str
    original_text: str
    normalized_text: Optional[str] = None
    language: Optional[str] = "English"
    category: Optional[str] = None
    area: str
    landmark: Optional[str] = None
    duration: Optional[str] = "not_sure"
    accident_reported: Optional[bool] = False
    accident_description: Optional[str] = None
    auto_support: Optional[bool] = True
    evidence_urls: Optional[list] = []

class ComplaintResponse(BaseModel):
    id: str
    citizen_id: str
    civic_issue_id: Optional[str] = None
    original_text: str
    normalized_text: Optional[str] = None
    language: str
    category: Optional[str] = None
    area: str
    landmark: Optional[str] = None
    duration: str
    accident_reported: bool
    accident_description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    issue_title: Optional[str] = None
    issue_status: Optional[str] = None
    issue_priority: Optional[str] = None
