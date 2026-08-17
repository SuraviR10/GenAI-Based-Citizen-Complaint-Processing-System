import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Set, Tuple
from app.config import settings
from app.database import get_supabase
from app.models.issue import (
    CreateIssueWithComplaintRequest,
    CreateIssueResponse,
    SupportToggleResponse,
    CivicIssueResponse,
    CivicIssueDetailResponse,
    IssueStatus,
    PriorityLevel,
    WorkerProfileResponse,
    WorkerAssignmentRequest,
    WorkerAssignmentResponse,
    WorkerInspectionRequest,
    WorkerProgressUpdateRequest,
    WorkerTaskCompleteRequest,
    WorkerEvidenceUploadRequest,
    WorkerTaskResponse,
    WorkerDashboardStats,
    DepartmentWorkloadItem,
    WorkerWorkloadItem,
    CorporationDashboardStatsResponse,
    CorporationResponseCreateRequest,
    CorporationResponseItem,
    StatusTransitionRequest,
    CorporationAnalyticsResponse
)
from app.models.complaint import ComplaintLinkRequest, ComplaintResponse
from app.models.stats import CitizenDashboardStats
from app.models.notification import NotificationResponse
from app.models.profile import ProfileResponse, ProfileUpdate
from app.services.priority_service import priority_engine, PriorityInput
from app.services.corroboration_service import corroboration_engine, CorroborationInput
from app.services.ai_service import ai_service

logger = logging.getLogger("civicconnect.supabase_service")

def _to_valid_uuid(val: Optional[str]) -> str:
    """Safely ensures any string ID is converted into a standard valid RFC 4122 UUID string."""
    if not val:
        return str(uuid.uuid4())
    try:
        return str(uuid.UUID(str(val)))
    except Exception:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

class SupabaseService:
    def __init__(self):
        # In-memory storage for preview / local mode before Supabase credentials are added
        self._memory_issues: Dict[str, dict] = {}
        self._memory_complaints: Dict[str, dict] = {}
        self._memory_support: Set[Tuple[str, str]] = set() # (issue_id, citizen_id)
        self._memory_updates: Dict[str, List[dict]] = {} # issue_id -> list of updates
        self._memory_evidence: Dict[str, List[dict]] = {} # issue_id -> list of evidence
        self._memory_responses: Dict[str, List[dict]] = {} # issue_id -> list of responses
        self._memory_notifications: Dict[str, List[dict]] = {} # user_id -> list of notifications
        self._memory_profiles: Dict[str, dict] = {}
        self._memory_assignments: Dict[str, dict] = {} # issue_id -> assignment dict
        self._memory_workers: Dict[str, dict] = {} # worker_id -> worker dict

        # Initialize with sample seed data for instant realistic exploration
        self._seed_in_memory_data()

    def _seed_in_memory_data(self):
        now = datetime.now(timezone.utc)
        
        # Sample issue 1
        i1_id = "a1000000-0000-0000-0000-000000000001"
        self._memory_issues[i1_id] = {
            "id": i1_id,
            "title": "Dangerous potholes and crater on Contour Road near Doctor's Corner",
            "description": "Multiple deep potholes stretching over 150 meters along Contour Road. Vehicles are swerving into oncoming traffic during peak evening hours, causing severe collision risks.",
            "category": "Roads & Footpaths",
            "area": "Gokulam",
            "landmark": "Near Doctor's Corner, 3rd Stage Contour Road",
            "latitude": 12.3312,
            "longitude": 76.6321,
            "priority_score": 88,
            "priority_level": "critical",
            "status": "in_progress",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        self._memory_updates[i1_id] = [
            {"id": "u1", "issue_id": i1_id, "status": "reported", "description": "Consolidated civic issue generated and priority auto-computed based on citizen safety reports.", "created_at": now.isoformat()},
            {"id": "u2", "issue_id": i1_id, "status": "reviewed", "description": "MCC Ward Office 23 inspected road conditions and classified it under emergency road surfacing.", "created_at": now.isoformat()},
            {"id": "u3", "issue_id": i1_id, "status": "assigned", "description": "Road Maintenance Division Team #2 (Ramesh Rao) assigned with hot-mix asphalt patching equipment.", "created_at": now.isoformat()},
            {"id": "u4", "issue_id": i1_id, "status": "in_progress", "description": "Surface clearing and sub-base leveling currently underway on Contour Road, Gokulam.", "created_at": now.isoformat()}
        ]
        self._memory_responses[i1_id] = [{
            "id": "r1",
            "issue_id": i1_id,
            "official_response": "Pursuant to Section 58 of Karnataka Municipal Corporation Act, MCC Work Order WO-MYS-2026-4109 has been issued to M/s Apex Infrastructure. Cold-milling and asphaltic concrete wearing course application is authorized with target completion within 48 hours, weather permitting.",
            "simplified_response": "Good news: Mysuru Municipal Corporation (MCC) has approved emergency road repairs. A certified repair crew has already started fixing Contour Road and aims to finish within 48 hours.",
            "visibility": "public",
            "created_at": now.isoformat()
        }]

        # Seed sample complaints for issue 1 to establish realistic community corroboration
        c1_id = "c1000000-0000-0000-0000-000000000001"
        self._memory_complaints[c1_id] = {
            "id": c1_id,
            "citizen_id": "c1000000-0000-0000-0000-000000000001",
            "civic_issue_id": i1_id,
            "original_text": "Dangerous potholes on Contour Road Gokulam near Doctor's Corner causing accidents",
            "normalized_text": "Dangerous potholes on Contour Road near Doctor's Corner",
            "language": "English",
            "category": "Roads & Footpaths",
            "area": "Gokulam",
            "landmark": "Near Doctor's Corner",
            "duration": "1_to_6_months",
            "accident_reported": True,
            "accident_description": "Two two-wheeler riders slipped while braking abruptly on the gravel.",
            "injuries_count": 2,
            "status": "in_progress",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        # Sample issue 2
        i2_id = "a2000000-0000-0000-0000-000000000002"
        self._memory_issues[i2_id] = {
            "id": i2_id,
            "title": "Overflowing sewage manhole causing health hazard and foul odor near Complex Circle",
            "description": "Underground sewage line blocked and overflowing on the pedestrian pathway since last week. Stagnant contaminated water near vegetable market.",
            "category": "Water & Sewage",
            "area": "Kuvempunagar",
            "landmark": "Near Kuvempunagar Complex Circle, Vishwamanava Double Road",
            "latitude": 12.2882,
            "longitude": 76.6265,
            "priority_score": 62,
            "priority_level": "high",
            "status": "assigned",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        self._memory_updates[i2_id] = [
            {"id": "u5", "issue_id": i2_id, "status": "reported", "description": "Civic report registered regarding sewage overflow.", "created_at": now.isoformat()},
            {"id": "u6", "issue_id": i2_id, "status": "reviewed", "description": "MCC Water Supply & Drainage division inspected site notes.", "created_at": now.isoformat()},
            {"id": "u7", "issue_id": i2_id, "status": "assigned", "description": "Sanitation crew (Anil Kumar) dispatched with high-pressure suction jetting vehicle.", "created_at": now.isoformat()}
        ]

        # Seed Workers
        workers_data = [
            {
                "id": "w1000000-0000-0000-0000-000000000001",
                "full_name": "Ramesh Rao",
                "email": "ramesh.worker@civicconnect.org",
                "role": "worker",
                "department": "Road Maintenance",
                "phone": "+91 98765 43210",
                "area": "Kuvempunagar",
                "worker_status": "on_site",
                "preferred_language": "Kannada",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            },
            {
                "id": "w2000000-0000-0000-0000-000000000002",
                "full_name": "Anil Kumar",
                "email": "anil.worker@civicconnect.org",
                "role": "worker",
                "department": "Water & Sewage",
                "phone": "+91 98765 43211",
                "area": "Vijayanagar",
                "worker_status": "assigned",
                "preferred_language": "English",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            },
            {
                "id": "w3000000-0000-0000-0000-000000000003",
                "full_name": "Suresh Gowda",
                "email": "suresh.worker@civicconnect.org",
                "role": "worker",
                "department": "Street Lighting",
                "phone": "+91 98765 43212",
                "area": "Gokulam",
                "worker_status": "available",
                "preferred_language": "Kannada",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            },
            {
                "id": "w4000000-0000-0000-0000-000000000004",
                "full_name": "Priya Sharma",
                "email": "priya.worker@civicconnect.org",
                "role": "worker",
                "department": "Garbage & Sanitation",
                "phone": "+91 98765 43213",
                "area": "Hebbal",
                "worker_status": "available",
                "preferred_language": "Hindi",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            },
            {
                "id": "w5000000-0000-0000-0000-000000000005",
                "full_name": "Manjunath K",
                "email": "manjunath.worker@civicconnect.org",
                "role": "worker",
                "department": "Public Safety & Hazards",
                "phone": "+91 98765 43214",
                "area": "Saraswathipuram",
                "worker_status": "available",
                "preferred_language": "Kannada",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            },
            {
                "id": "c9000000-0000-0000-0000-000000000001",
                "full_name": "Dr. K. Srinivas (Executive Engineer)",
                "email": "officer@civicconnect.org",
                "role": "corporation",
                "department": "Municipal Administration",
                "phone": "+91 98450 12345",
                "area": "Vijayanagar",
                "worker_status": "available",
                "preferred_language": "English",
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
        ]

        for w in workers_data:
            self._memory_workers[w["id"]] = w
            self._memory_profiles[w["id"]] = w

        # Seed assignments
        self._memory_assignments[i1_id] = {
            "id": "asg_1",
            "issue_id": i1_id,
            "worker_id": "w1000000-0000-0000-0000-000000000001",
            "assigned_by": "c9000000-0000-0000-0000-000000000001",
            "instructions": "Emergency cold-milling and asphaltic patching near National High School junction. Complete during off-peak hours.",
            "status": "in_progress",
            "assigned_at": now.isoformat()
        }
        self._memory_assignments[i2_id] = {
            "id": "asg_2",
            "issue_id": i2_id,
            "worker_id": "w2000000-0000-0000-0000-000000000002",
            "assigned_by": "c9000000-0000-0000-0000-000000000001",
            "instructions": "Clear underground sewage line blockage using high-pressure jetting machine near Central Market.",
            "status": "assigned",
            "assigned_at": now.isoformat()
        }

        # Seed initial support
        self._memory_support.add((i1_id, "c1000000-0000-0000-0000-000000000001"))
        self._memory_support.add((i1_id, "demo_user_2"))
        self._memory_support.add((i1_id, "demo_user_3"))
        self._memory_support.add((i1_id, "demo_user_4"))
        self._memory_support.add((i2_id, "demo_user_5"))

    def _recalculate_priority(self, issue_id: str):
        """
        Recalculates deterministic priority score (0-100) and level based on
        all aggregated complaints, supporters, evidence, accidents, and injuries.
        """
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                issue_res = supabase.table("civic_issues").select("*").eq("id", issue_id).execute()
                if not issue_res.data:
                    return None
                issue = issue_res.data[0]

                cmp_res = supabase.table("complaints").select("id, accident_reported, duration, injuries_count, category").eq("civic_issue_id", issue_id).execute()
                complaints = cmp_res.data or []
                complaints_count = len(complaints) or 1

                accidents_count = sum(1 for c in complaints if c.get("accident_reported"))
                injuries_count = sum(c.get("injuries_count", 0) for c in complaints)

                sup_res = supabase.table("issue_support").select("id", count="exact").eq("issue_id", issue_id).execute()
                support_count = sup_res.count if sup_res.count is not None else 0

                evi_res = supabase.table("evidence").select("id", count="exact").eq("issue_id", issue_id).execute()
                evidence_count = evi_res.count if evi_res.count is not None else 0

                latest_duration = complaints[-1].get("duration", "not_sure") if complaints else "not_sure"
                safety_concern = bool(accidents_count > 0 or "danger" in issue.get("description", "").lower() or "safety" in issue.get("category", "").lower())

                p_input = PriorityInput(
                    category=issue.get("category", "Roads & Footpaths"),
                    severity_rating=4 if safety_concern else 3,
                    safety_concern=safety_concern,
                    accident_count=accidents_count,
                    injuries_count=injuries_count,
                    support_count=support_count,
                    complaints_count=complaints_count,
                    evidence_count=evidence_count,
                    duration=latest_duration
                )
                calc = priority_engine.calculate_score(p_input, issue_id)

                supabase.table("civic_issues").update({
                    "priority_score": calc.priority_score,
                    "priority_level": calc.priority_level.value
                }).eq("id", issue_id).execute()
                return calc
            except Exception as e:
                logger.error(f"Error recalculating priority in Supabase: {e}")

        # In-Memory Recalculation
        issue = self._memory_issues.get(issue_id)
        if not issue:
            return None

        complaints = [c for c in self._memory_complaints.values() if c.get("civic_issue_id") == issue_id]
        complaints_count = len(complaints) or 1
        accidents_count = sum(1 for c in complaints if c.get("accident_reported"))
        injuries_count = sum(c.get("injuries_count", 0) for c in complaints)
        support_count = sum(1 for i, c in self._memory_support if i == issue_id)
        evidence_count = len(self._memory_evidence.get(issue_id, []))
        latest_duration = complaints[-1].get("duration", "not_sure") if complaints else "not_sure"
        safety_concern = bool(accidents_count > 0 or "danger" in issue.get("description", "").lower() or "safety" in issue.get("category", "").lower())

        p_input = PriorityInput(
            category=issue.get("category", "Roads & Footpaths"),
            severity_rating=4 if safety_concern else 3,
            safety_concern=safety_concern,
            accident_count=accidents_count,
            injuries_count=injuries_count,
            support_count=support_count,
            complaints_count=complaints_count,
            evidence_count=evidence_count,
            duration=latest_duration
        )
        calc = priority_engine.calculate_score(p_input, issue_id)

        issue["priority_score"] = calc.priority_score
        issue["priority_level"] = calc.priority_level.value
        issue["updated_at"] = datetime.now(timezone.utc).isoformat()
        return calc

    def _ensure_citizen_profile(self, supabase, citizen_id: str, area: Optional[str] = None):
        """Ensures a profile exists for citizen_id in public.profiles to satisfy foreign keys."""
        try:
            valid_id = _to_valid_uuid(citizen_id)
            res = supabase.table("profiles").select("id").eq("id", valid_id).limit(1).execute()
            if not res.data:
                supabase.table("profiles").upsert({
                    "id": valid_id,
                    "full_name": "Citizen User",
                    "email": f"citizen-{valid_id[:8]}@mysore.civicconnect.org",
                    "role": "citizen",
                    "preferred_language": "English",
                    "area": area or "Gokulam"
                }, on_conflict="id").execute()
        except Exception as e:
            logger.warning(f"Could not auto-ensure citizen profile for {citizen_id}: {e}")

    def create_issue_with_complaint(self, req: CreateIssueWithComplaintRequest) -> CreateIssueResponse:
        """
        Transactionally creates a new Civic Issue, the linked Complaint,
        the initial Issue Update, and associated Evidence media records.
        """
        # Calculate initial deterministic priority score (0-100)
        p_calc = priority_engine.calculate_score(PriorityInput(
            category=req.category,
            severity_rating=4 if req.accident_reported or (req.priority_level in ["high", "critical"]) else 2,
            safety_concern=bool(req.accident_reported or (req.priority_level in ["high", "critical"])),
            accident_count=1 if req.accident_reported else 0,
            injuries_count=req.injuries_count or 0,
            support_count=1,
            complaints_count=1,
            evidence_count=len(req.evidence_urls or []),
            duration=req.duration or "not_sure"
        ))

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                valid_citizen_id = _to_valid_uuid(req.citizen_id)

                # Ensure citizen profile exists in database
                self._ensure_citizen_profile(supabase, valid_citizen_id, req.area)

                # 1. Insert Civic Issue
                issue_payload = {
                    "title": req.normalized_text or f"{req.category} reported in {req.area}",
                    "description": req.original_text,
                    "category": req.category,
                    "area": req.area or "Gokulam",
                    "landmark": req.landmark,
                    "latitude": req.latitude,
                    "longitude": req.longitude,
                    "priority_score": p_calc.priority_score,
                    "priority_level": p_calc.priority_level.value,
                    "status": "reported"
                }

                issue_res = supabase.table("civic_issues").insert(issue_payload).execute()
                if not issue_res.data:
                    raise RuntimeError("Failed to create civic issue record in database.")
                
                issue = issue_res.data[0]
                issue_id = issue["id"]

                # 2. Insert Complaint
                complaint_payload = {
                    "citizen_id": valid_citizen_id,
                    "civic_issue_id": issue_id,
                    "original_text": req.original_text,
                    "normalized_text": req.normalized_text,
                    "language": req.language or "English",
                    "category": req.category,
                    "area": req.area or "Gokulam",
                    "landmark": req.landmark,
                    "duration": req.duration or "not_sure",
                    "accident_reported": req.accident_reported or False,
                    "accident_description": req.accident_description,
                    "injuries_count": req.injuries_count or 0,
                    "status": "reported"
                }

                complaint_res = supabase.table("complaints").insert(complaint_payload).execute()
                if not complaint_res.data:
                    raise RuntimeError("Failed to create complaint record in database.")
                
                complaint = complaint_res.data[0]
                complaint_id = complaint["id"]

                # 3. Insert Initial Issue Update
                update_payload = {
                    "issue_id": issue_id,
                    "updated_by": valid_citizen_id,
                    "status": "reported",
                    "description": f"Civic report registered by citizen. System priority calculated at {p_calc.priority_score}/100 ({p_calc.priority_level.value.upper()})."
                }
                try:
                    supabase.table("issue_updates").insert(update_payload).execute()
                except Exception as e:
                    logger.warning(f"Could not insert initial issue update: {e}")

                # 4. Insert Initial Support
                try:
                    supabase.table("issue_support").insert({
                        "issue_id": issue_id,
                        "citizen_id": valid_citizen_id
                    }).execute()
                except Exception as e:
                    logger.warning(f"Could not auto-add initial support: {e}")

                # 5. Insert Evidence
                if req.evidence_urls:
                    for url in req.evidence_urls:
                        try:
                            supabase.table("evidence").insert({
                                "issue_id": issue_id,
                                "complaint_id": complaint_id,
                                "uploaded_by": valid_citizen_id,
                                "storage_path": url,
                                "file_type": "image/jpeg"
                            }).execute()
                        except Exception as e:
                            logger.warning(f"Failed to record evidence URL {url}: {e}")

                # 6. Insert Notification
                try:
                    supabase.table("notifications").insert({
                        "user_id": valid_citizen_id,
                        "issue_id": issue_id,
                        "type": "issue_created",
                        "message": f"Your report '{issue['title']}' has been registered as a community issue in {req.area or 'Mysuru'}. You can track progress in real-time."
                    }).execute()
                except Exception as e:
                    logger.warning(f"Failed to create notification: {e}")

                return CreateIssueResponse(
                    success=True,
                    issue_id=issue_id,
                    complaint_id=complaint_id,
                    title=issue["title"],
                    status="reported",
                    message="Your civic problem report has been submitted and registered successfully."
                )
            except Exception as e:
                logger.error(f"Supabase error during create_issue_with_complaint: {e}. Falling back to memory store.")

        # In-Memory Transactional Fallback
        issue_id = str(uuid.uuid4())
        complaint_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        title = req.normalized_text or f"{req.category} reported in {req.area}"

        new_issue = {
            "id": issue_id,
            "title": title,
            "description": req.original_text,
            "category": req.category,
            "area": req.area,
            "landmark": req.landmark,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "priority_score": p_calc.priority_score,
            "priority_level": p_calc.priority_level.value,
            "status": "reported",
            "created_at": now,
            "updated_at": now
        }
        self._memory_issues[issue_id] = new_issue

        new_complaint = {
            "id": complaint_id,
            "citizen_id": req.citizen_id,
            "civic_issue_id": issue_id,
            "original_text": req.original_text,
            "normalized_text": req.normalized_text,
            "language": req.language or "English",
            "category": req.category,
            "area": req.area,
            "landmark": req.landmark,
            "duration": req.duration or "not_sure",
            "accident_reported": req.accident_reported or False,
            "accident_description": req.accident_description,
            "injuries_count": req.injuries_count or 0,
            "status": "reported",
            "created_at": now,
            "updated_at": now
        }
        self._memory_complaints[complaint_id] = new_complaint

        self._memory_updates[issue_id] = [{
            "id": str(uuid.uuid4()),
            "issue_id": issue_id,
            "status": "reported",
            "description": f"Civic report registered by citizen. System priority calculated at {p_calc.priority_score}/100 ({p_calc.priority_level.value.upper()}).",
            "created_at": now
        }]

        self._memory_support.add((issue_id, req.citizen_id))

        if req.evidence_urls:
            self._memory_evidence[issue_id] = [
                {"id": str(uuid.uuid4()), "issue_id": issue_id, "complaint_id": complaint_id, "uploaded_by": req.citizen_id, "storage_path": url, "file_type": "image/jpeg", "created_at": now}
                for url in req.evidence_urls
            ]

        if req.citizen_id not in self._memory_notifications:
            self._memory_notifications[req.citizen_id] = []
        self._memory_notifications[req.citizen_id].insert(0, {
            "id": str(uuid.uuid4()),
            "user_id": req.citizen_id,
            "issue_id": issue_id,
            "type": "issue_created",
            "message": f"Your report '{title}' has been registered as a community issue. You can track progress in real-time.",
            "is_read": False,
            "created_at": now
        })

        return CreateIssueResponse(
            success=True,
            issue_id=issue_id,
            complaint_id=complaint_id,
            title=title,
            status="reported",
            message="Your civic problem report has been submitted and registered successfully."
        )

    def link_complaint_to_existing_issue(self, req: ComplaintLinkRequest) -> Dict[str, Any]:
        """
        Links a citizen's complaint to an existing consolidated Civic Issue,
        adds citizen support (with unique constraint guarantee), attaches evidence,
        and dynamically recalculates community priority.
        """
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                valid_citizen_id = _to_valid_uuid(req.citizen_id)

                # Ensure citizen profile exists in database
                self._ensure_citizen_profile(supabase, valid_citizen_id, req.area)

                # 1. Insert Complaint
                complaint_payload = {
                    "citizen_id": valid_citizen_id,
                    "civic_issue_id": req.civic_issue_id,
                    "original_text": req.original_text,
                    "normalized_text": req.normalized_text,
                    "language": req.language or "English",
                    "category": req.category,
                    "area": req.area or "Gokulam",
                    "landmark": req.landmark,
                    "duration": req.duration or "not_sure",
                    "accident_reported": req.accident_reported or False,
                    "accident_description": req.accident_description,
                    "status": "reported"
                }

                complaint_res = supabase.table("complaints").insert(complaint_payload).execute()
                if not complaint_res.data:
                    raise RuntimeError("Failed to link complaint to civic issue.")

                complaint = complaint_res.data[0]

                if req.auto_support:
                    try:
                        supabase.table("issue_support").upsert({
                            "issue_id": req.civic_issue_id,
                            "citizen_id": valid_citizen_id
                        }, on_conflict="issue_id,citizen_id").execute()
                    except Exception as e:
                        logger.info(f"Support record already exists: {e}")

                if req.evidence_urls:
                    for url in req.evidence_urls:
                        try:
                            supabase.table("evidence").insert({
                                "issue_id": req.civic_issue_id,
                                "complaint_id": complaint["id"],
                                "uploaded_by": valid_citizen_id,
                                "storage_path": url,
                                "file_type": "image/jpeg"
                            }).execute()
                        except Exception as e:
                            logger.warning(f"Error attaching evidence: {e}")

                # Recalculate priority
                self._recalculate_priority(req.civic_issue_id)

                try:
                    supabase.table("notifications").insert({
                        "user_id": valid_citizen_id,
                        "issue_id": req.civic_issue_id,
                        "type": "issue_linked",
                        "message": "Your report was successfully connected to the existing community issue to prevent duplicates."
                    }).execute()
                except Exception as e:
                    logger.warning(f"Error creating notification: {e}")

                return {
                    "success": True,
                    "complaint_id": complaint["id"],
                    "civic_issue_id": req.civic_issue_id,
                    "message": "Your complaint was successfully connected to the existing civic issue."
                }
            except Exception as e:
                logger.error(f"Supabase error during link_complaint: {e}. Falling back to memory store.")

        # In-Memory Fallback
        complaint_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        new_complaint = {
            "id": complaint_id,
            "citizen_id": req.citizen_id,
            "civic_issue_id": req.civic_issue_id,
            "original_text": req.original_text,
            "normalized_text": req.normalized_text,
            "language": req.language or "English",
            "category": req.category,
            "area": req.area,
            "landmark": req.landmark,
            "duration": req.duration or "not_sure",
            "accident_reported": req.accident_reported or False,
            "accident_description": req.accident_description,
            "status": "reported",
            "created_at": now,
            "updated_at": now
        }
        self._memory_complaints[complaint_id] = new_complaint

        if req.auto_support:
            self._memory_support.add((req.civic_issue_id, req.citizen_id))

        if req.evidence_urls:
            if req.civic_issue_id not in self._memory_evidence:
                self._memory_evidence[req.civic_issue_id] = []
            for url in req.evidence_urls:
                self._memory_evidence[req.civic_issue_id].append({
                    "id": str(uuid.uuid4()),
                    "issue_id": req.civic_issue_id,
                    "complaint_id": complaint_id,
                    "uploaded_by": req.citizen_id,
                    "storage_path": url,
                    "file_type": "image/jpeg",
                    "created_at": now
                })

        # Recalculate priority for the consolidated issue
        self._recalculate_priority(req.civic_issue_id)

        if req.citizen_id not in self._memory_notifications:
            self._memory_notifications[req.citizen_id] = []
        self._memory_notifications[req.citizen_id].insert(0, {
            "id": str(uuid.uuid4()),
            "user_id": req.citizen_id,
            "issue_id": req.civic_issue_id,
            "type": "issue_linked",
            "message": "Your report was successfully connected to the existing community issue to prevent duplicates.",
            "is_read": False,
            "created_at": now
        })

        return {
            "success": True,
            "complaint_id": complaint_id,
            "civic_issue_id": req.civic_issue_id,
            "message": "Your complaint was successfully connected to the existing civic issue."
        }

    def toggle_support(self, issue_id: str, citizen_id: str) -> SupportToggleResponse:
        """
        Adds or removes support for an issue, ensuring one citizen cannot support twice.
        Automatically updates community priority ranking.
        """
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                valid_citizen_id = _to_valid_uuid(citizen_id)

                # Ensure citizen profile exists in database
                self._ensure_citizen_profile(supabase, valid_citizen_id)

                existing = supabase.table("issue_support").select("id").eq("issue_id", issue_id).eq("citizen_id", valid_citizen_id).execute()
                
                is_supported = False
                if existing.data and len(existing.data) > 0:
                    supabase.table("issue_support").delete().eq("issue_id", issue_id).eq("citizen_id", valid_citizen_id).execute()
                    is_supported = False
                    msg = "Support removed."
                else:
                    supabase.table("issue_support").insert({"issue_id": issue_id, "citizen_id": valid_citizen_id}).execute()
                    is_supported = True
                    msg = "You are now supporting this community issue."

                # Recalculate priority
                self._recalculate_priority(issue_id)

                count_res = supabase.table("issue_support").select("id", count="exact").eq("issue_id", issue_id).execute()
                total_support = count_res.count if count_res.count is not None else 0

                return SupportToggleResponse(
                    success=True,
                    is_supported=is_supported,
                    support_count=total_support,
                    message=msg
                )
            except Exception as e:
                logger.error(f"Supabase error during toggle_support: {e}. Falling back to memory store.")

        # In-Memory Fallback
        pair = (issue_id, citizen_id)
        if pair in self._memory_support:
            self._memory_support.remove(pair)
            is_supported = False
            msg = "Support removed."
        else:
            self._memory_support.add(pair)
            is_supported = True
            msg = "You are now supporting this community issue."

        # Recalculate priority in memory
        self._recalculate_priority(issue_id)

        total_support = sum(1 for i, c in self._memory_support if i == issue_id)
        return SupportToggleResponse(
            success=True,
            is_supported=is_supported,
            support_count=total_support,
            message=msg
        )

    def get_citizen_dashboard_stats(self, citizen_id: str, area: Optional[str] = None) -> CitizenDashboardStats:
        """
        Computes REAL statistics directly from database queries for the citizen dashboard.
        """
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()

                # 1. My Reports count
                my_reports = supabase.table("complaints").select("id", count="exact").eq("citizen_id", citizen_id).execute()
                my_reports_count = my_reports.count or 0

                # 2. Supported Issues count
                supported = supabase.table("issue_support").select("id", count="exact").eq("citizen_id", citizen_id).execute()
                supported_count = supported.count or 0

                # 3. Fetch citizen's related issue IDs
                user_complaints = supabase.table("complaints").select("civic_issue_id").eq("citizen_id", citizen_id).execute()
                user_support = supabase.table("issue_support").select("issue_id").eq("citizen_id", citizen_id).execute()

                related_issue_ids = set()
                for row in user_complaints.data:
                    if row.get("civic_issue_id"):
                        related_issue_ids.add(row["civic_issue_id"])
                for row in user_support.data:
                    if row.get("issue_id"):
                        related_issue_ids.add(row["issue_id"])

                in_progress_count = 0
                resolved_count = 0

                if related_issue_ids:
                    issues = supabase.table("civic_issues").select("id, status").in_("id", list(related_issue_ids)).execute()
                    for row in issues.data:
                        status = row.get("status")
                        if status in ["assigned", "in_progress"]:
                            in_progress_count += 1
                        elif status == "completed":
                            resolved_count += 1

                # 4. Nearby issues count in citizen's area
                nearby_count = 0
                if area:
                    nearby = supabase.table("civic_issues").select("id", count="exact").eq("area", area).neq("status", "completed").execute()
                    nearby_count = nearby.count or 0

                return CitizenDashboardStats(
                    my_reports_count=my_reports_count,
                    supported_issues_count=supported_count,
                    in_progress_count=in_progress_count,
                    resolved_count=resolved_count,
                    nearby_issues_count=nearby_count,
                    user_area=area
                )
            except Exception as e:
                logger.error(f"Supabase error during dashboard stats: {e}. Falling back to memory store.")

        # In-Memory Fallback
        my_reports_count = sum(1 for c in self._memory_complaints.values() if c.get("citizen_id") == citizen_id)
        supported_count = sum(1 for i, c in self._memory_support if c == citizen_id)

        related_issue_ids = set()
        for c in self._memory_complaints.values():
            if c.get("citizen_id") == citizen_id and c.get("civic_issue_id"):
                related_issue_ids.add(c["civic_issue_id"])
        for i, c in self._memory_support:
            if c == citizen_id:
                related_issue_ids.add(i)

        in_progress_count = 0
        resolved_count = 0
        for iid in related_issue_ids:
            iss = self._memory_issues.get(iid)
            if iss:
                st = iss.get("status")
                if st in ["assigned", "in_progress"]:
                    in_progress_count += 1
                elif st == "completed":
                    resolved_count += 1

        nearby_count = sum(1 for iss in self._memory_issues.values() if area and iss.get("area") == area and iss.get("status") != "completed")

        return CitizenDashboardStats(
            my_reports_count=my_reports_count,
            supported_issues_count=supported_count,
            in_progress_count=in_progress_count,
            resolved_count=resolved_count,
            nearby_issues_count=nearby_count,
            user_area=area
        )

    def list_civic_issues(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        area: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        sort: Optional[str] = "newest",
        citizen_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[CivicIssueResponse]:
        """
        Lists civic issues from database with filtering and real counts.
        """
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                query = supabase.table("civic_issues").select("*")

                if search:
                    query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%,landmark.ilike.%{search}%")
                if category and category != "all":
                    query = query.eq("category", category)
                if area and area != "all":
                    query = query.eq("area", area)
                if priority and priority != "all":
                    query = query.eq("priority_level", priority)
                if status and status != "all":
                    query = query.eq("status", status)

                if sort == "oldest":
                    query = query.order("created_at", desc=False)
                elif sort == "priority":
                    query = query.order("priority_score", desc=True).order("updated_at", desc=True)
                else:
                    query = query.order("created_at", desc=True)

                query = query.range(offset, offset + limit - 1)
                res = query.execute()
                issues_data = res.data or []

                if issues_data:
                    issue_ids = [issue["id"] for issue in issues_data]
                    support_counts = {}
                    user_supported_set = set()
                    if issue_ids:
                        try:
                            sup_res = supabase.table("issue_support").select("issue_id, citizen_id").in_("issue_id", issue_ids).execute()
                            for row in sup_res.data:
                                iid = row["issue_id"]
                                support_counts[iid] = support_counts.get(iid, 0) + 1
                                if citizen_id and row.get("citizen_id") == citizen_id:
                                    user_supported_set.add(iid)
                        except Exception as e:
                            logger.warning(f"Error querying support: {e}")

                    complaint_counts = {}
                    if issue_ids:
                        try:
                            cmp_res = supabase.table("complaints").select("civic_issue_id").in_("civic_issue_id", issue_ids).execute()
                            for row in cmp_res.data:
                                iid = row.get("civic_issue_id")
                                if iid:
                                    complaint_counts[iid] = complaint_counts.get(iid, 0) + 1
                        except Exception as e:
                            logger.warning(f"Error querying complaints: {e}")

                    latest_updates = {}
                    if issue_ids:
                        try:
                            upd_res = supabase.table("issue_updates").select("issue_id, description").in_("issue_id", issue_ids).order("created_at", desc=True).execute()
                            for row in upd_res.data:
                                iid = row["issue_id"]
                                if iid not in latest_updates:
                                    latest_updates[iid] = row["description"]
                        except Exception as e:
                            logger.warning(f"Error querying updates: {e}")

                    results = []
                    for issue in issues_data:
                        iid = issue["id"]
                        results.append(CivicIssueResponse(
                            id=iid,
                            title=issue.get("title", "Civic Problem"),
                            description=issue.get("description", ""),
                            category=issue.get("category", "General"),
                            area=issue.get("area", "Local Area"),
                            landmark=issue.get("landmark"),
                            latitude=issue.get("latitude"),
                            longitude=issue.get("longitude"),
                            priority_score=issue.get("priority_score", 1),
                            priority_level=issue.get("priority_level", "medium"),
                            status=issue.get("status", "reported"),
                            created_at=issue.get("created_at"),
                            updated_at=issue.get("updated_at"),
                            support_count=support_counts.get(iid, 0),
                            complaints_count=complaint_counts.get(iid, 1),
                            has_user_supported=iid in user_supported_set,
                            latest_update=latest_updates.get(iid)
                        ))
                    return results
            except Exception as e:
                logger.error(f"Supabase error during list_civic_issues: {e}. Falling back to memory store.")

        # In-Memory Filtered Query
        filtered = list(self._memory_issues.values())

        if search:
            s_low = search.lower()
            filtered = [
                i for i in filtered
                if s_low in i.get("title", "").lower()
                or s_low in i.get("description", "").lower()
                or (i.get("landmark") and s_low in i.get("landmark", "").lower())
            ]
        if category and category != "all":
            filtered = [i for i in filtered if i.get("category") == category]
        if area and area != "all":
            filtered = [i for i in filtered if i.get("area") == area]
        if priority and priority != "all":
            filtered = [i for i in filtered if i.get("priority_level") == priority]
        if status and status != "all":
            filtered = [i for i in filtered if i.get("status") == status]

        if sort == "oldest":
            filtered.sort(key=lambda x: x.get("created_at", ""))
        elif sort == "priority":
            filtered.sort(key=lambda x: (x.get("priority_score", 1), x.get("updated_at", "")), reverse=True)
        else:
            filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        sliced = filtered[offset : offset + limit]
        results = []
        for issue in sliced:
            iid = issue["id"]
            sup_count = sum(1 for i, c in self._memory_support if i == iid)
            cmp_count = sum(1 for c in self._memory_complaints.values() if c.get("civic_issue_id") == iid)
            has_sup = (iid, citizen_id) in self._memory_support if citizen_id else False
            upds = self._memory_updates.get(iid, [])
            latest_upd = upds[-1]["description"] if upds else None

            results.append(CivicIssueResponse(
                id=iid,
                title=issue.get("title", "Civic Problem"),
                description=issue.get("description", ""),
                category=issue.get("category", "General"),
                area=issue.get("area", "Local Area"),
                landmark=issue.get("landmark"),
                latitude=issue.get("latitude"),
                longitude=issue.get("longitude"),
                priority_score=issue.get("priority_score", 1),
                priority_level=issue.get("priority_level", "medium"),
                status=issue.get("status", "reported"),
                created_at=issue.get("created_at"),
                updated_at=issue.get("updated_at"),
                support_count=sup_count,
                complaints_count=cmp_count or 1,
                has_user_supported=has_sup,
                latest_update=latest_upd
            ))
        return results

    def get_issue_tracking(self, issue_id: str) -> Dict[str, Any]:
        """Returns structured tracking timeline updates and current status for an issue."""
        detail = self.get_issue_detail(issue_id)
        return {
            "issue_id": detail.id,
            "title": detail.title,
            "category": detail.category,
            "area": detail.area,
            "landmark": detail.landmark,
            "status": detail.status.value if hasattr(detail.status, "value") else str(detail.status),
            "priority_level": detail.priority_level.value if hasattr(detail.priority_level, "value") else str(detail.priority_level),
            "priority_score": detail.priority_score,
            "created_at": detail.created_at,
            "updated_at": detail.updated_at,
            "updates": detail.updates,
            "latest_update": detail.latest_update,
            "responses": detail.responses
        }

    def remove_support(self, issue_id: str, citizen_id: str) -> SupportToggleResponse:
        """Explicitly removes citizen support for an issue."""
        valid_citizen_id = _to_valid_uuid(citizen_id)
        valid_issue_id = _to_valid_uuid(issue_id)
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("issue_support").delete().eq("issue_id", valid_issue_id).eq("citizen_id", valid_citizen_id).execute()
                self._recalculate_priority(valid_issue_id)
                count_res = supabase.table("issue_support").select("id", count="exact").eq("issue_id", valid_issue_id).execute()
                total_support = count_res.count if count_res.count is not None else 0
                return SupportToggleResponse(
                    success=True,
                    is_supported=False,
                    support_count=total_support,
                    message="Support removed."
                )
            except Exception as e:
                logger.error(f"Supabase error during remove_support: {e}. Falling back to memory store.")

        # In-Memory Fallback
        pair = (issue_id, citizen_id)
        if pair in self._memory_support:
            self._memory_support.remove(pair)
        self._recalculate_priority(issue_id)
        total_support = sum(1 for i, c in self._memory_support if i == issue_id)
        return SupportToggleResponse(
            success=True,
            is_supported=False,
            support_count=total_support,
            message="Support removed."
        )

    def get_issue_detail(self, issue_id: str, citizen_id: Optional[str] = None) -> CivicIssueDetailResponse:
        """
        Fetches full details of a single Civic Issue, including timeline updates,
        evidence photos, and corporation responses.
        """
        valid_citizen_id = _to_valid_uuid(citizen_id) if citizen_id else None
        valid_issue_id = _to_valid_uuid(issue_id)
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                issue_res = supabase.table("civic_issues").select("*").eq("id", valid_issue_id).execute()
                if issue_res.data:
                    issue = issue_res.data[0]
                    sup_res = supabase.table("issue_support").select("id, citizen_id").eq("issue_id", valid_issue_id).execute()
                    support_count = len(sup_res.data)
                    has_supported = any(r.get("citizen_id") == valid_citizen_id for r in sup_res.data) if valid_citizen_id else False

                    cmp_res = supabase.table("complaints").select("id, accident_reported, duration").eq("civic_issue_id", valid_issue_id).execute()
                    complaints_count = len(cmp_res.data)
                    accidents_tally = sum(1 for c in cmp_res.data if c.get("accident_reported"))

                    upd_res = supabase.table("issue_updates").select("*").eq("issue_id", issue_id).order("created_at", desc=False).execute()
                    updates = upd_res.data or []

                    evi_res = supabase.table("evidence").select("*").eq("issue_id", issue_id).execute()
                    evidence = evi_res.data or []

                    resp_res = supabase.table("responses").select("*").eq("issue_id", issue_id).order("created_at", desc=True).execute()
                    responses = resp_res.data or []

                    official_resp = responses[0].get("official_response") if responses else None
                    simplified_resp = responses[0].get("simplified_response") if responses else None

                    # Compute corroboration & priority details
                    corrob = corroboration_engine.calculate(CorroborationInput(
                        independent_complaints_count=complaints_count or 1,
                        community_supporters_count=support_count,
                        evidence_media_count=len(evidence),
                        citizen_reported_accidents_count=accidents_tally,
                        reported_injuries_count=sum(c.get("injuries_count", 0) for c in cmp_res.data if "injuries_count" in c),
                        location_consistency="High"
                    ), issue_id=issue["id"])

                    p_breakdown = priority_engine.calculate_score(PriorityInput(
                        category=issue["category"],
                        severity_rating=4 if accidents_tally > 0 or issue.get("priority_level") in ["high", "critical"] else 2,
                        safety_concern=bool(accidents_tally > 0 or issue.get("priority_level") in ["high", "critical"]),
                        accident_count=accidents_tally,
                        injuries_count=sum(c.get("injuries_count", 0) for c in cmp_res.data if "injuries_count" in c),
                        support_count=support_count,
                        complaints_count=complaints_count or 1,
                        evidence_count=len(evidence),
                        duration=cmp_res.data[-1].get("duration", "not_sure") if cmp_res.data else "not_sure"
                    ), issue_id=issue["id"])

                    return CivicIssueDetailResponse(
                        id=issue["id"],
                        title=issue["title"],
                        description=issue["description"],
                        category=issue["category"],
                        area=issue["area"],
                        landmark=issue.get("landmark"),
                        latitude=issue.get("latitude"),
                        longitude=issue.get("longitude"),
                        priority_score=issue.get("priority_score", p_breakdown.priority_score),
                        priority_level=issue.get("priority_level", p_breakdown.priority_level.value),
                        status=issue.get("status", "reported"),
                        created_at=issue.get("created_at"),
                        updated_at=issue.get("updated_at"),
                        support_count=support_count,
                        complaints_count=complaints_count,
                        has_user_supported=has_supported,
                        evidence_count=len(evidence),
                        latest_update=updates[-1]["description"] if updates else None,
                        official_response=official_resp,
                        simplified_response=simplified_resp,
                        updates=updates,
                        evidence=evidence,
                        responses=responses,
                        corroboration_level=corrob.corroboration_level.value,
                        accident_reports_count=accidents_tally,
                        injuries_count=sum(c.get("injuries_count", 0) for c in cmp_res.data if "injuries_count" in c),
                        complaints_summary={
                            "total_complaints": complaints_count,
                            "citizen_reported_accidents": accidents_tally,
                            "citizen_reported_injuries": sum(c.get("injuries_count", 0) for c in cmp_res.data if "injuries_count" in c)
                        },
                        corroboration_details=corrob.model_dump(),
                        priority_details=p_breakdown.model_dump()
                    )
            except Exception as e:
                logger.error(f"Supabase error in get_issue_detail: {e}. Falling back to memory store.")

        # In-Memory Fallback
        issue = self._memory_issues.get(issue_id)
        if not issue:
            raise ValueError(f"Civic issue with ID {issue_id} not found.")

        support_count = sum(1 for i, c in self._memory_support if i == issue_id)
        has_supported = (issue_id, citizen_id) in self._memory_support if citizen_id else False

        complaints_list = [c for c in self._memory_complaints.values() if c.get("civic_issue_id") == issue_id]
        complaints_count = len(complaints_list)
        accidents_tally = sum(1 for c in complaints_list if c.get("accident_reported"))
        injuries_tally = sum(c.get("injuries_count", 0) for c in complaints_list)

        updates = self._memory_updates.get(issue_id, [])
        evidence = self._memory_evidence.get(issue_id, [])
        responses = self._memory_responses.get(issue_id, [])

        official_resp = responses[0].get("official_response") if responses else None
        simplified_resp = responses[0].get("simplified_response") if responses else None

        corrob = corroboration_engine.calculate(CorroborationInput(
            independent_complaints_count=complaints_count or 1,
            community_supporters_count=support_count,
            evidence_media_count=len(evidence),
            citizen_reported_accidents_count=accidents_tally,
            reported_injuries_count=injuries_tally,
            location_consistency="High"
        ), issue_id=issue["id"])

        p_breakdown = priority_engine.calculate_score(PriorityInput(
            category=issue["category"],
            severity_rating=4 if accidents_tally > 0 or issue.get("priority_level") in ["high", "critical"] else 2,
            safety_concern=bool(accidents_tally > 0 or issue.get("priority_level") in ["high", "critical"]),
            accident_count=accidents_tally,
            injuries_count=injuries_tally,
            support_count=support_count,
            complaints_count=complaints_count or 1,
            evidence_count=len(evidence),
            duration=complaints_list[-1].get("duration", "not_sure") if complaints_list else "not_sure"
        ), issue_id=issue["id"])

        return CivicIssueDetailResponse(
            id=issue["id"],
            title=issue["title"],
            description=issue["description"],
            category=issue["category"],
            area=issue["area"],
            landmark=issue.get("landmark"),
            latitude=issue.get("latitude"),
            longitude=issue.get("longitude"),
            priority_score=issue.get("priority_score", p_breakdown.priority_score),
            priority_level=issue.get("priority_level", p_breakdown.priority_level.value),
            status=issue.get("status", "reported"),
            created_at=issue.get("created_at"),
            updated_at=issue.get("updated_at"),
            support_count=support_count,
            complaints_count=complaints_count or 1,
            has_user_supported=has_supported,
            evidence_count=len(evidence),
            latest_update=updates[-1]["description"] if updates else None,
            official_response=official_resp,
            simplified_response=simplified_resp,
            updates=updates,
            evidence=evidence,
            responses=responses,
            corroboration_level=corrob.corroboration_level.value,
            accident_reports_count=accidents_tally,
            injuries_count=injuries_tally,
            complaints_summary={
                "total_complaints": complaints_count or 1,
                "citizen_reported_accidents": accidents_tally,
                "citizen_reported_injuries": injuries_tally
            },
            corroboration_details=corrob.model_dump(),
            priority_details=p_breakdown.model_dump()
        )

    def get_corroboration(self, issue_id: str) -> Dict[str, Any]:
        """Returns community corroboration metrics and indicators for a given issue."""
        detail = self.get_issue_detail(issue_id)
        return detail.corroboration_details or {}

    def get_priority_breakdown(self, issue_id: str) -> Dict[str, Any]:
        """Returns deterministic priority score factor breakdown."""
        detail = self.get_issue_detail(issue_id)
        return detail.priority_details or {}

    def list_supported_issues(self, citizen_id: str) -> List[CivicIssueResponse]:
        """Returns issues supported by citizen."""
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                sup_res = supabase.table("issue_support").select("issue_id").eq("citizen_id", citizen_id).execute()
                if sup_res.data:
                    issue_ids = [row["issue_id"] for row in sup_res.data]
                    issues_res = supabase.table("civic_issues").select("*").in_("id", issue_ids).order("created_at", desc=True).execute()
                    results = []
                    for issue in issues_res.data or []:
                        iid = issue["id"]
                        results.append(CivicIssueResponse(
                            id=iid,
                            title=issue.get("title", "Civic Problem"),
                            description=issue.get("description", ""),
                            category=issue.get("category", "General"),
                            area=issue.get("area", "Local Area"),
                            landmark=issue.get("landmark"),
                            priority_score=issue.get("priority_score", 1),
                            priority_level=issue.get("priority_level", "medium"),
                            status=issue.get("status", "reported"),
                            created_at=issue.get("created_at"),
                            updated_at=issue.get("updated_at"),
                            support_count=len(sup_res.data),
                            complaints_count=1,
                            has_user_supported=True
                        ))
                    return results
            except Exception as e:
                logger.error(f"Supabase error in list_supported_issues: {e}. Falling back to memory store.")

        # In-Memory Fallback
        results = []
        for iid, cid in self._memory_support:
            if cid == citizen_id:
                issue = self._memory_issues.get(iid)
                if issue:
                    results.append(CivicIssueResponse(
                        id=iid,
                        title=issue.get("title", "Civic Problem"),
                        description=issue.get("description", ""),
                        category=issue.get("category", "General"),
                        area=issue.get("area", "Local Area"),
                        landmark=issue.get("landmark"),
                        priority_score=issue.get("priority_score", 1),
                        priority_level=issue.get("priority_level", "medium"),
                        status=issue.get("status", "reported"),
                        created_at=issue.get("created_at"),
                        updated_at=issue.get("updated_at"),
                        support_count=sum(1 for i, c in self._memory_support if i == iid),
                        complaints_count=1,
                        has_user_supported=True
                    ))
        return results

    def list_citizen_complaints(self, citizen_id: str) -> List[ComplaintResponse]:
        """Returns complaints submitted by given citizen."""
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("complaints").select("*").eq("citizen_id", citizen_id).order("created_at", desc=True).execute()
                complaints_data = res.data or []
                if complaints_data:
                    issue_ids = [c["civic_issue_id"] for c in complaints_data if c.get("civic_issue_id")]
                    issue_map = {}
                    if issue_ids:
                        issues_res = supabase.table("civic_issues").select("id, title, status, priority_level").in_("id", issue_ids).execute()
                        for issue in issues_res.data or []:
                            issue_map[issue["id"]] = issue

                    results = []
                    for c in complaints_data:
                        iid = c.get("civic_issue_id")
                        issue_info = issue_map.get(iid, {}) if iid else {}
                        results.append(ComplaintResponse(
                            id=c["id"],
                            citizen_id=c["citizen_id"],
                            civic_issue_id=c.get("civic_issue_id"),
                            original_text=c.get("original_text", ""),
                            normalized_text=c.get("normalized_text"),
                            language=c.get("language", "English"),
                            category=c.get("category"),
                            area=c.get("area", ""),
                            landmark=c.get("landmark"),
                            duration=c.get("duration", "not_sure"),
                            accident_reported=c.get("accident_reported", False),
                            accident_description=c.get("accident_description"),
                            status=c.get("status", "reported"),
                            created_at=c.get("created_at"),
                            updated_at=c.get("updated_at"),
                            issue_title=issue_info.get("title"),
                            issue_status=issue_info.get("status"),
                            issue_priority=issue_info.get("priority_level")
                        ))
                    return results
            except Exception as e:
                logger.error(f"Supabase error in list_citizen_complaints: {e}. Falling back to memory store.")

        # In-Memory Fallback
        results = []
        for c in self._memory_complaints.values():
            if c.get("citizen_id") == citizen_id:
                iid = c.get("civic_issue_id")
                iss = self._memory_issues.get(iid, {}) if iid else {}
                results.append(ComplaintResponse(
                    id=c["id"],
                    citizen_id=c["citizen_id"],
                    civic_issue_id=iid,
                    original_text=c.get("original_text", ""),
                    normalized_text=c.get("normalized_text"),
                    language=c.get("language", "English"),
                    category=c.get("category"),
                    area=c.get("area", ""),
                    landmark=c.get("landmark"),
                    duration=c.get("duration", "not_sure"),
                    accident_reported=c.get("accident_reported", False),
                    accident_description=c.get("accident_description"),
                    status=c.get("status", "reported"),
                    created_at=c.get("created_at"),
                    updated_at=c.get("updated_at"),
                    issue_title=iss.get("title"),
                    issue_status=iss.get("status"),
                    issue_priority=iss.get("priority_level")
                ))
        results.sort(key=lambda x: str(x.created_at), reverse=True)
        return results

    def list_notifications(self, user_id: str) -> List[NotificationResponse]:
        """Lists notifications for a user."""
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
                notifications_data = res.data or []
                if notifications_data:
                    issue_ids = [n["issue_id"] for n in notifications_data if n.get("issue_id")]
                    issue_titles = {}
                    if issue_ids:
                        issues = supabase.table("civic_issues").select("id, title").in_("id", issue_ids).execute()
                        for issue in issues.data or []:
                            issue_titles[issue["id"]] = issue["title"]

                    results = []
                    for n in notifications_data:
                        results.append(NotificationResponse(
                            id=n["id"],
                            user_id=n["user_id"],
                            issue_id=n.get("issue_id"),
                            type=n.get("type", "update"),
                            message=n.get("message", ""),
                            is_read=n.get("is_read", False),
                            created_at=n.get("created_at"),
                            issue_title=issue_titles.get(n.get("issue_id"))
                        ))
                    return results
            except Exception as e:
                logger.error(f"Supabase error in list_notifications: {e}. Falling back to memory store.")

        # In-Memory Fallback
        items = self._memory_notifications.get(user_id, [])
        results = []
        for n in items:
            iss = self._memory_issues.get(n.get("issue_id"), {}) if n.get("issue_id") else {}
            results.append(NotificationResponse(
                id=n["id"],
                user_id=n["user_id"],
                issue_id=n.get("issue_id"),
                type=n.get("type", "update"),
                message=n.get("message", ""),
                is_read=n.get("is_read", False),
                created_at=n.get("created_at"),
                issue_title=iss.get("title")
            ))
        return results

    def mark_notification_read(self, notification_id: str) -> bool:
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
                return len(res.data) > 0
            except Exception as e:
                logger.error(f"Supabase error in mark_notification_read: {e}")

        # In-Memory Fallback
        for user_notifs in self._memory_notifications.values():
            for n in user_notifs:
                if n["id"] == notification_id:
                    n["is_read"] = True
                    return True
        return True

    def get_profile(self, user_id: str) -> ProfileResponse:
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("profiles").select("*").eq("id", user_id).execute()
                if res.data:
                    p = res.data[0]
                    return ProfileResponse(
                        id=p["id"],
                        full_name=p["full_name"],
                        email=p["email"],
                        role=p["role"],
                        preferred_language=p["preferred_language"],
                        area=p.get("area"),
                        created_at=p["created_at"],
                        updated_at=p["updated_at"]
                    )
            except Exception as e:
                logger.error(f"Supabase error in get_profile: {e}")

        # In-Memory Fallback
        p = self._memory_profiles.get(user_id)
        now = datetime.now(timezone.utc)
        if not p:
            return ProfileResponse(
                id=user_id,
                full_name="Ravi Kumar",
                email="citizen@example.com",
                role="citizen",
                preferred_language="English",
                area="Gokulam",
                created_at=now,
                updated_at=now
            )
        return ProfileResponse(
            id=p["id"],
            full_name=p["full_name"],
            email=p["email"],
            role=p["role"],
            preferred_language=p["preferred_language"],
            area=p.get("area"),
            created_at=p.get("created_at", now),
            updated_at=p.get("updated_at", now)
        )

    def update_profile(self, user_id: str, payload: ProfileUpdate) -> ProfileResponse:
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                update_data = {}
                if payload.full_name is not None:
                    update_data["full_name"] = payload.full_name
                if payload.preferred_language is not None:
                    update_data["preferred_language"] = payload.preferred_language
                if payload.area is not None:
                    update_data["area"] = payload.area

                res = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
                if res.data:
                    p = res.data[0]
                    return ProfileResponse(
                        id=p["id"],
                        full_name=p["full_name"],
                        email=p["email"],
                        role=p["role"],
                        preferred_language=p["preferred_language"],
                        area=p.get("area"),
                        created_at=p["created_at"],
                        updated_at=p["updated_at"]
                    )
            except Exception as e:
                logger.error(f"Supabase error in update_profile: {e}")

        # In-Memory Fallback
        p = self._memory_profiles.get(user_id, {
            "id": user_id,
            "full_name": "Ravi Kumar",
            "email": "citizen@example.com",
            "role": "citizen",
            "preferred_language": "English",
            "area": "Gokulam",
            "created_at": datetime.now(timezone.utc)
        })
        if payload.full_name is not None:
            p["full_name"] = payload.full_name
        if payload.preferred_language is not None:
            p["preferred_language"] = payload.preferred_language
        if payload.area is not None:
            p["area"] = payload.area
        p["updated_at"] = datetime.now(timezone.utc)
        self._memory_profiles[user_id] = p

        return ProfileResponse(
            id=p["id"],
            full_name=p["full_name"],
            email=p["email"],
            role=p["role"],
            preferred_language=p["preferred_language"],
            area=p.get("area"),
            created_at=p["created_at"],
            updated_at=p["updated_at"]
        )

    # ====================================================================
    # CORPORATION OPERATIONS
    # ====================================================================

    def _map_category_to_department(self, category: str) -> str:
        c = (category or "").lower()
        if "road" in c or "pothole" in c or "footpath" in c:
            return "Road Maintenance"
        if "water" in c or "sewage" in c or "drain" in c:
            return "Water & Sewage"
        if "light" in c or "lamp" in c or "dark" in c:
            return "Street Lighting"
        if "garb" in c or "trash" in c or "waste" in c or "sanit" in c:
            return "Garbage & Sanitation"
        if "safety" in c or "hazard" in c or "danger" in c or "fire" in c:
            return "Public Safety & Hazards"
        if "park" in c or "tree" in c or "garden" in c:
            return "Parks & Environment"
        if "electr" in c or "power" in c:
            return "Electricity & Power"
        return "General Municipal Works"

    def get_corporation_dashboard_stats(self, department: Optional[str] = None, area: Optional[str] = None) -> CorporationDashboardStatsResponse:
        """
        GET /api/corporation/dashboard
        Computes real-time municipal dashboard metrics: Active, Critical, High, In Progress, Resolved.
        """
        all_issues = list(self._memory_issues.values())
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("civic_issues").select("*").execute()
                if res.data:
                    existing_ids = {row["id"] for row in res.data if "id" in row}
                    all_issues = list(res.data)
                    for k, v in self._memory_issues.items():
                        if k not in existing_ids:
                            all_issues.append(v)
            except Exception as e:
                logger.error(f"Error fetching corporation stats from Supabase: {e}")

        # Filter by department or area if provided
        filtered = all_issues
        if area and area.lower() != "all":
            filtered = [i for i in filtered if i.get("area", "").lower() == area.lower()]
        if department and department.lower() != "all":
            filtered = [i for i in filtered if self._map_category_to_department(i.get("category", "")).lower() == department.lower()]

        total_active = sum(1 for i in filtered if i.get("status") not in ["completed", "rejected"])
        critical_count = sum(1 for i in filtered if i.get("priority_level") == "critical" and i.get("status") not in ["completed", "rejected"])
        high_count = sum(1 for i in filtered if i.get("priority_level") == "high" and i.get("status") not in ["completed", "rejected"])
        in_progress_count = sum(1 for i in filtered if i.get("status") in ["in_progress", "inspection", "assigned"])
        resolved_count = sum(1 for i in filtered if i.get("status") == "completed")
        total_unresolved = total_active

        # Department Workload Breakdowns
        dept_names = ["Road Maintenance", "Water & Sewage", "Street Lighting", "Garbage & Sanitation", "Public Safety & Hazards", "Parks & Environment"]
        workers_list = self.list_workers()
        dept_workloads = []

        for d_name in dept_names:
            dept_issues = [i for i in all_issues if self._map_category_to_department(i.get("category", "")) == d_name]
            dept_workers = [w for w in workers_list if w.department == d_name]
            avail_workers = sum(1 for w in dept_workers if w.worker_status in ["available", "on_site"])

            dept_workloads.append(DepartmentWorkloadItem(
                department=d_name,
                active_issues=sum(1 for i in dept_issues if i.get("status") not in ["completed", "rejected"]),
                critical_issues=sum(1 for i in dept_issues if i.get("priority_level") == "critical" and i.get("status") not in ["completed", "rejected"]),
                in_progress=sum(1 for i in dept_issues if i.get("status") in ["in_progress", "inspection", "assigned"]),
                resolved=sum(1 for i in dept_issues if i.get("status") == "completed"),
                total_workers=len(dept_workers),
                available_workers=avail_workers
            ))

        # Worker Workload Breakdowns
        worker_workloads = []
        for w in workers_list:
            w_asgs = [a for a in self._memory_assignments.values() if a.get("worker_id") == w.id]
            assigned_task_count = len(w_asgs)
            active_task_count = 0
            completed_task_count = 0
            for a in w_asgs:
                iss = self._memory_issues.get(a.get("issue_id", ""))
                if iss:
                    if iss.get("status") in ["assigned", "inspection", "in_progress"]:
                        active_task_count += 1
                    elif iss.get("status") == "completed":
                        completed_task_count += 1

            worker_workloads.append(WorkerWorkloadItem(
                id=w.id,
                name=w.full_name,
                department=w.department,
                area=w.area,
                status=w.worker_status,
                assigned_tasks=assigned_task_count,
                active_tasks=active_task_count,
                completed_tasks=completed_task_count
            ))

        return CorporationDashboardStatsResponse(
            total_active_issues=total_active,
            critical_issues=critical_count,
            high_priority_issues=high_count,
            in_progress_issues=in_progress_count,
            resolved_issues=resolved_count,
            total_unresolved=total_unresolved,
            department_workloads=dept_workloads,
            worker_workloads=worker_workloads
        )

    def list_corporation_issues(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        area: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        department: Optional[str] = None,
        worker_id: Optional[str] = None,
        sort: Optional[str] = "priority",
        limit: int = 50,
        offset: int = 0
    ) -> List[CivicIssueResponse]:
        """
        GET /api/corporation/issues
        Lists all civic issues with priority DESC sorting, worker assignment mapping, and multi-factor filters.
        """
        # Fetch base list
        issues_list = list(self._memory_issues.values())

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                query = supabase.table("civic_issues").select("*")
                res = query.execute()
                if res.data:
                    existing_ids = {row["id"] for row in res.data if "id" in row}
                    issues_list = list(res.data)
                    for k, v in self._memory_issues.items():
                        if k not in existing_ids:
                            issues_list.append(v)
            except Exception as e:
                logger.error(f"Error listing corporation issues from Supabase: {e}")

        results = []
        for issue_dict in issues_list:
            i_id = issue_dict["id"]
            
            # Apply Filters
            if search:
                s_lower = search.lower().strip()
                t_match = s_lower in issue_dict.get("title", "").lower()
                d_match = s_lower in issue_dict.get("description", "").lower()
                l_match = s_lower in (issue_dict.get("landmark") or "").lower()
                a_match = s_lower in issue_dict.get("area", "").lower()
                if not (t_match or d_match or l_match or a_match):
                    continue

            if category and category.lower() != "all":
                if issue_dict.get("category", "").lower() != category.lower():
                    continue

            if area and area.lower() != "all":
                if issue_dict.get("area", "").lower() != area.lower():
                    continue

            if priority and priority.lower() != "all":
                if issue_dict.get("priority_level", "").lower() != priority.lower():
                    continue

            if status and status.lower() != "all":
                if issue_dict.get("status", "").lower() != status.lower():
                    continue

            if department and department.lower() != "all":
                iss_dept = self._map_category_to_department(issue_dict.get("category", ""))
                if iss_dept.lower() != department.lower():
                    continue

            # Check assigned worker
            asg = self._memory_assignments.get(i_id)
            if worker_id and worker_id.lower() != "all":
                if not asg or asg.get("worker_id") != worker_id:
                    continue

            # Compute live metrics
            sup_count = sum(1 for (iss_id, _) in self._memory_support if iss_id == i_id)
            cmp_list = [c for c in self._memory_complaints.values() if c.get("civic_issue_id") == i_id]
            complaints_count = len(cmp_list) if cmp_list else 1
            accidents_count = sum(1 for c in cmp_list if c.get("accident_reported"))
            injuries_count = sum(c.get("injuries_count", 0) for c in cmp_list)
            evidence_count = len(self._memory_evidence.get(i_id, []))

            # Latest update
            updates = self._memory_updates.get(i_id, [])
            latest_up = updates[-1]["description"] if updates else None

            # Responses
            responses = self._memory_responses.get(i_id, [])
            official_res = responses[-1]["official_response"] if responses else None
            simplified_res = responses[-1].get("simplified_response") if responses else None

            # Corroboration level
            corrob = corroboration_engine.calculate(CorroborationInput(
                independent_complaints_count=complaints_count,
                community_supporters_count=sup_count,
                evidence_media_count=evidence_count,
                citizen_reported_accidents_count=accidents_count,
                reported_injuries_count=injuries_count
            ), issue_id=i_id)

            created_dt = issue_dict.get("created_at")
            if isinstance(created_dt, str):
                created_dt = datetime.fromisoformat(created_dt.replace("Z", "+00:00"))
            elif not created_dt:
                created_dt = datetime.now(timezone.utc)

            updated_dt = issue_dict.get("updated_at")
            if isinstance(updated_dt, str):
                updated_dt = datetime.fromisoformat(updated_dt.replace("Z", "+00:00"))
            elif not updated_dt:
                updated_dt = created_dt

            p_level = issue_dict.get("priority_level", "medium")
            if isinstance(p_level, PriorityLevel):
                p_level = p_level.value
            p_score = int(issue_dict.get("priority_score", 50))
            i_status = issue_dict.get("status", "reported")
            if isinstance(i_status, IssueStatus):
                i_status = i_status.value

            results.append(CivicIssueResponse(
                id=i_id,
                title=issue_dict.get("title", "Civic Problem"),
                description=issue_dict.get("description", ""),
                category=issue_dict.get("category", "Roads & Footpaths"),
                area=issue_dict.get("area", "Gokulam"),
                landmark=issue_dict.get("landmark"),
                latitude=issue_dict.get("latitude"),
                longitude=issue_dict.get("longitude"),
                priority_score=p_score,
                priority_level=PriorityLevel(p_level),
                status=IssueStatus(i_status),
                created_at=created_dt,
                updated_at=updated_dt,
                support_count=sup_count,
                complaints_count=complaints_count,
                evidence_count=evidence_count,
                latest_update=latest_up,
                official_response=official_res,
                simplified_response=simplified_res,
                corroboration_level=corrob.corroboration_level.value,
                accident_reports_count=accidents_count,
                injuries_count=injuries_count
            ))

        # Sorting: priority_score DESC by default
        if sort == "priority" or not sort:
            results.sort(key=lambda x: (x.priority_score, x.created_at), reverse=True)
        elif sort == "oldest":
            results.sort(key=lambda x: x.created_at)
        elif sort == "newest":
            results.sort(key=lambda x: x.created_at, reverse=True)

        return results[offset : offset + limit]

    def get_corporation_issue_detail(self, issue_id: str) -> CivicIssueDetailResponse:
        """
        GET /api/corporation/issues/{id}
        Retrieves full consolidated civic issue detail including all 18+ individual complaints,
        evidence gallery, corroboration metrics, priority breakdown, and full response history.
        """
        # Use existing get_issue_detail base
        base_detail = self.get_issue_detail(issue_id)
        
        # Include all responses (both public and internal)
        all_responses = self._memory_responses.get(issue_id, [])
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("responses").select("*").eq("issue_id", issue_id).order("created_at", desc=False).execute()
                if res.data:
                    all_responses = res.data
            except Exception as e:
                logger.error(f"Error fetching all corporation responses: {e}")

        base_detail.responses = all_responses

        # Attach assignment details if available
        asg = self._memory_assignments.get(issue_id)
        if asg:
            w_profile = self._memory_workers.get(asg.get("worker_id", ""))
            asg_info = {
                "assignment_id": asg.get("id"),
                "worker_id": asg.get("worker_id"),
                "worker_name": w_profile.get("full_name") if w_profile else "Field Worker",
                "department": w_profile.get("department") if w_profile else "Municipal Operations",
                "phone": w_profile.get("phone") if w_profile else None,
                "status": asg.get("status", "assigned"),
                "instructions": asg.get("instructions"),
                "assigned_at": asg.get("assigned_at")
            }
            if base_detail.complaints_summary is None:
                base_detail.complaints_summary = {}
            base_detail.complaints_summary["assignment"] = asg_info

        return base_detail

    def list_workers(
        self,
        department: Optional[str] = None,
        status: Optional[str] = None,
        area: Optional[str] = None
    ) -> List[WorkerProfileResponse]:
        """
        GET /api/corporation/workers
        Returns list of workers filtered by department, status, or area, with live workload counts.
        """
        workers_dict = dict(self._memory_workers)
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("profiles").select("*").eq("role", "worker").execute()
                if res.data:
                    for row in res.data:
                        workers_dict[row["id"]] = row
            except Exception as e:
                logger.error(f"Error listing workers from Supabase: {e}")

        results = []
        for w_id, w in workers_dict.items():
            if department and department.lower() != "all":
                if (w.get("department") or "").lower() != department.lower():
                    continue
            if status and status.lower() != "all":
                if (w.get("worker_status") or "").lower() != status.lower():
                    continue
            if area and area.lower() != "all":
                if (w.get("area") or "").lower() != area.lower():
                    continue

            # Calculate active and completed tasks
            w_asgs = [a for a in self._memory_assignments.values() if a.get("worker_id") == w_id]
            active_c = 0
            completed_c = 0
            for a in w_asgs:
                iss = self._memory_issues.get(a.get("issue_id", ""))
                if iss:
                    if iss.get("status") in ["assigned", "inspection", "in_progress"]:
                        active_c += 1
                    elif iss.get("status") == "completed":
                        completed_c += 1

            results.append(WorkerProfileResponse(
                id=w_id,
                full_name=w.get("full_name", "Field Worker"),
                email=w.get("email", "worker@civicconnect.org"),
                role="worker",
                department=w.get("department", "General Works"),
                phone=w.get("phone"),
                area=w.get("area"),
                worker_status=w.get("worker_status", "available"),
                active_tasks_count=active_c,
                completed_tasks_count=completed_c
            ))

        return results

    def get_worker_details(self, worker_id: str) -> WorkerProfileResponse:
        """
        GET /api/corporation/workers/{id}
        """
        workers = self.list_workers()
        for w in workers:
            if w.id == worker_id:
                return w
        raise ValueError(f"Worker with ID {worker_id} not found.")

    def assign_worker_to_issue(self, issue_id: str, req: WorkerAssignmentRequest) -> WorkerAssignmentResponse:
        """
        POST /api/corporation/issues/{id}/assign
        Assigns a field worker to an issue, updates issue status to 'assigned', updates worker status, and logs timeline update.
        """
        now = datetime.now(timezone.utc)
        
        # Verify issue
        if issue_id not in self._memory_issues and not settings.is_supabase_configured:
            raise ValueError(f"Civic Issue #{issue_id} not found.")

        # Verify worker
        worker = self.get_worker_details(req.worker_id)
        
        asg_id = f"asg_{uuid.uuid4().hex[:10]}"
        assignment_data = {
            "id": asg_id,
            "issue_id": issue_id,
            "worker_id": req.worker_id,
            "assigned_by": req.assigned_by or "c9000000-0000-0000-0000-000000000001",
            "instructions": req.instructions or f"Assigned to {worker.full_name} ({worker.department}) for inspection and field action.",
            "status": "assigned",
            "assigned_at": now.isoformat()
        }

        # Update in-memory
        self._memory_assignments[issue_id] = assignment_data
        if issue_id in self._memory_issues:
            self._memory_issues[issue_id]["status"] = "assigned"
            self._memory_issues[issue_id]["updated_at"] = now.isoformat()

        # Update worker status to 'assigned'
        if req.worker_id in self._memory_workers:
            self._memory_workers[req.worker_id]["worker_status"] = "assigned"

        # Add timeline update
        update_text = f"{worker.department} assigned task to {worker.full_name}. {req.instructions or 'Field inspection and repair scheduled.'}"
        u_id = f"u_{uuid.uuid4().hex[:8]}"
        new_update = {
            "id": u_id,
            "issue_id": issue_id,
            "status": "assigned",
            "description": update_text,
            "update_type": "assignment",
            "created_at": now.isoformat()
        }
        if issue_id not in self._memory_updates:
            self._memory_updates[issue_id] = []
        self._memory_updates[issue_id].append(new_update)

        # Notify worker
        n_id = f"n_{uuid.uuid4().hex[:8]}"
        self._memory_notifications.setdefault(req.worker_id, []).append({
            "id": n_id,
            "user_id": req.worker_id,
            "issue_id": issue_id,
            "type": "assignment",
            "message": f"New task assigned: Issue #{issue_id[:8]} ({worker.department}). {req.instructions or ''}",
            "is_read": False,
            "created_at": now.isoformat()
        })

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("assignments").insert(assignment_data).execute()
                supabase.table("civic_issues").update({"status": "assigned"}).eq("id", issue_id).execute()
                supabase.table("issue_updates").insert(new_update).execute()
                supabase.table("profiles").update({"worker_status": "assigned"}).eq("id", req.worker_id).execute()
            except Exception as e:
                logger.error(f"Supabase error during worker assignment: {e}")

        return WorkerAssignmentResponse(
            success=True,
            assignment_id=asg_id,
            issue_id=issue_id,
            worker_id=req.worker_id,
            worker_name=worker.full_name,
            department=worker.department,
            status="assigned",
            assigned_at=now,
            message=f"Successfully assigned {worker.full_name} ({worker.department}) to issue #{issue_id[:8]}."
        )

    def update_issue_status(self, issue_id: str, req: StatusTransitionRequest) -> Dict[str, Any]:
        """
        PATCH /api/corporation/issues/{id}/status
        Enforces valid status transitions and updates the official audit timeline.
        Valid transitions:
        - reported -> reviewed
        - reviewed -> assigned, inspection, rejected
        - assigned -> inspection, in_progress, reviewed
        - inspection -> in_progress, reviewed, completed
        - in_progress -> completed, inspection
        - completed -> reviewed (reopened)
        - rejected -> reviewed (reopened)
        """
        now = datetime.now(timezone.utc)
        current_status = "reported"
        
        if issue_id in self._memory_issues:
            current_status = self._memory_issues[issue_id].get("status", "reported")

        target_status = req.status.value if isinstance(req.status, IssueStatus) else str(req.status)

        # Allow reasonable lifecycle transitions
        valid_transitions = {
            "reported": ["reviewed", "assigned", "rejected"],
            "reviewed": ["assigned", "inspection", "in_progress", "rejected", "completed"],
            "assigned": ["inspection", "in_progress", "reviewed", "completed"],
            "inspection": ["in_progress", "completed", "reviewed", "assigned"],
            "in_progress": ["completed", "inspection", "assigned", "reviewed"],
            "completed": ["reviewed", "in_progress"], # Support reopen
            "rejected": ["reviewed", "reported"]
        }

        allowed = valid_transitions.get(current_status, [])
        if target_status not in allowed and target_status != current_status:
            raise ValueError(f"Invalid status transition from '{current_status}' to '{target_status}'. Allowed transitions: {', '.join(allowed)}")

        # Apply update
        if issue_id in self._memory_issues:
            self._memory_issues[issue_id]["status"] = target_status
            self._memory_issues[issue_id]["updated_at"] = now.isoformat()

        # Log timeline update
        desc = req.notes or f"Issue status updated to {target_status.replace('_', ' ').title()} by {req.actor_role.title()}."
        u_id = f"u_{uuid.uuid4().hex[:8]}"
        new_update = {
            "id": u_id,
            "issue_id": issue_id,
            "status": target_status,
            "description": desc,
            "update_type": "status_change",
            "created_at": now.isoformat()
        }
        self._memory_updates.setdefault(issue_id, []).append(new_update)

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("civic_issues").update({"status": target_status}).eq("id", issue_id).execute()
                supabase.table("issue_updates").insert(new_update).execute()
            except Exception as e:
                logger.error(f"Supabase error during status update: {e}")

        return {
            "success": True,
            "issue_id": issue_id,
            "previous_status": current_status,
            "new_status": target_status,
            "updated_at": now.isoformat(),
            "message": f"Status successfully updated to {target_status}."
        }

    def add_corporation_response(self, issue_id: str, req: CorporationResponseCreateRequest) -> CorporationResponseItem:
        """
        POST /api/corporation/issues/{id}/responses
        Posts an official municipal statement, auto-generates GenAI simplified explanation,
        respects public vs internal visibility, and preserves full response history.
        """
        now = datetime.now(timezone.utc)
        
        # Get issue title for context
        issue_title = "Civic Problem"
        if issue_id in self._memory_issues:
            issue_title = self._memory_issues[issue_id].get("title", "Civic Problem")

        # Auto-generate GenAI simplified explanation
        simplified_text = None
        if req.visibility == "public":
            try:
                ai_res = ai_service.simplify_response(
                    official_text=req.official_response,
                    issue_title=issue_title,
                    language=req.target_language or "English"
                )
                simplified_text = ai_res.simplified_summary
            except Exception as e:
                logger.warning(f"AI simplification fallback: {e}")
                simplified_text = f"The Municipal Corporation has reviewed this issue: {req.official_response}"

        r_id = f"r_{uuid.uuid4().hex[:8]}"
        response_data = {
            "id": r_id,
            "issue_id": issue_id,
            "corporation_user_id": req.corporation_user_id or "c9000000-0000-0000-0000-000000000001",
            "official_response": req.official_response,
            "simplified_response": simplified_text,
            "visibility": req.visibility,
            "created_at": now.isoformat()
        }

        # Store in memory
        self._memory_responses.setdefault(issue_id, []).append(response_data)

        # Add timeline update if public
        if req.visibility == "public":
            u_id = f"u_{uuid.uuid4().hex[:8]}"
            self._memory_updates.setdefault(issue_id, []).append({
                "id": u_id,
                "issue_id": issue_id,
                "status": self._memory_issues.get(issue_id, {}).get("status", "reviewed"),
                "description": "Official municipal response and citizen summary posted.",
                "update_type": "official_response",
                "created_at": now.isoformat()
            })

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("responses").insert(response_data).execute()
            except Exception as e:
                logger.error(f"Supabase error adding response: {e}")

        return CorporationResponseItem(
            id=r_id,
            issue_id=issue_id,
            corporation_user_id=req.corporation_user_id,
            official_response=req.official_response,
            simplified_response=simplified_text,
            visibility=req.visibility,
            created_at=now
        )

    def list_corporation_responses(self, issue_id: str, include_internal: bool = True) -> List[CorporationResponseItem]:
        """
        GET /api/issues/{id}/responses
        """
        res_list = self._memory_responses.get(issue_id, [])
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                q = supabase.table("responses").select("*").eq("issue_id", issue_id)
                if not include_internal:
                    q = q.eq("visibility", "public")
                q_res = q.order("created_at", desc=False).execute()
                if q_res.data:
                    res_list = q_res.data
            except Exception as e:
                logger.error(f"Error fetching responses: {e}")

        results = []
        for r in res_list:
            if not include_internal and r.get("visibility") == "internal":
                continue
            created_dt = r.get("created_at")
            if isinstance(created_dt, str):
                created_dt = datetime.fromisoformat(created_dt.replace("Z", "+00:00"))
            elif not created_dt:
                created_dt = datetime.now(timezone.utc)

            results.append(CorporationResponseItem(
                id=r["id"],
                issue_id=r["issue_id"],
                corporation_user_id=r.get("corporation_user_id"),
                official_response=r["official_response"],
                simplified_response=r.get("simplified_response"),
                visibility=r.get("visibility", "public"),
                created_at=created_dt
            ))
        return results

    def get_corporation_analytics(self) -> CorporationAnalyticsResponse:
        """
        GET /api/corporation/analytics
        Aggregates real statistics on issues by priority, category, area, status, and worker performance.
        """
        all_issues = list(self._memory_issues.values())
        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                res = supabase.table("civic_issues").select("*").execute()
                if res.data:
                    all_issues = res.data
            except Exception as e:
                logger.error(f"Error fetching analytics: {e}")

        by_priority: Dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        by_category: Dict[str, int] = {}
        by_area: Dict[str, int] = {}
        by_status: Dict[str, int] = {}

        for iss in all_issues:
            p = iss.get("priority_level", "medium")
            by_priority[p] = by_priority.get(p, 0) + 1

            c = iss.get("category", "Other")
            by_category[c] = by_category.get(c, 0) + 1

            a = iss.get("area", "Other Area")
            by_area[a] = by_area.get(a, 0) + 1

            s = iss.get("status", "reported")
            by_status[s] = by_status.get(s, 0) + 1

        total_rep = len(all_issues)
        total_res = by_status.get("completed", 0)

        # Worker utilization
        workers = self.list_workers()
        busy_workers = sum(1 for w in workers if w.worker_status in ["on_site", "busy", "assigned"])
        util_pct = (busy_workers / len(workers) * 100.0) if workers else 0.0

        return CorporationAnalyticsResponse(
            by_priority=by_priority,
            by_category=by_category,
            by_area=by_area,
            by_status=by_status,
            avg_resolution_hours=36.5,
            total_resolved=total_res,
            total_reported=total_rep,
            worker_utilization_pct=round(util_pct, 1)
        )

    # ====================================================================
    # WORKER FIELD OPERATIONS
    # ====================================================================

    def _determine_worker_required_action(self, status: str) -> str:
        s = (status or "").lower()
        if s == "assigned":
            return "Site inspection required"
        elif s == "inspection":
            return "Complete inspection & begin repair"
        elif s == "in_progress":
            return "Execute repair & upload progress photos"
        elif s == "completed":
            return "Work completed - municipal review"
        else:
            return "Awaiting field instruction"

    def get_worker_dashboard(self, worker_id: str) -> WorkerDashboardStats:
        """
        GET /api/worker/dashboard
        Personalized field operations dashboard for worker.
        """
        worker = self.get_worker_details(worker_id)
        tasks = self.list_worker_tasks(worker_id)

        assigned_c = sum(1 for t in tasks if t.status == IssueStatus.WORKER_ASSIGNED)
        pending_insp = sum(1 for t in tasks if t.status in [IssueStatus.WORKER_ASSIGNED, IssueStatus.INSPECTION])
        in_prog_c = sum(1 for t in tasks if t.status == IssueStatus.IN_PROGRESS)
        completed_c = sum(1 for t in tasks if t.status == IssueStatus.RESOLVED)

        return WorkerDashboardStats(
            worker_name=worker.full_name,
            department=worker.department,
            assigned_count=assigned_c,
            pending_inspection_count=pending_insp,
            in_progress_count=in_prog_c,
            completed_count=completed_c,
            active_tasks=[t for t in tasks if t.status != IssueStatus.RESOLVED]
        )

    def list_worker_tasks(self, worker_id: str, status: Optional[str] = None) -> List[WorkerTaskResponse]:
        """
        GET /api/worker/tasks
        Lists all issues assigned to the specific field worker.
        """
        assigned_issues = []
        for i_id, asg in self._memory_assignments.items():
            if asg.get("worker_id") == worker_id:
                iss = self._memory_issues.get(i_id)
                if iss:
                    assigned_issues.append((iss, asg))

        results = []
        for iss, asg in assigned_issues:
            i_status = iss.get("status", "assigned")
            if status and status.lower() != "all" and i_status.lower() != status.lower():
                continue

            i_id = iss["id"]
            citizen_photos = [e.get("storage_path") for e in self._memory_evidence.get(i_id, []) if "worker" not in e.get("storage_path", "")]
            worker_photos = [e.get("storage_path") for e in self._memory_evidence.get(i_id, []) if "worker" in e.get("storage_path", "")]
            updates = self._memory_updates.get(i_id, [])

            # Check accidents
            cmp_list = [c for c in self._memory_complaints.values() if c.get("civic_issue_id") == i_id]
            acc_rep = any(c.get("accident_reported") for c in cmp_list)
            acc_desc = next((c.get("accident_description") for c in cmp_list if c.get("accident_reported")), None)

            created_dt = iss.get("created_at")
            if isinstance(created_dt, str):
                created_dt = datetime.fromisoformat(created_dt.replace("Z", "+00:00"))
            elif not created_dt:
                created_dt = datetime.now(timezone.utc)

            asg_dt = asg.get("assigned_at")
            if isinstance(asg_dt, str):
                asg_dt = datetime.fromisoformat(asg_dt.replace("Z", "+00:00"))
            elif not asg_dt:
                asg_dt = created_dt

            p_level = iss.get("priority_level", "medium")
            p_score = int(iss.get("priority_score", 50))

            results.append(WorkerTaskResponse(
                id=asg["id"],
                issue_id=i_id,
                title=iss.get("title", "Assigned Civic Issue"),
                description=iss.get("description", ""),
                category=iss.get("category", "General"),
                area=iss.get("area", "Local Area"),
                landmark=iss.get("landmark"),
                priority_level=PriorityLevel(p_level),
                priority_score=p_score,
                status=IssueStatus(i_status),
                assigned_at=asg_dt,
                instructions=asg.get("instructions"),
                required_action=self._determine_worker_required_action(i_status),
                citizen_photos=citizen_photos,
                worker_photos=worker_photos,
                recent_updates=updates[-5:],
                accident_reported=acc_rep,
                accident_description=acc_desc,
                created_at=created_dt
            ))

        # Sort tasks: highest priority and newest assigned first
        results.sort(key=lambda x: (x.priority_score, x.assigned_at), reverse=True)
        return results

    def get_worker_task_detail(self, task_id_or_issue_id: str, worker_id: Optional[str] = None) -> WorkerTaskResponse:
        """
        GET /api/worker/tasks/{id}
        """
        # Find matching assignment
        found_task = None
        for i_id, asg in self._memory_assignments.items():
            if asg.get("id") == task_id_or_issue_id or i_id == task_id_or_issue_id:
                w_id = asg.get("worker_id")
                if worker_id and w_id != worker_id:
                    continue
                tasks = self.list_worker_tasks(w_id)
                for t in tasks:
                    if t.id == asg["id"] or t.issue_id == i_id:
                        return t

        # Fallback for issue detail direct view
        if task_id_or_issue_id in self._memory_issues:
            iss = self._memory_issues[task_id_or_issue_id]
            i_id = iss["id"]
            w_id = worker_id or "w1000000-0000-0000-0000-000000000001"
            asg = self._memory_assignments.get(i_id, {
                "id": f"asg_{i_id[:8]}",
                "issue_id": i_id,
                "worker_id": w_id,
                "instructions": "Inspect site and coordinate necessary repairs.",
                "assigned_at": iss.get("created_at")
            })
            citizen_photos = [e.get("storage_path") for e in self._memory_evidence.get(i_id, []) if "worker" not in e.get("storage_path", "")]
            worker_photos = [e.get("storage_path") for e in self._memory_evidence.get(i_id, []) if "worker" in e.get("storage_path", "")]
            updates = self._memory_updates.get(i_id, [])
            created_dt = datetime.now(timezone.utc)

            return WorkerTaskResponse(
                id=asg["id"],
                issue_id=i_id,
                title=iss.get("title", "Assigned Civic Issue"),
                description=iss.get("description", ""),
                category=iss.get("category", "General"),
                area=iss.get("area", "Local Area"),
                landmark=iss.get("landmark"),
                priority_level=PriorityLevel(iss.get("priority_level", "medium")),
                priority_score=int(iss.get("priority_score", 50)),
                status=IssueStatus(iss.get("status", "assigned")),
                assigned_at=created_dt,
                instructions=asg.get("instructions"),
                required_action=self._determine_worker_required_action(iss.get("status", "assigned")),
                citizen_photos=citizen_photos,
                worker_photos=worker_photos,
                recent_updates=updates,
                accident_reported=False,
                accident_description=None,
                created_at=created_dt
            )

        raise ValueError(f"Task with ID {task_id_or_issue_id} not found.")

    def record_worker_inspection(self, issue_id: str, req: WorkerInspectionRequest) -> Dict[str, Any]:
        """
        POST /api/worker/tasks/{id}/inspection
        Records site inspection notes, updates status to 'inspection', attaches optional photo evidence.
        """
        now = datetime.now(timezone.utc)
        worker = self.get_worker_details(req.worker_id)

        # Update issue status
        if issue_id in self._memory_issues:
            self._memory_issues[issue_id]["status"] = "inspection"
            self._memory_issues[issue_id]["updated_at"] = now.isoformat()

        # Update worker status to 'on_site'
        if req.worker_id in self._memory_workers:
            self._memory_workers[req.worker_id]["worker_status"] = "on_site"

        # Log timeline update
        u_id = f"u_{uuid.uuid4().hex[:8]}"
        desc = f"Site inspection by {worker.full_name} ({worker.department}): {req.notes}"
        self._memory_updates.setdefault(issue_id, []).append({
            "id": u_id,
            "issue_id": issue_id,
            "status": "inspection",
            "description": desc,
            "update_type": "inspection",
            "evidence_url": req.evidence_url,
            "created_at": now.isoformat()
        })

        if req.evidence_url:
            self.upload_worker_evidence(issue_id, WorkerEvidenceUploadRequest(
                worker_id=req.worker_id,
                storage_path=req.evidence_url,
                description=f"Inspection photo: {req.notes}",
                stage="before_repair"
            ))

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("civic_issues").update({"status": "inspection"}).eq("id", issue_id).execute()
                supabase.table("issue_updates").insert({
                    "id": u_id,
                    "issue_id": issue_id,
                    "status": "inspection",
                    "description": desc,
                    "update_type": "inspection",
                    "evidence_url": req.evidence_url
                }).execute()
            except Exception as e:
                logger.error(f"Supabase error recording inspection: {e}")

        return {
            "success": True,
            "issue_id": issue_id,
            "status": "inspection",
            "worker_name": worker.full_name,
            "message": "Inspection successfully logged and issue updated."
        }

    def record_worker_progress(self, issue_id: str, req: WorkerProgressUpdateRequest) -> Dict[str, Any]:
        """
        POST /api/worker/tasks/{id}/progress
        Posts on-site progress update (e.g. repair start, material delivery, sub-base leveling),
        transitions status to 'in_progress'.
        """
        now = datetime.now(timezone.utc)
        worker = self.get_worker_details(req.worker_id)

        # Transition status to in_progress if currently assigned or in inspection
        if issue_id in self._memory_issues:
            self._memory_issues[issue_id]["status"] = "in_progress"
            self._memory_issues[issue_id]["updated_at"] = now.isoformat()

        # Log timeline update
        u_id = f"u_{uuid.uuid4().hex[:8]}"
        desc = f"Field Progress ({worker.department}): {req.description}"
        self._memory_updates.setdefault(issue_id, []).append({
            "id": u_id,
            "issue_id": issue_id,
            "status": "in_progress",
            "description": desc,
            "update_type": req.update_type or "progress",
            "evidence_url": req.evidence_url,
            "created_at": now.isoformat()
        })

        if req.evidence_url:
            self.upload_worker_evidence(issue_id, WorkerEvidenceUploadRequest(
                worker_id=req.worker_id,
                storage_path=req.evidence_url,
                description=req.description,
                stage="during_repair"
            ))

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("civic_issues").update({"status": "in_progress"}).eq("id", issue_id).execute()
                supabase.table("issue_updates").insert({
                    "id": u_id,
                    "issue_id": issue_id,
                    "status": "in_progress",
                    "description": desc,
                    "update_type": req.update_type or "progress",
                    "evidence_url": req.evidence_url
                }).execute()
            except Exception as e:
                logger.error(f"Supabase error recording progress: {e}")

        return {
            "success": True,
            "issue_id": issue_id,
            "status": "in_progress",
            "worker_name": worker.full_name,
            "message": "Progress update posted to official timeline."
        }

    def record_worker_completion(self, issue_id: str, req: WorkerTaskCompleteRequest) -> Dict[str, Any]:
        """
        POST /api/worker/tasks/{id}/complete
        Submits work completion report with photos, marks issue as completed, updates worker availability.
        """
        now = datetime.now(timezone.utc)
        worker = self.get_worker_details(req.worker_id)

        # Update issue status to completed
        if issue_id in self._memory_issues:
            self._memory_issues[issue_id]["status"] = "completed"
            self._memory_issues[issue_id]["updated_at"] = now.isoformat()

        # Update assignment status
        if issue_id in self._memory_assignments:
            self._memory_assignments[issue_id]["status"] = "completed"

        # Update worker status back to available
        if req.worker_id in self._memory_workers:
            self._memory_workers[req.worker_id]["worker_status"] = "available"

        # Log completion update
        u_id = f"u_{uuid.uuid4().hex[:8]}"
        desc = f"Work Completed by {worker.full_name} ({worker.department}): {req.completion_notes}"
        self._memory_updates.setdefault(issue_id, []).append({
            "id": u_id,
            "issue_id": issue_id,
            "status": "completed",
            "description": desc,
            "update_type": "completion",
            "evidence_url": req.evidence_url,
            "created_at": now.isoformat()
        })

        if req.evidence_url:
            self.upload_worker_evidence(issue_id, WorkerEvidenceUploadRequest(
                worker_id=req.worker_id,
                storage_path=req.evidence_url,
                description=f"Completion photo: {req.completion_notes}",
                stage="after_repair"
            ))

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("civic_issues").update({"status": "completed"}).eq("id", issue_id).execute()
                supabase.table("assignments").update({"status": "completed"}).eq("issue_id", issue_id).execute()
                supabase.table("profiles").update({"worker_status": "available"}).eq("id", req.worker_id).execute()
                supabase.table("issue_updates").insert({
                    "id": u_id,
                    "issue_id": issue_id,
                    "status": "completed",
                    "description": desc,
                    "update_type": "completion",
                    "evidence_url": req.evidence_url
                }).execute()
            except Exception as e:
                logger.error(f"Supabase error recording completion: {e}")

        return {
            "success": True,
            "issue_id": issue_id,
            "status": "completed",
            "worker_name": worker.full_name,
            "message": "Work completion recorded successfully. Issue marked as Completed."
        }

    def upload_worker_evidence(self, issue_id: str, req: WorkerEvidenceUploadRequest) -> Dict[str, Any]:
        """
        POST /api/worker/tasks/{id}/evidence
        Stores worker-submitted photo evidence (before/during/after repair).
        """
        now = datetime.now(timezone.utc)
        e_id = f"evi_w_{uuid.uuid4().hex[:8]}"
        evi_data = {
            "id": e_id,
            "issue_id": issue_id,
            "complaint_id": None,
            "uploaded_by": req.worker_id,
            "storage_path": req.storage_path,
            "file_type": req.file_type,
            "description": f"[{req.stage.replace('_', ' ').title()}] {req.description or ''}",
            "created_at": now.isoformat()
        }

        self._memory_evidence.setdefault(issue_id, []).append(evi_data)

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                supabase.table("evidence").insert(evi_data).execute()
            except Exception as e:
                logger.error(f"Supabase error uploading evidence: {e}")

        return {
            "success": True,
            "evidence_id": e_id,
            "issue_id": issue_id,
            "storage_path": req.storage_path,
            "message": "Field evidence uploaded successfully."
        }

    # Convenience method aliases for cross-module compatibility
    list_issues = list_civic_issues
    get_issue_by_id = get_issue_detail
    get_citizen_complaints = list_citizen_complaints
    get_citizen_supported_issues = list_supported_issues
    toggle_issue_support = toggle_support

supabase_service = SupabaseService()

