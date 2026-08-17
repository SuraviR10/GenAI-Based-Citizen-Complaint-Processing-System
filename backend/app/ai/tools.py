"""
CivicConnect AI — Tool Definitions for GenAI Chatbot
Contains pure Python tool functions that query live application data from
Supabase PostgreSQL / application services with strict parameter validation.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from app.services.supabase_service import supabase_service
from app.services.similarity_service import similarity_service
from app.services.priority_service import priority_engine
from app.models.issue import SimilaritySearchRequest

logger = logging.getLogger("civicconnect.ai.tools")


# ====================================================================
# 1. CITIZEN TOOLS
# ====================================================================

def get_my_complaints(user_id: str) -> Dict[str, Any]:
    """Retrieves all complaints submitted by the authenticated citizen."""
    try:
        complaints = supabase_service.list_citizen_complaints(citizen_id=user_id)
        results = []
        for c in complaints:
            results.append({
                "complaint_id": c.id,
                "civic_issue_id": c.civic_issue_id,
                "description": c.original_text,
                "category": c.category,
                "area": c.area,
                "landmark": c.landmark,
                "status": c.status.value if hasattr(c.status, "value") else str(c.status),
                "accident_reported": c.accident_reported,
                "created_at": c.created_at.isoformat() if hasattr(c.created_at, "isoformat") else str(c.created_at)
            })
        return {
            "status": "success",
            "count": len(results),
            "complaints": results,
            "source_type": "database",
            "source_label": f"Your {len(results)} Reported Complaints"
        }
    except Exception as e:
        logger.error(f"Error in get_my_complaints: {e}")
        return {"status": "error", "message": f"Could not retrieve complaints: {str(e)}", "complaints": []}


def get_my_supported_issues(user_id: str) -> Dict[str, Any]:
    """Retrieves all civic issues supported / upvoted by the authenticated citizen."""
    try:
        issues = supabase_service.list_supported_issues(citizen_id=user_id)
        results = []
        for i in issues:
            results.append({
                "issue_id": i.id,
                "title": i.title,
                "category": i.category,
                "area": i.area,
                "landmark": i.landmark,
                "status": i.status.value if hasattr(i.status, "value") else str(i.status),
                "priority_level": i.priority_level.value if hasattr(i.priority_level, "value") else str(i.priority_level),
                "priority_score": i.priority_score,
                "support_count": i.support_count
            })
        return {
            "status": "success",
            "count": len(results),
            "supported_issues": results,
            "source_type": "database",
            "source_label": f"Your {len(results)} Supported Civic Issues"
        }
    except Exception as e:
        logger.error(f"Error in get_my_supported_issues: {e}")
        return {"status": "error", "message": f"Could not retrieve supported issues: {str(e)}", "supported_issues": []}


def get_issue(issue_id: str) -> Dict[str, Any]:
    """Retrieves full details of a specific civic issue by ID."""
    try:
        issue = supabase_service.get_issue_detail(issue_id)
        if not issue:
            return {"status": "not_found", "message": f"No civic issue found with ID {issue_id}."}

        return {
            "status": "success",
            "issue": {
                "id": issue.id,
                "title": issue.title,
                "description": issue.description,
                "category": issue.category,
                "area": issue.area,
                "landmark": issue.landmark,
                "latitude": issue.latitude,
                "longitude": issue.longitude,
                "status": issue.status.value if hasattr(issue.status, "value") else str(issue.status),
                "priority_level": issue.priority_level.value if hasattr(issue.priority_level, "value") else str(issue.priority_level),
                "priority_score": issue.priority_score,
                "support_count": issue.support_count,
                "complaints_count": issue.complaints_count,
                "evidence_count": issue.evidence_count,
                "created_at": issue.created_at.isoformat() if hasattr(issue.created_at, "isoformat") else str(issue.created_at)
            },
            "source_type": "database",
            "source_label": f"Civic Issue #{issue.id[:8]} ({issue.title})"
        }
    except Exception as e:
        logger.error(f"Error in get_issue: {e}")
        return {"status": "error", "message": str(e)}


def search_issues(query: str, area: Optional[str] = None, category: Optional[str] = None) -> Dict[str, Any]:
    """Searches live civic issues across Mysuru by keywords, locality, and category."""
    try:
        all_issues = supabase_service.list_civic_issues(status="all", limit=50)
        filtered = []
        q_lower = query.lower().strip()

        for i in all_issues:
            # Check text match
            text_match = (q_lower in i.title.lower() or q_lower in (i.description or "").lower() or q_lower in (i.landmark or "").lower() or q_lower in i.category.lower())
            
            # Check area match
            area_match = True
            if area and area.lower() != "all":
                area_match = bool(i.area and i.area.lower() == area.lower())

            # Check category match
            cat_match = True
            if category and category.lower() != "all":
                cat_match = bool(i.category and i.category.lower() == category.lower())

            if (text_match or not q_lower) and area_match and cat_match:
                filtered.append({
                    "id": i.id,
                    "title": i.title,
                    "category": i.category,
                    "area": i.area,
                    "landmark": i.landmark,
                    "status": i.status.value if hasattr(i.status, "value") else str(i.status),
                    "priority_level": i.priority_level.value if hasattr(i.priority_level, "value") else str(i.priority_level),
                    "priority_score": i.priority_score,
                    "support_count": i.support_count,
                    "complaints_count": i.complaints_count
                })

        return {
            "status": "success",
            "query": query,
            "area_filter": area,
            "category_filter": category,
            "count": len(filtered),
            "issues": filtered[:8],
            "source_type": "database",
            "source_label": f"Mysuru Civic Database ({len(filtered)} matches)"
        }
    except Exception as e:
        logger.error(f"Error in search_issues: {e}")
        return {"status": "error", "message": str(e), "issues": []}


def find_similar_issues(complaint_text: str, area: Optional[str] = None, landmark: Optional[str] = None) -> Dict[str, Any]:
    """Uses the embedding similarity engine to detect duplicate or nearby matching civic issues."""
    try:
        sim_res = similarity_service.find_similar_issues(SimilaritySearchRequest(
            text=complaint_text,
            area=area,
            landmark=landmark
        ))
        matches = []
        for m in sim_res.matched_issues:
            matches.append({
                "id": m.id,
                "title": m.title,
                "category": m.category,
                "area": m.area,
                "landmark": m.landmark,
                "status": m.status,
                "priority_level": m.priority_level,
                "support_count": m.support_count,
                "complaints_count": m.complaint_count,
                "similarity_score": m.similarity_score,
                "recommendation": m.recommendation,
                "match_reasons": m.match_reasons
            })

        return {
            "status": "success",
            "found_matches": sim_res.found_matches,
            "count": len(matches),
            "suggested_action": sim_res.suggested_action,
            "matched_issues": matches,
            "source_type": "similarity_engine",
            "source_label": "AI Similarity & Deduplication Engine"
        }
    except Exception as e:
        logger.error(f"Error in find_similar_issues: {e}")
        return {"status": "error", "message": str(e), "found_matches": False, "matched_issues": []}


def get_issue_tracking(issue_id: str) -> Dict[str, Any]:
    """Retrieves real-time tracking timeline, official responses, and worker progress logs for an issue."""
    try:
        tracking = supabase_service.get_issue_tracking(issue_id)
        if not tracking:
            return {"status": "not_found", "message": f"No tracking timeline found for issue ID {issue_id}."}

        updates_list = []
        for u in tracking.updates:
            updates_list.append({
                "id": u.id,
                "status": u.status.value if hasattr(u.status, "value") else str(u.status),
                "description": u.description,
                "created_at": u.created_at.isoformat() if hasattr(u.created_at, "isoformat") else str(u.created_at)
            })

        resp_list = []
        for r in tracking.responses:
            resp_list.append({
                "official_response": r.official_response,
                "simplified_response": r.simplified_response,
                "visibility": r.visibility,
                "created_at": r.created_at.isoformat() if hasattr(r.created_at, "isoformat") else str(r.created_at)
            })

        return {
            "status": "success",
            "issue_id": issue_id,
            "current_status": tracking.issue.status.value if hasattr(tracking.issue.status, "value") else str(tracking.issue.status),
            "title": tracking.issue.title,
            "area": tracking.issue.area,
            "updates": updates_list,
            "responses": resp_list,
            "source_type": "database",
            "source_label": f"Live Progress Timeline for Issue #{issue_id[:8]}"
        }
    except Exception as e:
        logger.error(f"Error in get_issue_tracking: {e}")
        return {"status": "error", "message": str(e)}


def get_area_issues(area: str) -> Dict[str, Any]:
    """Retrieves live civic issues reported in a specific Mysuru locality (e.g. Gokulam, Kuvempunagar)."""
    try:
        issues = supabase_service.list_civic_issues(area=area, status="all", limit=30)
        results = []
        for i in issues:
            results.append({
                "id": i.id,
                "title": i.title,
                "category": i.category,
                "landmark": i.landmark,
                "status": i.status.value if hasattr(i.status, "value") else str(i.status),
                "priority_level": i.priority_level.value if hasattr(i.priority_level, "value") else str(i.priority_level),
                "priority_score": i.priority_score,
                "support_count": i.support_count,
                "complaints_count": i.complaints_count
            })

        return {
            "status": "success",
            "area": area,
            "count": len(results),
            "issues": results,
            "source_type": "database",
            "source_label": f"Live Reports in {area}, Mysuru"
        }
    except Exception as e:
        logger.error(f"Error in get_area_issues: {e}")
        return {"status": "error", "message": str(e), "issues": []}


def get_issue_priority(issue_id: str) -> Dict[str, Any]:
    """Retrieves the factual mathematical factors contributing to an issue's 0-100 priority score."""
    try:
        issue = supabase_service.get_issue_detail(issue_id)
        if not issue:
            return {"status": "not_found", "message": f"No issue found with ID {issue_id}."}

        complaints = supabase_service.get_issue_complaints(issue_id)
        accidents = sum(1 for c in complaints if c.accident_reported)
        injuries = sum(getattr(c, "injuries_count", 0) for c in complaints)
        duration = complaints[0].duration if complaints else "not_sure"

        return {
            "status": "success",
            "issue_id": issue.id,
            "title": issue.title,
            "category": issue.category,
            "area": issue.area,
            "priority_score": issue.priority_score,
            "priority_level": issue.priority_level.value if hasattr(issue.priority_level, "value") else str(issue.priority_level),
            "factors": {
                "support_count": issue.support_count,
                "complaints_count": issue.complaints_count,
                "accidents_count": accidents,
                "injuries_count": injuries,
                "evidence_count": issue.evidence_count,
                "duration": duration
            },
            "source_type": "database",
            "source_label": f"Priority Factors for Issue #{issue_id[:8]}"
        }
    except Exception as e:
        logger.error(f"Error in get_issue_priority: {e}")
        return {"status": "error", "message": str(e)}


# ====================================================================
# 2. WORKER TOOLS (Worker & Corporation Authorized)
# ====================================================================

def get_assigned_issues(worker_id: str) -> Dict[str, Any]:
    """Retrieves all tasks / work orders assigned to the authenticated field worker."""
    try:
        tasks = supabase_service.list_worker_tasks(worker_id=worker_id)
        results = []
        for t in tasks:
            results.append({
                "assignment_id": t.assignment_id,
                "issue_id": t.issue_id,
                "title": t.title,
                "description": t.description,
                "category": t.category,
                "area": t.area,
                "landmark": t.landmark,
                "status": t.status.value if hasattr(t.status, "value") else str(t.status),
                "priority_level": t.priority_level.value if hasattr(t.priority_level, "value") else str(t.priority_level),
                "priority_score": t.priority_score,
                "assigned_at": t.assigned_at.isoformat() if hasattr(t.assigned_at, "isoformat") else str(t.assigned_at),
                "notes": t.notes
            })
        return {
            "status": "success",
            "worker_id": worker_id,
            "count": len(results),
            "tasks": results,
            "source_type": "database",
            "source_label": f"Worker Operations Queue ({len(results)} Assigned Tasks)"
        }
    except Exception as e:
        logger.error(f"Error in get_assigned_issues: {e}")
        return {"status": "error", "message": str(e), "tasks": []}


def get_worker_issue(issue_id: str, worker_id: str) -> Dict[str, Any]:
    """Retrieves full operational task details for a worker's assigned issue."""
    try:
        task = supabase_service.get_worker_task_detail(issue_id=issue_id, worker_id=worker_id)
        if not task:
            return {"status": "not_found", "message": f"No assigned task found for issue ID {issue_id}."}

        return {
            "status": "success",
            "task": {
                "assignment_id": task.assignment_id,
                "issue_id": task.issue_id,
                "title": task.title,
                "description": task.description,
                "category": task.category,
                "area": task.area,
                "landmark": task.landmark,
                "latitude": task.latitude,
                "longitude": task.longitude,
                "status": task.status.value if hasattr(task.status, "value") else str(task.status),
                "priority_level": task.priority_level.value if hasattr(task.priority_level, "value") else str(task.priority_level),
                "priority_score": task.priority_score,
                "assigned_at": task.assigned_at.isoformat() if hasattr(task.assigned_at, "isoformat") else str(task.assigned_at),
                "notes": task.notes,
                "evidence_count": len(task.evidence or []),
                "complaints_count": len(task.complaints or [])
            },
            "source_type": "database",
            "source_label": f"Assigned Work Order #{issue_id[:8]}"
        }
    except Exception as e:
        logger.error(f"Error in get_worker_issue: {e}")
        return {"status": "error", "message": str(e)}


def get_issue_evidence(issue_id: str) -> Dict[str, Any]:
    """Retrieves photos, media URLs, and inspection evidence submitted for an issue."""
    try:
        evidence = supabase_service.get_issue_evidence(issue_id)
        results = []
        for e in evidence:
            results.append({
                "id": e.id,
                "storage_path": e.storage_path,
                "file_type": e.file_type,
                "description": e.description,
                "stage": e.stage,
                "created_at": e.created_at.isoformat() if hasattr(e.created_at, "isoformat") else str(e.created_at)
            })
        return {
            "status": "success",
            "issue_id": issue_id,
            "count": len(results),
            "evidence": results,
            "source_type": "database",
            "source_label": f"Field Photo Evidence for Issue #{issue_id[:8]}"
        }
    except Exception as e:
        logger.error(f"Error in get_issue_evidence: {e}")
        return {"status": "error", "message": str(e), "evidence": []}


# ====================================================================
# 3. CORPORATION TOOLS (Corporation Officials Only)
# ====================================================================

def get_priority_issues(limit: int = 10) -> Dict[str, Any]:
    """Retrieves the highest-priority civic issues across Mysuru ranked by deterministic urgency score."""
    try:
        issues_list = supabase_service.list_corporation_issues(sort="priority", limit=limit)
        results = []
        crit_count = 0
        high_count = 0

        for item in issues_list:
            p_level = item.priority_level.value if hasattr(item.priority_level, "value") else str(item.priority_level)
            if p_level == "critical":
                crit_count += 1
            elif p_level == "high":
                high_count += 1

            results.append({
                "id": item.id,
                "title": item.title,
                "category": item.category,
                "area": item.area,
                "landmark": item.landmark,
                "priority_score": item.priority_score,
                "priority_level": p_level,
                "status": item.status.value if hasattr(item.status, "value") else str(item.status),
                "support_count": item.support_count,
                "complaints_count": item.complaints_count,
                "accidents_count": item.accident_reports_count,
                "injuries_count": item.injuries_count
            })

        return {
            "status": "success",
            "count": len(results),
            "critical_count": crit_count,
            "high_count": high_count,
            "issues": results,
            "source_type": "database",
            "source_label": f"MCC Priority Triage Queue ({crit_count} Critical, {high_count} High)"
        }
    except Exception as e:
        logger.error(f"Error in get_priority_issues: {e}")
        return {"status": "error", "message": str(e), "issues": []}


def get_issue_statistics(department: Optional[str] = None, area: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves high-level municipal statistics on issues, status breakdown, and priority metrics."""
    try:
        stats = supabase_service.get_corporation_dashboard_stats(department=department, area=area)
        return {
            "status": "success",
            "total_issues": stats.total_issues,
            "critical_issues": stats.critical_issues,
            "in_progress": stats.in_progress,
            "resolved": stats.resolved,
            "avg_resolution_days": stats.avg_resolution_days,
            "active_workers": stats.active_workers,
            "priority_breakdown": stats.priority_breakdown,
            "status_breakdown": stats.status_breakdown,
            "category_breakdown": stats.category_breakdown,
            "source_type": "database",
            "source_label": "Mysuru City Corporation Official Analytics"
        }
    except Exception as e:
        logger.error(f"Error in get_issue_statistics: {e}")
        return {"status": "error", "message": str(e)}


def get_worker_assignments(department: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves the list of active field crews, their assigned departments, locations, and workloads."""
    try:
        workers = supabase_service.list_workers(department=department)
        results = []
        for w in workers:
            results.append({
                "id": w.id,
                "full_name": w.full_name,
                "department": w.department,
                "area": w.area,
                "worker_status": w.worker_status,
                "phone": w.phone,
                "active_tasks_count": w.active_tasks_count or 0
            })
        return {
            "status": "success",
            "count": len(results),
            "workers": results,
            "source_type": "database",
            "source_label": f"Field Crew Directory ({len(results)} Workers)"
        }
    except Exception as e:
        logger.error(f"Error in get_worker_assignments: {e}")
        return {"status": "error", "message": str(e), "workers": []}


def get_corroboration_data(issue_id: str) -> Dict[str, Any]:
    """Retrieves multi-source corroboration metrics and independent citizen reports for an issue."""
    try:
        issue = supabase_service.get_issue_detail(issue_id)
        if not issue:
            return {"status": "not_found", "message": f"No issue found with ID {issue_id}."}

        complaints = supabase_service.get_issue_complaints(issue_id)
        evidence = supabase_service.get_issue_evidence(issue_id)

        reports_summary = []
        for c in complaints:
            reports_summary.append({
                "id": c.id,
                "text": c.original_text,
                "area": c.area,
                "landmark": c.landmark,
                "accident_reported": c.accident_reported,
                "duration": c.duration,
                "created_at": c.created_at.isoformat() if hasattr(c.created_at, "isoformat") else str(c.created_at)
            })

        return {
            "status": "success",
            "issue_id": issue.id,
            "title": issue.title,
            "area": issue.area,
            "total_supporters": issue.support_count,
            "independent_complaints_count": len(complaints),
            "evidence_photos_count": len(evidence),
            "complaint_reports": reports_summary,
            "source_type": "database",
            "source_label": f"Community Corroboration for Issue #{issue_id[:8]}"
        }
    except Exception as e:
        logger.error(f"Error in get_corroboration_data: {e}")
        return {"status": "error", "message": str(e)}
