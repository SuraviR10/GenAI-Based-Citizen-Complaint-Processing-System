from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import get_current_user, AuthUser
from app.models.stats import CitizenDashboardStats
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("/dashboard", response_model=CitizenDashboardStats)
async def get_dashboard_stats(
    citizen_id: Optional[str] = Query(None, description="Authenticated citizen ID"),
    area: Optional[str] = Query(None, description="Citizen's area"),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    GET /api/stats/dashboard
    Calculates REAL aggregated dashboard metrics for the citizen:
    My Reports, Supported Issues, In Progress, Resolved, and Nearby Issues.
    """
    target_id = citizen_id or (current_user.id if current_user.id != "anonymous-user" else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="citizen_id is required or user must be signed in."
        )
    try:
        return supabase_service.get_citizen_dashboard_stats(citizen_id=target_id, area=area)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating dashboard statistics: {str(e)}"
        )
