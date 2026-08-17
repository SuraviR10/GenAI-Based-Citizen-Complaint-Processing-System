from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import require_role, AuthUser
from app.models.issue import (
    CivicIssueResponse,
    CivicIssueDetailResponse,
    WorkerProfileResponse,
    WorkerAssignmentRequest,
    WorkerAssignmentResponse,
    CorporationDashboardStatsResponse,
    CorporationResponseCreateRequest,
    CorporationResponseItem,
    StatusTransitionRequest,
    CorporationAnalyticsResponse
)
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/corporation", tags=["Corporation Module"])

@router.get("/dashboard", response_model=CorporationDashboardStatsResponse)
async def get_corporation_dashboard(
    department: Optional[str] = Query(None, description="Filter by department"),
    area: Optional[str] = Query(None, description="Filter by ward / area"),
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/dashboard
    Returns real municipal operations metrics (active, critical, high, in-progress, resolved) and department workloads.
    """
    try:
        return supabase_service.get_corporation_dashboard_stats(department, area)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching corporation dashboard metrics: {str(e)}"
        )

@router.get("/issues", response_model=List[CivicIssueResponse])
async def list_corporation_issues(
    search: Optional[str] = Query(None, description="Search keyword in title, area, or description"),
    category: Optional[str] = Query(None, description="Category filter"),
    area: Optional[str] = Query(None, description="Area / ward filter"),
    priority: Optional[str] = Query(None, description="Priority filter: critical, high, medium, low"),
    status_filter: Optional[str] = Query(None, alias="status", description="Status filter"),
    department: Optional[str] = Query(None, description="Department filter"),
    worker_id: Optional[str] = Query(None, description="Assigned worker ID filter"),
    sort: Optional[str] = Query("priority", description="Sorting: priority (score DESC), newest, oldest"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/issues
    Returns priority-sorted civic issues with multi-factor filtering.
    """
    try:
        return supabase_service.list_corporation_issues(
            search=search,
            category=category,
            area=area,
            priority=priority,
            status=status_filter,
            department=department,
            worker_id=worker_id,
            sort=sort,
            limit=limit,
            offset=offset
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing priority issues: {str(e)}"
        )

@router.get("/issues/{issue_id}", response_model=CivicIssueDetailResponse)
async def get_corporation_issue_detail(
    issue_id: str,
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/issues/{id}
    Retrieves full consolidated issue detail with all citizen complaints, evidence gallery, corroboration metrics, priority breakdown, and assignment history.
    """
    try:
        return supabase_service.get_corporation_issue_detail(issue_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving issue detail: {str(e)}"
        )

@router.post("/issues/{issue_id}/assign", response_model=WorkerAssignmentResponse)
async def assign_worker(
    issue_id: str,
    req: WorkerAssignmentRequest,
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    POST /api/corporation/issues/{id}/assign
    Assigns a field worker to an issue, updates status to 'assigned', and logs timeline history.
    """
    try:
        return supabase_service.assign_worker_to_issue(issue_id, req)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning worker: {str(e)}"
        )

@router.patch("/issues/{issue_id}/status")
async def update_issue_status(
    issue_id: str,
    req: StatusTransitionRequest,
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    PATCH /api/corporation/issues/{id}/status
    Updates civic issue status through a validated lifecycle transition and records audit history.
    """
    try:
        return supabase_service.update_issue_status(issue_id, req)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating issue status: {str(e)}"
        )

@router.post("/issues/{issue_id}/responses", response_model=CorporationResponseItem)
async def post_corporation_response(
    issue_id: str,
    req: CorporationResponseCreateRequest,
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    POST /api/corporation/issues/{id}/responses
    Posts an official municipal statement, auto-generates GenAI simplified citizen explanation,
    and respects Public vs Internal visibility.
    """
    try:
        return supabase_service.add_corporation_response(issue_id, req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error posting corporation response: {str(e)}"
        )

@router.get("/issues/{issue_id}/responses", response_model=List[CorporationResponseItem])
async def list_issue_responses(
    issue_id: str,
    include_internal: bool = Query(True, description="Whether to include internal notes for corporation staff"),
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/issues/{id}/responses
    Lists official corporation responses for the issue.
    """
    try:
        return supabase_service.list_corporation_responses(issue_id, include_internal=include_internal)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching issue responses: {str(e)}"
        )

@router.get("/workers", response_model=List[WorkerProfileResponse])
async def list_workers(
    department: Optional[str] = Query(None, description="Department filter"),
    status_filter: Optional[str] = Query(None, alias="status", description="Worker status: available, assigned, on_site, busy, inactive"),
    area: Optional[str] = Query(None, description="Area filter"),
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/workers
    Lists municipal workers with department, status, and active workload counts.
    """
    try:
        return supabase_service.list_workers(department, status_filter, area)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing workers: {str(e)}"
        )

@router.get("/workers/{worker_id}", response_model=WorkerProfileResponse)
async def get_worker_detail(
    worker_id: str,
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/workers/{id}
    Retrieves worker details and availability.
    """
    try:
        return supabase_service.get_worker_details(worker_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching worker details: {str(e)}"
        )

@router.get("/analytics", response_model=CorporationAnalyticsResponse)
async def get_corporation_analytics(
    current_user: AuthUser = Depends(require_role(["corporation"]))
):
    """
    GET /api/corporation/analytics
    Aggregates municipal performance, priority distribution, area triage, and worker utilization.
    """
    try:
        return supabase_service.get_corporation_analytics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating analytics: {str(e)}"
        )
