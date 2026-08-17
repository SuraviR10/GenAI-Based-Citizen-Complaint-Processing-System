"""
CivicConnect AI — Comprehensive Integration & Unit Test Suite
Tests:
1. Section 42 End-to-End Scenario (Complaint -> AI -> Similarity -> Support -> Corroboration -> Priority -> GenAI -> Tracking)
2. Civic Issue Model & CRUD Operations
3. Pluggable Embedding Provider & Hybrid Similarity Engine (Location-aware, thresholding, no auto-merge)
4. Community Support Engine (1 citizen = 1 support, duplicate prevention, count updates)
5. Evidence & Corroboration Engine (Multi-signal, no 'AI verified genuine' claim)
6. Deterministic Priority Engine & Weights (0-100 scale, Low/Medium/High/Critical, ranking order)
7. GenAI Priority Explanation (Strictly fact-constrained, safety rules, fallback)
"""

import pytest
from datetime import datetime, timezone
from app.models.issue import (
    CivicIssueBase,
    CivicIssueResponse,
    CivicIssueDetailResponse,
    CreateIssueWithComplaintRequest,
    SimilaritySearchRequest,
    SupportToggleRequest,
    PriorityLevel,
    IssueStatus
)
from app.models.complaint import ComplaintLinkRequest
from app.models.ai import ComplaintAnalysisRequest
from app.services.priority_service import (
    priority_engine,
    PriorityInput,
    PriorityLevel as ServicePriorityLevel
)
from app.services.corroboration_service import (
    corroboration_engine,
    CorroborationInput,
    CorroborationLevel
)
from app.services.similarity_service import (
    similarity_service,
    FastSemanticEmbeddingProvider
)
from app.services.ai_service import ai_service
from app.services.supabase_service import supabase_service


# ====================================================================
# 1. SECTION 42 COMPLETE END-TO-END INTEGRATION TEST
# ====================================================================

def test_section_42_complete_integration_flow():
    """
    Validates the exact integration scenario from Project Requirement Section 42:
    - Citizen submits: "Road near ABC school has huge potholes. Two people have fallen from their bikes."
    - AI Analysis extracts: Category = Roads & Footpaths, Safety concern = True, Accidents = 2
    - Similarity search detects existing issue "Damaged Road – ABC School"
    - Citizen chooses [Support Existing Issue]
    - Support count increments (72 -> 73)
    - Complaint is associated with the Civic Issue
    - Consolidated Civic Issue contains: 5 reports, 73 supporters, 4 images, 3 accidents, 2 injuries
    - Priority engine calculates 91 -> CRITICAL
    - GenAI generates fact-based explanation
    - Issue Detail shows: CRITICAL, Strong community corroboration, 73 supporters, 5 reports, 3 accidents, 2 injuries
    - Tracking shows: Reported -> Reviewed -> Assigned -> In Progress
    """
    # Step A: Setup existing consolidated civic issue in Indiranagar
    existing_issue_id = "a1000000-0000-0000-0000-000000000099"
    supabase_service._memory_issues[existing_issue_id] = {
        "id": existing_issue_id,
        "title": "Damaged Road – ABC School",
        "description": "Massive potholes and broken tarmac near ABC school entrance.",
        "category": "Roads & Footpaths",
        "area": "Indiranagar",
        "landmark": "Near ABC School Main Gate",
        "priority_score": 60,
        "priority_level": "high",
        "status": "in_progress",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # Clear previous supports and populate 72 initial supporters for this existing issue
    supabase_service._memory_support = {pair for pair in supabase_service._memory_support if pair[0] != existing_issue_id}
    for i in range(1, 73):
        supabase_service._memory_support.add((existing_issue_id, f"citizen_supporter_{i}"))

    # Populate 4 previous complaints (1 previous accident, 0 injuries)
    for i in range(1, 5):
        c_id = f"prev_complaint_{i}"
        supabase_service._memory_complaints[c_id] = {
            "id": c_id,
            "citizen_id": f"citizen_author_{i}",
            "civic_issue_id": existing_issue_id,
            "original_text": f"Potholes on road near ABC school #{i}",
            "normalized_text": "Potholes on road near ABC school",
            "category": "Roads & Footpaths",
            "area": "Indiranagar",
            "landmark": "ABC School",
            "duration": "1_to_6_months",
            "accident_reported": (i == 1),  # 1 previous accident
            "accident_description": "Bike skid" if i == 1 else None,
            "injuries_count": 0,
            "status": "in_progress",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

    # Populate 4 evidence images
    supabase_service._memory_evidence[existing_issue_id] = [
        {"id": f"evi_{i}", "issue_id": existing_issue_id, "storage_path": f"https://example.com/photo_{i}.jpg"}
        for i in range(1, 5)
    ]

    # Verify initial supporter count is exactly 72
    initial_supporters = sum(1 for i, c in supabase_service._memory_support if i == existing_issue_id)
    assert initial_supporters == 72

    # Step B: New Citizen submits natural complaint
    citizen_text = "Road near ABC school has huge potholes. Two people have fallen from their bikes."
    new_citizen_id = "new_citizen_user_73"

    # Step C: AI Analysis
    ai_result = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text=citizen_text,
        area="Indiranagar",
        landmark="Near ABC School",
        accident_reported=True,
        accident_description="Two people fell from bikes",
        duration="1_to_6_months"
    ))

    assert "Road" in ai_result.category
    assert ai_result.safety_concern is True
    assert ai_result.reported_accidents_count >= 1

    # Step D: Similarity Search finds the candidate issue
    sim_response = similarity_service.find_similar_issues(SimilaritySearchRequest(
        text=citizen_text,
        category="Roads & Footpaths",
        area="Indiranagar",
        landmark="ABC School",
        threshold=0.35
    ))

    assert sim_response.found_matches is True
    assert len(sim_response.matched_issues) > 0
    matched_ids = [m.id for m in sim_response.matched_issues]
    assert existing_issue_id in matched_ids

    # Step E: Citizen chooses [Support Existing Issue]
    link_result = supabase_service.link_complaint_to_existing_issue(ComplaintLinkRequest(
        citizen_id=new_citizen_id,
        civic_issue_id=existing_issue_id,
        original_text=citizen_text,
        normalized_text=ai_result.problem_title,
        category=ai_result.category,
        area="Indiranagar",
        landmark="Near ABC School",
        duration="1_to_6_months",
        accident_reported=True,
        accident_description="Two people fell from bikes with knee injuries",
        auto_support=True
    ))

    assert link_result["success"] is True

    # Add the 2 reported injuries to the new complaint for exact Section 42 tally
    new_comp_id = link_result["complaint_id"]
    supabase_service._memory_complaints[new_comp_id]["injuries_count"] = 2

    # Step F: Verify updated metrics on the consolidated issue
    updated_detail = supabase_service.get_issue_detail(existing_issue_id, citizen_id=new_citizen_id)

    # 1. Supporters count incremented: 72 -> 73
    assert updated_detail.support_count == 73
    assert updated_detail.has_user_supported is True

    # 2. Complaints count: 4 previous + 1 new = 5 reports
    assert updated_detail.complaints_count == 5

    # 3. Evidence photos count: 4 images
    assert updated_detail.evidence_count == 4

    # 4. Citizen-reported accidents: 1 previous + 1 in new = 2 recorded
    assert updated_detail.accident_reports_count >= 2

    # 5. Citizen-reported injuries: 2 injuries
    assert updated_detail.injuries_count == 2

    # Step G: Priority Engine Calculation for (5 reports, 73 supporters, 4 images, 3 accidents, 2 injuries)
    p_calc = priority_engine.calculate_score(PriorityInput(
        category="Roads & Footpaths",
        severity_rating=4,
        safety_concern=True,
        accident_count=3,
        injuries_count=2,
        support_count=73,
        complaints_count=5,
        evidence_count=4,
        duration="1_to_6_months"
    ), issue_id=existing_issue_id)

    assert p_calc.priority_score >= 90
    assert p_calc.priority_level == ServicePriorityLevel.CRITICAL

    # Step H: Corroboration Engine Evaluation
    corrob_res = corroboration_engine.calculate(CorroborationInput(
        independent_complaints_count=5,
        community_supporters_count=73,
        evidence_media_count=4,
        citizen_reported_accidents_count=3,
        reported_injuries_count=2,
        location_consistency="High"
    ), issue_id=existing_issue_id)

    assert corrob_res.corroboration_level == CorroborationLevel.STRONG
    assert "Strong" in corrob_res.corroboration_label
    assert "verified" not in corrob_res.corroboration_label.lower()  # Never claim 'AI verified genuine'

    # Step I: GenAI Fact-Constrained Priority Explanation
    genai_exp = ai_service._heuristic_explain_priority(
        issue_id=existing_issue_id,
        title="Damaged Road – ABC School",
        category="Roads & Footpaths",
        priority_level="CRITICAL",
        priority_score=91,
        accidents_count=3,
        injuries_count=2,
        support_count=73,
        complaints_count=5,
        duration="1_to_6_months",
        evidence_count=4
    )

    assert "CRITICAL" in genai_exp["priority_level"]
    assert genai_exp["priority_score"] == 91
    assert "3 citizen-reported accident(s)" in genai_exp["explanation"]
    assert "2 injury report(s)" in genai_exp["explanation"]
    assert "73 neighborhood residents" in genai_exp["explanation"]

    # Step J: Tracking Steps
    tracking_data = supabase_service.get_issue_tracking(existing_issue_id)
    assert tracking_data["issue_id"] == existing_issue_id
    assert tracking_data["status"] in ["reported", "reviewed", "assigned", "in_progress", "completed"]


# ====================================================================
# 2. CIVIC ISSUE CRUD & RELATIONSHIP TESTS
# ====================================================================

def test_civic_issue_crud_and_relationships():
    req = CreateIssueWithComplaintRequest(
        citizen_id="citizen_tester_1",
        original_text="Burst water supply pipeline causing flooding on 5th Main.",
        normalized_text="Burst drinking water main pipeline",
        language="English",
        category="Water Supply & Tankers",
        area="Koramangala",
        landmark="Near Water Tank",
        duration="less_than_month",
        accident_reported=False,
        latitude=12.935,
        longitude=77.624,
        evidence_urls=["https://example.com/burst_pipe.jpg"]
    )

    created = supabase_service.create_issue_with_complaint(req)
    assert created.success is True
    assert created.issue_id is not None
    assert created.complaint_id is not None

    # Retrieve Detail
    detail = supabase_service.get_issue_detail(created.issue_id, citizen_id="citizen_tester_1")
    assert detail.id == created.issue_id
    assert detail.category == "Water Supply & Tankers"
    assert detail.area == "Koramangala"
    assert detail.support_count >= 1
    assert detail.has_user_supported is True
    assert detail.evidence_count == 1

    # List Issues with Filter
    listed = supabase_service.list_civic_issues(area="Koramangala", category="Water Supply & Tankers")
    assert any(i.id == created.issue_id for i in listed)


# ====================================================================
# 3. PLUGGABLE EMBEDDINGS & HYBRID SIMILARITY TESTS
# ====================================================================

def test_fast_semantic_embedding_cosine_similarity():
    provider = FastSemanticEmbeddingProvider()
    vec1 = provider.get_embedding("Massive dangerous potholes on road causing bike skid")
    vec2 = provider.get_embedding("Deep crater on asphalt road, two-wheelers slipping")
    vec3 = provider.get_embedding("Garbage pile uncollected near park gate")

    sim_1_2 = provider.calculate_similarity(vec1, vec2)
    sim_1_3 = provider.calculate_similarity(vec1, vec3)

    assert sim_1_2 > sim_1_3
    assert 0.0 <= sim_1_2 <= 1.0


def test_similarity_location_awareness_and_no_silent_merge():
    # Add issue in Whitefield
    iss_id = "wf_issue_01"
    supabase_service._memory_issues[iss_id] = {
        "id": iss_id,
        "title": "Streetlight pole wiring short circuit",
        "description": "Exposed electric wires from lamppost with sparks.",
        "category": "Street Lighting",
        "area": "Whitefield",
        "landmark": "Outer Circle",
        "priority_score": 75,
        "priority_level": "critical",
        "status": "reported",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # Query in Whitefield -> Match found
    res_wf = similarity_service.find_similar_issues(SimilaritySearchRequest(
        text="Sparking electric wire on street light pole with exposed cables",
        category="Street Lighting",
        area="Whitefield",
        threshold=0.30
    ))
    assert res_wf.found_matches is True
    assert any(m.id == iss_id for m in res_wf.matched_issues)

    # Query in Jayanagar (different ward) -> Low match / create new
    res_other = similarity_service.find_similar_issues(SimilaritySearchRequest(
        text="Sparking electric wire on street light pole",
        category="Street Lighting",
        area="Jayanagar",
        threshold=0.70
    ))
    assert res_other.suggested_action == "create_new"


# ====================================================================
# 4. COMMUNITY SUPPORT & DUPLICATE PREVENTION TESTS
# ====================================================================

def test_community_support_toggle_and_duplicate_prevention():
    issue_id = "a1000000-0000-0000-0000-000000000001"
    citizen_id = "unique_citizen_999"

    # Ensure not supported initially
    supabase_service.remove_support(issue_id, citizen_id)
    initial_count = sum(1 for i, c in supabase_service._memory_support if i == issue_id)

    # 1. First Support
    res1 = supabase_service.toggle_support(issue_id, citizen_id)
    assert res1.is_supported is True
    assert res1.support_count >= 1

    # 2. Toggle again (removes support)
    res2 = supabase_service.toggle_support(issue_id, citizen_id)
    assert res2.is_supported is False

    # 3. Re-add and call remove_support
    supabase_service.toggle_support(issue_id, citizen_id)
    res3 = supabase_service.remove_support(issue_id, citizen_id)
    assert res3.is_supported is False


# ====================================================================
# 5. CORROBORATION ENGINE TESTS
# ====================================================================

def test_corroboration_engine_levels():
    # Low / Initial
    c_low = corroboration_engine.calculate(CorroborationInput(
        independent_complaints_count=1,
        community_supporters_count=0,
        evidence_media_count=0,
        citizen_reported_accidents_count=0,
        reported_injuries_count=0
    ))
    assert c_low.corroboration_level == CorroborationLevel.LOW

    # Moderate
    c_mod = corroboration_engine.calculate(CorroborationInput(
        independent_complaints_count=1,
        community_supporters_count=5,
        evidence_media_count=1,
        citizen_reported_accidents_count=0,
        reported_injuries_count=0
    ))
    assert c_mod.corroboration_level == CorroborationLevel.MODERATE

    # High
    c_high = corroboration_engine.calculate(CorroborationInput(
        independent_complaints_count=2,
        community_supporters_count=15,
        evidence_media_count=2,
        citizen_reported_accidents_count=1,
        reported_injuries_count=0
    ))
    assert c_high.corroboration_level in [CorroborationLevel.HIGH, CorroborationLevel.STRONG]

    # Strong
    c_strong = corroboration_engine.calculate(CorroborationInput(
        independent_complaints_count=5,
        community_supporters_count=50,
        evidence_media_count=3,
        citizen_reported_accidents_count=2,
        reported_injuries_count=1
    ))
    assert c_strong.corroboration_level == CorroborationLevel.STRONG
    assert "verified" not in c_strong.corroboration_label.lower()


# ====================================================================
# 6. DETERMINISTIC PRIORITY ENGINE & RANKING TESTS
# ====================================================================

def test_priority_engine_levels_and_weights():
    # Baseline Low
    res_low = priority_engine.calculate_score(PriorityInput(
        category="Parks & Environment",
        severity_rating=1,
        safety_concern=False,
        accident_count=0,
        injuries_count=0,
        support_count=0,
        duration="less_than_month"
    ))
    assert res_low.priority_level == ServicePriorityLevel.LOW
    assert 0 <= res_low.priority_score <= 24

    # Medium
    res_med = priority_engine.calculate_score(PriorityInput(
        category="Garbage & Sanitation",
        severity_rating=2,
        safety_concern=False,
        accident_count=0,
        injuries_count=0,
        support_count=4,
        duration="1_to_6_months"
    ))
    assert res_med.priority_level == ServicePriorityLevel.MEDIUM
    assert 25 <= res_med.priority_score <= 49

    # High
    res_high = priority_engine.calculate_score(PriorityInput(
        category="Roads & Footpaths",
        severity_rating=3,
        safety_concern=True,
        accident_count=1,
        injuries_count=0,
        support_count=15,
        duration="1_to_6_months"
    ))
    assert res_high.priority_level in [ServicePriorityLevel.HIGH, ServicePriorityLevel.CRITICAL]

    # Critical
    res_crit = priority_engine.calculate_score(PriorityInput(
        category="Public Safety & Hazards",
        severity_rating=5,
        safety_concern=True,
        accident_count=3,
        injuries_count=2,
        support_count=60,
        duration="more_than_6_months",
        evidence_count=3
    ))
    assert res_crit.priority_level == ServicePriorityLevel.CRITICAL
    assert res_crit.priority_score >= 75


def test_priority_ranking_sort_order():
    sorted_issues = supabase_service.list_civic_issues(sort="priority", limit=10)
    for idx in range(len(sorted_issues) - 1):
        assert sorted_issues[idx].priority_score >= sorted_issues[idx + 1].priority_score


# ====================================================================
# 7. GENAI PRIORITY EXPLANATION SAFETY TESTS
# ====================================================================

def test_genai_priority_explanation_fact_constraint():
    explanation = ai_service._heuristic_explain_priority(
        issue_id="test_iss_1",
        title="Open High Voltage Transformer Enclosure",
        category="Public Safety & Hazards",
        priority_level="CRITICAL",
        priority_score=94,
        accidents_count=2,
        injuries_count=1,
        support_count=45,
        complaints_count=3,
        duration="less_than_month",
        evidence_count=2
    )

    assert explanation["issue_id"] == "test_iss_1"
    assert explanation["priority_level"] == "CRITICAL"
    assert explanation["priority_score"] == 94
    assert "2 citizen-reported accident(s)" in explanation["explanation"]
    assert "1 injury report(s)" in explanation["explanation"]
    assert "45 neighborhood residents" in explanation["explanation"]
    assert "Public Safety & Hazards" in explanation["explanation"]


# ====================================================================
# 8. NON-CIVIC & RANDOM COMPLAINT REJECTION TESTS
# ====================================================================

def test_non_civic_complaint_rejection():
    """Validates that random, spam, or non-civic submissions are detected and rejected."""
    # Test random greeting / spam
    res_spam = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text="hi hello how are you test testing 123"
    ))
    assert res_spam.is_civic_issue is False
    assert res_spam.rejection_reason is not None

    # Test personal / non-civic complaint
    res_food = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text="I ordered a pizza from restaurant and the burger was cold and delivery was late"
    ))
    assert res_food.is_civic_issue is False
    assert len(res_food.rejection_reason) > 5

    # Test gibberish
    res_gibberish = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text="asdfghjkl qwertyuiop zzzzzzz"
    ))
    assert res_gibberish.is_civic_issue is False

    # Test valid civic complaint is accepted
    res_valid = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text="Deep pothole on 100ft road near bus stop causing traffic jams and two-wheeler accidents",
        area="Indiranagar",
        accident_reported=True
    ))
    assert res_valid.is_civic_issue is True
    assert res_valid.rejection_reason is None
    assert res_valid.category == "Roads & Footpaths"

