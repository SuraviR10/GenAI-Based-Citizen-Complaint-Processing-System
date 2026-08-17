from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.complaint import ComplaintResponse
from app.models.issue import CivicIssueResponse
from app.models.stats import CitizenDashboardStats
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/citizens", tags=["Citizens"])

@router.get("/{citizen_id}/complaints", response_model=List[ComplaintResponse])
async def list_citizen_complaints_by_id(citizen_id: str):
    """
    GET /api/citizens/{citizen_id}/complaints
    Returns all civic complaints submitted by the citizen.
    """
    try:
        return supabase_service.list_citizen_complaints(citizen_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching citizen complaints: {str(e)}"
        )

@router.get("/{citizen_id}/supported-issues", response_model=List[CivicIssueResponse])
async def list_citizen_supported_issues_by_id(citizen_id: str):
    """
    GET /api/citizens/{citizen_id}/supported-issues
    Returns all civic issues supported / upvoted by the citizen.
    """
    try:
        return supabase_service.list_supported_issues(citizen_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching citizen supported issues: {str(e)}"
        )

@router.get("/{citizen_id}/dashboard-stats", response_model=CitizenDashboardStats)
async def get_citizen_dashboard_stats_by_id(citizen_id: str, area: Optional[str] = Query(None)):
    """
    GET /api/citizens/{citizen_id}/dashboard-stats
    Returns citizen dashboard summary metrics.
    """
    try:
        return supabase_service.get_citizen_dashboard_stats(citizen_id, area)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )
