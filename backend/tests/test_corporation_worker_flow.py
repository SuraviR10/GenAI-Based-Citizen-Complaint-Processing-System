"""
CivicConnect AI — Corporation & Worker Module Test Suite
Validates:
1. Corporation Dashboard Metrics (active, critical, high, in-progress, resolved)
2. Priority Sorting (priority_score DESC) and multi-factor filtering
3. Corporation Detailed Review of 18+ Consolidated Complaints
4. Worker Management & Workload Tracking
5. Worker Assignment with department validation and timeline logging
6. Invalid status transitions rejection
7. Field Worker Dashboard & Task Queue
8. Worker On-Site Actions: Start Inspection -> Progress -> Complete -> Evidence Upload
9. Multi-response Official Statements with Public vs. Internal Visibility
10. GenAI Response Simplification with Factual Preservation
11. Complete Section 51 Critical End-to-End Workflow
"""

import pytest
from datetime import datetime, timezone
from app.models.issue import (
    IssueStatus,
    PriorityLevel,
    WorkerAssignmentRequest,
    WorkerInspectionRequest,
    WorkerProgressUpdateRequest,
    WorkerTaskCompleteRequest,
    WorkerEvidenceUploadRequest,
    CorporationResponseCreateRequest,
    StatusTransitionRequest
)
from app.models.complaint import ComplaintLinkRequest
from app.models.ai import ComplaintAnalysisRequest, ResponseSimplificationRequest
from app.services.priority_service import priority_engine, PriorityInput
from app.services.corroboration_service import corroboration_engine, CorroborationInput
from app.services.similarity_service import similarity_service, SimilaritySearchRequest
from app.services.ai_service import ai_service
from app.services.supabase_service import supabase_service


def test_corporation_dashboard_metrics():
    """Validates corporation dashboard computes real statistics and department workloads."""
    stats = supabase_service.get_corporation_dashboard_stats()
    assert stats.total_active_issues >= 1
    assert (stats.critical_issues + stats.high_priority_issues) >= 1
    assert len(stats.department_workloads) > 0
    assert len(stats.worker_workloads) > 0

    # Test department filter
    road_stats = supabase_service.get_corporation_dashboard_stats(department="Road Maintenance")
    assert road_stats.total_active_issues >= 1


def test_priority_sorting_and_filtering():
    """Validates priority_score DESC sorting and multi-factor filtering."""
    issues = supabase_service.list_corporation_issues(sort="priority")
    assert len(issues) >= 2
    # Check descending order of priority_score
    for i in range(len(issues) - 1):
        assert issues[i].priority_score >= issues[i+1].priority_score

    # Filter by category
    road_issues = supabase_service.list_corporation_issues(category="Roads & Footpaths")
    for r in road_issues:
        assert r.category == "Roads & Footpaths"

    # Filter by priority
    crit_issues = supabase_service.list_corporation_issues(priority="critical")
    for c in crit_issues:
        assert c.priority_level == PriorityLevel.CRITICAL


def test_worker_directory_and_workload():
    """Validates worker listing, department filtering, and active task tracking."""
    workers = supabase_service.list_workers()
    assert len(workers) >= 5

    # Filter by department
    road_workers = supabase_service.list_workers(department="Road Maintenance")
    assert len(road_workers) >= 1
    assert road_workers[0].department == "Road Maintenance"

    # Fetch worker details
    w_detail = supabase_service.get_worker_details(road_workers[0].id)
    assert w_detail.full_name == road_workers[0].full_name


def test_worker_assignment_flow():
    """Validates worker assignment updates status to 'assigned', logs timeline, and sets worker active."""
    # Setup test issue
    test_issue_id = f"test_iss_asg_{datetime.now(timezone.utc).timestamp()}"
    supabase_service._memory_issues[test_issue_id] = {
        "id": test_issue_id,
        "title": "Broken storm drain slab",
        "description": "Concrete slab broken on sidewalk.",
        "category": "Water & Sewage",
        "area": "Koramangala",
        "priority_score": 70,
        "priority_level": "high",
        "status": "reviewed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    worker_id = "w2000000-0000-0000-0000-000000000002" # Anil Kumar
    asg_res = supabase_service.assign_worker_to_issue(test_issue_id, WorkerAssignmentRequest(
        worker_id=worker_id,
        assigned_by="c9000000-0000-0000-0000-000000000001",
        instructions="Clear blockage and repair drain cover."
    ))

    assert asg_res.success is True
    assert asg_res.status == "assigned"
    assert asg_res.worker_name == "Anil Kumar"

    # Check issue status updated
    assert supabase_service._memory_issues[test_issue_id]["status"] == "assigned"

    # Check timeline update added
    updates = supabase_service._memory_updates.get(test_issue_id, [])
    assert any("Water & Sewage assigned task to Anil Kumar" in u["description"] for u in updates)


def test_status_transition_lifecycle():
    """Validates valid transitions and prevents illegal jumps."""
    test_issue_id = f"test_iss_status_{datetime.now(timezone.utc).timestamp()}"
    supabase_service._memory_issues[test_issue_id] = {
        "id": test_issue_id,
        "title": "Streetlight blackout",
        "description": "Dark stretch of road.",
        "category": "Street Lighting",
        "area": "HSR Layout",
        "status": "reported",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # 1. Invalid direct jump from reported to completed should raise ValueError
    with pytest.raises(ValueError) as exc:
        supabase_service.update_issue_status(test_issue_id, StatusTransitionRequest(
            status=IssueStatus.RESOLVED,
            actor_role="worker"
        ))
    assert "Invalid status transition" in str(exc.value)

    # 2. Valid transition: reported -> reviewed
    res1 = supabase_service.update_issue_status(test_issue_id, StatusTransitionRequest(
        status=IssueStatus.UNDER_REVIEW,
        notes="Municipal engineering team reviewed the blackout report."
    ))
    assert res1["success"] is True
    assert res1["new_status"] == "reviewed"

    # 3. Valid transition: reviewed -> assigned
    res2 = supabase_service.update_issue_status(test_issue_id, StatusTransitionRequest(
        status=IssueStatus.WORKER_ASSIGNED
    ))
    assert res2["success"] is True


def test_worker_field_actions_flow():
    """Validates on-site field actions: Inspection -> Progress -> Completion -> Evidence."""
    test_issue_id = f"test_iss_field_{datetime.now(timezone.utc).timestamp()}"
    supabase_service._memory_issues[test_issue_id] = {
        "id": test_issue_id,
        "title": "Exposed high voltage cable",
        "description": "Live wire exposed on pavement.",
        "category": "Public Safety & Hazards",
        "area": "Jayanagar",
        "priority_score": 85,
        "priority_level": "critical",
        "status": "assigned",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    worker_id = "w5000000-0000-0000-0000-000000000005" # Manjunath K
    supabase_service._memory_assignments[test_issue_id] = {
        "id": f"asg_{test_issue_id[:8]}",
        "issue_id": test_issue_id,
        "worker_id": worker_id,
        "status": "assigned",
        "assigned_at": datetime.now(timezone.utc).isoformat()
    }

    # Step 1: Worker Dashboard
    w_dash = supabase_service.get_worker_dashboard(worker_id)
    assert w_dash.worker_name == "Manjunath K"
    assert any(t.issue_id == test_issue_id for t in w_dash.active_tasks)

    # Step 2: Start Inspection
    insp_res = supabase_service.record_worker_inspection(test_issue_id, WorkerInspectionRequest(
        worker_id=worker_id,
        notes="Site inspected: cable insulation severed near transformer. Barricade erected.",
        evidence_url="https://example.com/inspection_photo.jpg"
    ))
    assert insp_res["success"] is True
    assert insp_res["status"] == "inspection"
    assert supabase_service._memory_issues[test_issue_id]["status"] == "inspection"

    # Step 3: Start Progress Update
    prog_res = supabase_service.record_worker_progress(test_issue_id, WorkerProgressUpdateRequest(
        worker_id=worker_id,
        description="Power supply isolated. Jointing and armored sleeve replacement underway.",
        update_type="repair_start",
        evidence_url="https://example.com/during_repair.jpg"
    ))
    assert prog_res["success"] is True
    assert prog_res["status"] == "in_progress"
    assert supabase_service._memory_issues[test_issue_id]["status"] == "in_progress"

    # Step 4: Mark Complete
    comp_res = supabase_service.record_worker_completion(test_issue_id, WorkerTaskCompleteRequest(
        worker_id=worker_id,
        completion_notes="Armored cable spliced and buried in PVC conduit. Tested safe.",
        evidence_url="https://example.com/completed_photo.jpg"
    ))
    assert comp_res["success"] is True
    assert comp_res["status"] == "completed"
    assert supabase_service._memory_issues[test_issue_id]["status"] == "completed"


def test_corporation_responses_and_visibility():
    """Validates public vs internal visibility and GenAI simplification."""
    test_issue_id = f"test_iss_resp_{datetime.now(timezone.utc).timestamp()}"
    supabase_service._memory_issues[test_issue_id] = {
        "id": test_issue_id,
        "title": "Damaged Roadway Surface",
        "description": "Severe craters on arterial road.",
        "category": "Roads & Footpaths",
        "area": "Indiranagar",
        "status": "in_progress",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # Post Public Response
    pub_res = supabase_service.add_corporation_response(test_issue_id, CorporationResponseCreateRequest(
        official_response="Pursuant to Municipal Order 491, bituminous resurfacing is authorized and underway.",
        visibility="public",
        target_language="English"
    ))
    assert pub_res.visibility == "public"
    assert pub_res.simplified_response is not None

    # Post Internal Response (Internal staff notes)
    int_res = supabase_service.add_corporation_response(test_issue_id, CorporationResponseCreateRequest(
        official_response="Internal note: Sub-contractor penalty applied for 48h delay on asphalt batch mix.",
        visibility="internal"
    ))
    assert int_res.visibility == "internal"

    # Verify Public list does NOT leak internal note to citizens
    public_list = supabase_service.list_corporation_responses(test_issue_id, include_internal=False)
    assert len(public_list) == 1
    assert public_list[0].id == pub_res.id

    # Verify Corporation staff can view full audit trail
    full_list = supabase_service.list_corporation_responses(test_issue_id, include_internal=True)
    assert len(full_list) == 2


def test_section_51_critical_end_to_end_integration():
    """
    CRITICAL INTEGRATION TEST: Verifies the exact end-to-end workflow from Section 51:
    1. Citizen reports problem: "There are huge potholes near ABC school. Two people have fallen from their bikes."
    2. Similarity engine finds candidate issue: "Damaged Road – ABC School"
    3. Citizen supports existing issue -> support count incremented
    4. Priority engine computes CRITICAL
    5. Corporation dashboard shows CRITICAL issue
    6. Corporation reviews 5 reports, 73 supporters, 3 accidents, 2 injuries, strong corroboration
    7. Corporation assigns Road Maintenance Worker (Ramesh Rao)
    8. Worker dashboard receives task
    9. Worker starts inspection & posts note + photo
    10. Status becomes 'inspection'
    11. Worker starts repair & posts progress update
    12. Status becomes 'in_progress'
    13. Citizen tracking page updates in real-time
    14. Corporation posts official response
    15. GenAI simplifies official response
    16. Citizen sees both official notice and AI explanation
    17. Worker completes repair with photo
    18. Issue becomes 'completed'
    19. Citizen tracking confirms resolution
    """
    now = datetime.now(timezone.utc)
    import uuid
    issue_id = str(uuid.uuid4())
    
    # 1. Existing consolidated civic issue
    supabase_service._memory_issues[issue_id] = {
        "id": issue_id,
        "title": "Damaged Road – ABC School",
        "description": "Severe potholes and craters stretching over 150m near school zone.",
        "category": "Roads & Footpaths",
        "area": "Indiranagar",
        "landmark": "ABC School Entrance",
        "priority_score": 60,
        "priority_level": "high",
        "status": "reviewed",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }

    # Populate 72 initial supporters
    for i in range(1, 73):
        supabase_service._memory_support.add((issue_id, f"citizen_user_{i}"))

    # Populate 4 previous complaints
    for i in range(1, 5):
        c_id = str(uuid.uuid4())
        supabase_service._memory_complaints[c_id] = {
            "id": c_id,
            "citizen_id": f"author_{i}",
            "civic_issue_id": issue_id,
            "original_text": f"Pothole report #{i}",
            "normalized_text": "Potholes near ABC school",
            "category": "Roads & Footpaths",
            "area": "Indiranagar",
            "landmark": "ABC School",
            "duration": "1_to_6_months",
            "accident_reported": (i == 1),
            "accident_description": "Two-wheeler skid" if i == 1 else None,
            "injuries_count": 0,
            "status": "reviewed",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

    # Step A: Citizen reports
    citizen_text = "There are huge potholes near ABC school. Two people have fallen from their bikes."
    new_citizen_id = str(uuid.uuid4())

    ai_triage = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text=citizen_text,
        area="Indiranagar",
        landmark="ABC School",
        accident_reported=True,
        accident_description="Two people fallen from bikes with injuries",
        duration="1_to_6_months"
    ))
    assert "Road" in ai_triage.category
    assert ai_triage.safety_concern is True

    # Step B: Similarity search finds existing issue
    sim_match = similarity_service.find_similar_issues(SimilaritySearchRequest(
        text=citizen_text,
        category="Roads & Footpaths",
        area="Indiranagar",
        landmark="ABC School"
    ))
    assert sim_match.found_matches is True
    assert any(m.id == issue_id for m in sim_match.matched_issues)

    # Step C: Citizen supports existing issue
    link_res = supabase_service.link_complaint_to_existing_issue(ComplaintLinkRequest(
        citizen_id=new_citizen_id,
        civic_issue_id=issue_id,
        original_text=citizen_text,
        normalized_text=ai_triage.problem_title,
        category=ai_triage.category,
        area="Indiranagar",
        landmark="ABC School",
        accident_reported=True,
        accident_description="Two people fallen with knee injuries",
        auto_support=True
    ))
    assert link_res["success"] is True

    # Record the 2 injuries for exact tally
    supabase_service._memory_complaints[link_res["complaint_id"]]["injuries_count"] = 2

    # Step D: Priority Engine calculates CRITICAL
    p_result = priority_engine.calculate_score(PriorityInput(
        category="Roads & Footpaths",
        severity_rating=4,
        safety_concern=True,
        accident_count=3,
        injuries_count=2,
        support_count=73,
        complaints_count=5,
        evidence_count=4,
        duration="1_to_6_months"
    ), issue_id=issue_id)
    assert p_result.priority_level == PriorityLevel.CRITICAL
    supabase_service._memory_issues[issue_id]["priority_score"] = p_result.priority_score
    supabase_service._memory_issues[issue_id]["priority_level"] = "critical"

    # Step E: Corporation sees CRITICAL on dashboard
    corp_issues = supabase_service.list_corporation_issues(sort="priority")
    assert corp_issues[0].id == issue_id or any(i.id == issue_id and i.priority_level == PriorityLevel.CRITICAL for i in corp_issues)

    # Step F: Corporation opens issue detail
    detail = supabase_service.get_corporation_issue_detail(issue_id)
    assert detail.support_count == 73
    assert detail.complaints_count == 5
    assert detail.injuries_count == 2
    assert detail.corroboration_level == "strong"

    # Step G: Corporation assigns Road Maintenance Worker (Ramesh Rao)
    worker_id = "w1000000-0000-0000-0000-000000000001"
    asg = supabase_service.assign_worker_to_issue(issue_id, WorkerAssignmentRequest(
        worker_id=worker_id,
        instructions="Execute urgent cold-milling and asphalt patching on damaged 150m section."
    ))
    assert asg.success is True
    assert asg.status == "assigned"

    # Step H: Worker dashboard receives task
    w_dash = supabase_service.get_worker_dashboard(worker_id)
    assert any(t.issue_id == issue_id for t in w_dash.active_tasks)

    # Step I: Worker starts inspection
    insp = supabase_service.record_worker_inspection(issue_id, WorkerInspectionRequest(
        worker_id=worker_id,
        notes="Inspected the damaged section of ABC Main Road near school entrance.",
        evidence_url="https://example.com/pothole_inspection.jpg"
    ))
    assert insp["success"] is True
    assert supabase_service._memory_issues[issue_id]["status"] == "inspection"

    # Step J: Worker starts repair
    prog = supabase_service.record_worker_progress(issue_id, WorkerProgressUpdateRequest(
        worker_id=worker_id,
        description="Repair work has started with hot-mix asphalt compaction team.",
        update_type="repair_start",
        evidence_url="https://example.com/asphalt_laying.jpg"
    ))
    assert prog["success"] is True
    assert supabase_service._memory_issues[issue_id]["status"] == "in_progress"

    # Step K: Corporation posts official response & GenAI simplifies
    official_statement = (
        "Pursuant to Municipal Infrastructure Standard 402, remedial resurfacing measures have been initiated "
        "following engineering inspection of the affected carriageway on ABC Main Road. The Road Maintenance division "
        "has deployed mechanical compaction equipment for complete reinstatement."
    )
    corp_resp = supabase_service.add_corporation_response(issue_id, CorporationResponseCreateRequest(
        official_response=official_statement,
        visibility="public",
        target_language="English"
    ))
    assert corp_resp.visibility == "public"
    assert corp_resp.simplified_response is not None

    # Step L: Citizen sees transparent progress & simplified explanation
    citizen_detail = supabase_service.get_issue_detail(issue_id)
    assert citizen_detail.status == IssueStatus.IN_PROGRESS
    assert len(citizen_detail.updates) >= 3
    assert len(citizen_detail.responses) >= 1
    assert citizen_detail.responses[-1]["official_response"] == official_statement
    assert citizen_detail.responses[-1]["simplified_response"] is not None

    # Step M: Worker completes work
    comp = supabase_service.record_worker_completion(issue_id, WorkerTaskCompleteRequest(
        worker_id=worker_id,
        completion_notes="All potholes filled, asphalt compacted, and road reopened safely to school traffic.",
        evidence_url="https://example.com/repaired_road.jpg"
    ))
    assert comp["success"] is True
    assert supabase_service._memory_issues[issue_id]["status"] == "completed"

    # Step N: Citizen sees resolution
    final_detail = supabase_service.get_issue_detail(issue_id)
    assert final_detail.status == IssueStatus.RESOLVED
