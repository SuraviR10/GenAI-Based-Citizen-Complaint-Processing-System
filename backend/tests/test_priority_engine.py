import pytest
from app.services.priority_service import priority_engine, PriorityInput, PriorityLevel

def test_priority_engine_baseline():
    """Test standard low-severity issue with no accidents or injuries."""
    res = priority_engine.calculate_score(PriorityInput(
        category="Parks & Environment",
        severity_rating=1,
        safety_concern=False,
        accident_count=0,
        injuries_count=0,
        support_count=0,
        complaints_count=1,
        evidence_count=0,
        duration="less_than_month"
    ))
    assert res.priority_score <= 25
    assert res.priority_level == PriorityLevel.LOW

def test_priority_engine_critical_with_accidents_and_injuries():
    """Test scenario with multiple accidents and injuries."""
    res = priority_engine.calculate_score(PriorityInput(
        category="Roads & Footpaths",
        severity_rating=5,
        safety_concern=True,
        accident_count=3,
        injuries_count=2,
        support_count=73,
        complaints_count=5,
        evidence_count=4,
        duration="1_to_6_months"
    ))
    assert res.priority_score >= 75
    assert res.priority_level == PriorityLevel.CRITICAL
    assert res.factors.accidents_score == 20.0
    assert res.factors.injuries_score == 15.0
    assert res.factors.community_support_score == 15.0

def test_priority_engine_score_bounds():
    """Ensure total score is always clamped between 0 and 100."""
    res_max = priority_engine.calculate_score(PriorityInput(
        category="Public Safety & Hazards",
        severity_rating=5,
        safety_concern=True,
        accident_count=100,
        injuries_count=100,
        support_count=1000,
        complaints_count=50,
        evidence_count=20,
        duration="more_than_6_months"
    ))
    assert res_max.priority_score == 100
    assert res_max.priority_level == PriorityLevel.CRITICAL
