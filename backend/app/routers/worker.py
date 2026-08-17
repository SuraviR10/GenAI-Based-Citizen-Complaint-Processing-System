from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import require_role, AuthUser
from app.models.issue import (
    WorkerTaskResponse,
    WorkerDashboardStats,
    WorkerInspectionRequest,
    WorkerProgressUpdateRequest,
    WorkerTaskCompleteRequest,
    WorkerEvidenceUploadRequest
)
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/worker", tags=["Worker Module"])

@router.get("/dashboard", response_model=WorkerDashboardStats)
async def get_worker_dashboard(
    worker_id: str = Query(..., description="Field worker ID"),
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    GET /api/worker/dashboard
    Returns personalized stats (Assigned, Pending Inspection, In Progress, Completed) and active tasks.
    """
    try:
        return supabase_service.get_worker_dashboard(worker_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching worker dashboard: {str(e)}"
        )

@router.get("/tasks", response_model=List[WorkerTaskResponse])
async def list_worker_tasks(
    worker_id: str = Query(..., description="Field worker ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Status filter: assigned, inspection, in_progress, completed"),
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    GET /api/worker/tasks
    Lists tasks assigned to the worker, sorted by urgency and assignment date.
    """
    try:
        return supabase_service.list_worker_tasks(worker_id, status_filter)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing worker tasks: {str(e)}"
        )

@router.get("/tasks/{task_id}", response_model=WorkerTaskResponse)
async def get_worker_task_detail(
    task_id: str,
    worker_id: Optional[str] = Query(None, description="Optional worker ID to verify assignment"),
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    GET /api/worker/tasks/{id}
    Retrieves task instructions, citizen descriptions, location, citizen-uploaded photos, and recent updates.
    """
    try:
        return supabase_service.get_worker_task_detail(task_id, worker_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching task detail: {str(e)}"
        )

@router.post("/tasks/{task_id}/inspection")
async def start_or_complete_inspection(
    task_id: str,
    req: WorkerInspectionRequest,
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    POST /api/worker/tasks/{id}/inspection
    Logs on-site inspection findings, updates status to 'inspection', and optionally saves photos.
    """
    try:
        # task_id may be issue_id or assignment_id
        issue_id = task_id
        asg = supabase_service._memory_assignments.get(task_id)
        if asg:
            issue_id = asg.get("issue_id", task_id)

        return supabase_service.record_worker_inspection(issue_id, req)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recording inspection: {str(e)}"
        )

@router.post("/tasks/{task_id}/progress")
async def submit_progress_update(
    task_id: str,
    req: WorkerProgressUpdateRequest,
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    POST /api/worker/tasks/{id}/progress
    Submits on-site progress execution update, transitions status to 'in_progress', and attaches photos.
    """
    try:
        issue_id = task_id
        asg = supabase_service._memory_assignments.get(task_id)
        if asg:
            issue_id = asg.get("issue_id", task_id)

        return supabase_service.record_worker_progress(issue_id, req)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recording progress: {str(e)}"
        )

@router.post("/tasks/{task_id}/complete")
async def mark_task_complete(
    task_id: str,
    req: WorkerTaskCompleteRequest,
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    POST /api/worker/tasks/{id}/complete
    Marks field work as completed with resolution notes and completion photos.
    """
    try:
        issue_id = task_id
        asg = supabase_service._memory_assignments.get(task_id)
        if asg:
            issue_id = asg.get("issue_id", task_id)

        return supabase_service.record_worker_completion(issue_id, req)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recording completion: {str(e)}"
        )

@router.post("/tasks/{task_id}/evidence")
async def upload_work_evidence(
    task_id: str,
    req: WorkerEvidenceUploadRequest,
    current_user: AuthUser = Depends(require_role(["worker", "corporation"]))
):
    """
    POST /api/worker/tasks/{id}/evidence
    Uploads field photo evidence (before, during, or after repair).
    """
    try:
        issue_id = task_id
        asg = supabase_service._memory_assignments.get(task_id)
        if asg:
            issue_id = asg.get("issue_id", task_id)

        return supabase_service.upload_worker_evidence(issue_id, req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading worker evidence: {str(e)}"
        )
