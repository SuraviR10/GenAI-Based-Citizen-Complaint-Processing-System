"""
CivicConnect AI — Deterministic Priority Calculation Engine
Calculates objective, deterministic civic urgency scores (0–100)
and assigns standardized priority levels (LOW, MEDIUM, HIGH, CRITICAL).
"""

from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PriorityFactors(BaseModel):
    severity_score: float = Field(..., description="Baseline severity contribution (0-25)")
    accidents_score: float = Field(..., description="Accident reports contribution (0-20)")
    injuries_score: float = Field(..., description="Injuries contribution (0-15)")
    community_support_score: float = Field(..., description="Community support contribution (0-15)")
    duration_score: float = Field(..., description="Duration contribution (0-10)")
    evidence_score: float = Field(..., description="Evidence media contribution (0-10)")
    category_risk_score: float = Field(..., description="Category baseline risk contribution (0-5)")
    total_score: int = Field(..., ge=0, le=100, description="Total computed score from 0 to 100")

class PriorityInput(BaseModel):
    category: str
    severity_rating: int = Field(2, ge=1, le=5, description="Initial AI or citizen severity (1-5)")
    safety_concern: bool = False
    accident_count: int = Field(0, ge=0)
    injuries_count: int = Field(0, ge=0)
    support_count: int = Field(0, ge=0)
    complaints_count: int = Field(1, ge=1)
    evidence_count: int = Field(0, ge=0)
    duration: str = "not_sure"

class PriorityCalculationResult(BaseModel):
    issue_id: Optional[str] = None
    priority_level: PriorityLevel
    priority_score: int = Field(..., ge=0, le=100)
    factors: PriorityFactors
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    explanation_summary: str

class PriorityEngine:
    """
    Deterministic Civic Priority Engine.
    Priority is NEVER decided arbitrarily by an LLM.
    Uses structured municipal weight matrices to ensure fair, transparent, and reproducible triage.
    """

    CATEGORY_RISK_WEIGHTS: Dict[str, float] = {
        "Public Safety & Hazards": 5.0,
        "Electricity & Power": 5.0,
        "Water & Sewage": 4.5,
        "Roads & Footpaths": 4.0,
        "Water Supply & Tankers": 3.5,
        "Street Lighting": 3.5,
        "Traffic & Parking": 3.0,
        "Garbage & Sanitation": 3.0,
        "Parks & Environment": 2.0,
        "Other Civic Issue": 2.0
    }

    DURATION_WEIGHTS: Dict[str, float] = {
        "more_than_6_months": 10.0,
        "1_to_6_months": 6.5,
        "less_than_month": 3.0,
        "not_sure": 3.5
    }

    @classmethod
    def calculate_score(cls, data: PriorityInput, issue_id: Optional[str] = None) -> PriorityCalculationResult:
        # 1. Base Severity Contribution (Max 25 pts)
        # Severity rating is 1..5. If safety_concern is True, boost minimum severity
        effective_severity = max(data.severity_rating, 4 if data.safety_concern else 1)
        severity_score = min(25.0, (effective_severity / 5.0) * 25.0)

        # 2. Accident Reports Contribution (Max 20 pts)
        # Each reported accident adds 10 pts, up to 20 pts max
        accidents_score = min(20.0, float(data.accident_count) * 10.0)

        # 3. Injuries / Health Consequence Contribution (Max 15 pts)
        # Each injury adds 7.5 pts, up to 15 pts max
        injuries_score = min(15.0, float(data.injuries_count) * 7.5)

        # 4. Community Support Volume Contribution (Max 15 pts)
        # Stepped logarithmic curve based on supporter volume
        sup = data.support_count
        if sup <= 0:
            support_score = 0.0
        elif sup <= 2:
            support_score = 3.0
        elif sup <= 5:
            support_score = 6.0
        elif sup <= 15:
            support_score = 9.0
        elif sup <= 35:
            support_score = 12.0
        elif sup <= 70:
            support_score = 14.0
        else:
            support_score = 15.0

        # Multi-complaint boost (independent reports)
        if data.complaints_count > 1:
            support_score = min(15.0, support_score + min(3.0, (data.complaints_count - 1) * 0.75))

        # 5. Duration Contribution (Max 10 pts)
        duration_clean = data.duration.strip().lower() if data.duration else "not_sure"
        duration_score = cls.DURATION_WEIGHTS.get(duration_clean, 3.5)

        # 6. Evidence Photos Contribution (Max 10 pts)
        # Having photo evidence corroborates the issue
        evi_count = data.evidence_count
        if evi_count == 0:
            evidence_score = 1.0
        elif evi_count == 1:
            evidence_score = 5.0
        elif evi_count == 2:
            evidence_score = 8.0
        else:
            evidence_score = 10.0

        # 7. Category Risk Contribution (Max 5 pts)
        cat_clean = data.category.strip()
        category_risk_score = cls.CATEGORY_RISK_WEIGHTS.get(cat_clean, 2.5)

        # Total Raw Score (0 to 100)
        raw_total = (
            severity_score +
            accidents_score +
            injuries_score +
            support_score +
            duration_score +
            evidence_score +
            category_risk_score
        )

        total_score = max(0, min(100, int(round(raw_total))))

        # Map to Priority Level:
        # 0–24: LOW
        # 25–49: MEDIUM
        # 50–74: HIGH
        # 75–100: CRITICAL
        if total_score >= 75 or data.injuries_count >= 2 or (data.accident_count >= 2 and total_score >= 60):
            priority_level = PriorityLevel.CRITICAL
        elif total_score >= 50 or data.accident_count >= 1 or data.safety_concern:
            priority_level = PriorityLevel.HIGH
        elif total_score >= 25:
            priority_level = PriorityLevel.MEDIUM
        else:
            priority_level = PriorityLevel.LOW

        factors = PriorityFactors(
            severity_score=round(severity_score, 1),
            accidents_score=round(accidents_score, 1),
            injuries_score=round(injuries_score, 1),
            community_support_score=round(support_score, 1),
            duration_score=round(duration_score, 1),
            evidence_score=round(evidence_score, 1),
            category_risk_score=round(category_risk_score, 1),
            total_score=total_score
        )

        summary_parts = []
        if data.accident_count > 0:
            summary_parts.append(f"{data.accident_count} citizen-reported accident(s)")
        if data.injuries_count > 0:
            summary_parts.append(f"{data.injuries_count} injury report(s)")
        if data.support_count > 0:
            summary_parts.append(f"{data.support_count} community supporter(s)")
        if data.complaints_count > 1:
            summary_parts.append(f"{data.complaints_count} independent complaint submissions")
        if data.safety_concern:
            summary_parts.append("active safety hazard flagged")

        if summary_parts:
            explanation = f"Evaluated as {priority_level.value.upper()} priority ({total_score}/100) due to: " + ", ".join(summary_parts) + "."
        else:
            explanation = f"Evaluated as {priority_level.value.upper()} priority ({total_score}/100) based on standard municipal category and severity assessment."

        return PriorityCalculationResult(
            issue_id=issue_id,
            priority_level=priority_level,
            priority_score=total_score,
            factors=factors,
            explanation_summary=explanation
        )

priority_engine = PriorityEngine()
