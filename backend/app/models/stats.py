from typing import List, Optional
from pydantic import BaseModel

class CitizenDashboardStats(BaseModel):
    my_reports_count: int = 0
    supported_issues_count: int = 0
    in_progress_count: int = 0
    resolved_count: int = 0
    nearby_issues_count: int = 0
    user_area: Optional[str] = None
