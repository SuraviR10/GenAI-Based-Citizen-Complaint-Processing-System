"""
CivicConnect AI — Community Corroboration Engine
Computes objective community corroboration metrics from independent
citizen reports, supporters, uploaded evidence, and collision reports.
"""

from enum import Enum
from typing import List, Any, Optional
from pydantic import BaseModel, Field

class CorroborationLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    STRONG = "strong"

class CorroborationIndicator(BaseModel):
    signal: str
    value: Any
    description: str

class CorroborationInput(BaseModel):
    independent_complaints_count: int = Field(1, ge=1)
    community_supporters_count: int = Field(0, ge=0)
    evidence_media_count: int = Field(0, ge=0)
    citizen_reported_accidents_count: int = Field(0, ge=0)
    reported_injuries_count: int = Field(0, ge=0)
    location_consistency: str = "High"

class CorroborationResult(BaseModel):
    issue_id: Optional[str] = None
    corroboration_level: CorroborationLevel
    corroboration_label: str
    corroboration_score: float = Field(..., ge=0.0, le=100.0)
    independent_complaints_count: int
    community_supporters_count: int
    evidence_media_count: int
    citizen_reported_accidents_count: int
    reported_injuries_count: int
    location_consistency: str
    indicators: List[CorroborationIndicator]
    disclaimer: str = "Based on independent citizen-reported community signals (not independently verified by municipal staff)."

class CorroborationEngine:
    """
    Evaluates community corroboration strength.
    Never claims an issue is 'AI verified genuine'.
    Calculates transparent corroboration level from citizen data.
    """

    @classmethod
    def calculate(cls, data: CorroborationInput, issue_id: Optional[str] = None) -> CorroborationResult:
        # 1. Independent Complaints Factor (Max 30 pts)
        cmp_pts = min(30.0, data.independent_complaints_count * 10.0)

        # 2. Community Support Factor (Max 25 pts)
        sup = data.community_supporters_count
        if sup <= 1:
            sup_pts = 3.0
        elif sup <= 5:
            sup_pts = 8.0
        elif sup <= 15:
            sup_pts = 15.0
        elif sup <= 40:
            sup_pts = 20.0
        else:
            sup_pts = 25.0

        # 3. Evidence Media Factor (Max 20 pts)
        evi = data.evidence_media_count
        if evi == 0:
            evi_pts = 0.0
        elif evi == 1:
            evi_pts = 10.0
        elif evi == 2:
            evi_pts = 16.0
        else:
            evi_pts = 20.0

        # 4. Accident / Safety Reports Factor (Max 15 pts)
        acc_pts = min(15.0, (data.citizen_reported_accidents_count * 7.5) + (data.reported_injuries_count * 5.0))

        # 5. Location Consistency Factor (Max 10 pts)
        loc_clean = data.location_consistency.lower()
        if "high" in loc_clean:
            loc_pts = 10.0
        elif "med" in loc_clean:
            loc_pts = 6.0
        else:
            loc_pts = 3.0

        total_score = round(min(100.0, cmp_pts + sup_pts + evi_pts + acc_pts + loc_pts), 1)

        # Determine level & human label
        if total_score >= 80 or (data.independent_complaints_count >= 3 and sup >= 30):
            level = CorroborationLevel.STRONG
            label = "Strong Community Corroboration"
        elif total_score >= 55 or data.independent_complaints_count >= 2 or sup >= 10:
            level = CorroborationLevel.HIGH
            label = "High Community Corroboration"
        elif total_score >= 30 or sup >= 2 or evi >= 1:
            level = CorroborationLevel.MODERATE
            label = "Moderate Community Corroboration"
        else:
            level = CorroborationLevel.LOW
            label = "Initial Citizen Report"

        # Build indicators
        indicators = [
            CorroborationIndicator(
                signal="Independent Reports",
                value=data.independent_complaints_count,
                description=f"{data.independent_complaints_count} separate citizen complaint(s) submitted"
            ),
            CorroborationIndicator(
                signal="Community Backing",
                value=data.community_supporters_count,
                description=f"{data.community_supporters_count} neighborhood residents endorsed this problem"
            ),
            CorroborationIndicator(
                signal="Photographic Evidence",
                value=data.evidence_media_count,
                description=f"{data.evidence_media_count} photo(s) uploaded by citizens"
            ),
            CorroborationIndicator(
                signal="Location Consistency",
                value=data.location_consistency,
                description=f"{data.location_consistency} geographic agreement across reports"
            )
        ]

        if data.citizen_reported_accidents_count > 0:
            indicators.append(CorroborationIndicator(
                signal="Reported Accidents",
                value=data.citizen_reported_accidents_count,
                description=f"{data.citizen_reported_accidents_count} accident(s) reported by local residents"
            ))

        return CorroborationResult(
            issue_id=issue_id,
            corroboration_level=level,
            corroboration_label=label,
            corroboration_score=total_score,
            independent_complaints_count=data.independent_complaints_count,
            community_supporters_count=data.community_supporters_count,
            evidence_media_count=data.evidence_media_count,
            citizen_reported_accidents_count=data.citizen_reported_accidents_count,
            reported_injuries_count=data.reported_injuries_count,
            location_consistency=data.location_consistency,
            indicators=indicators
        )

corroboration_engine = CorroborationEngine()
