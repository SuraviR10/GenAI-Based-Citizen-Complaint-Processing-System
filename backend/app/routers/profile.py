from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import get_current_user, AuthUser
from app.models.profile import ProfileResponse, ProfileUpdate
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/profile", tags=["Citizen Profile"])

@router.get("", response_model=ProfileResponse)
async def get_profile(
    user_id: Optional[str] = Query(None, description="User ID"),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    GET /api/profile
    Retrieves citizen's profile info from Supabase profiles table.
    """
    target_id = user_id or (current_user.id if current_user.id != "anonymous-user" else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or user must be signed in."
        )
    try:
        return supabase_service.get_profile(target_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )

@router.put("", response_model=ProfileResponse)
async def update_profile(
    user_id: Optional[str] = Query(None, description="User ID"),
    payload: ProfileUpdate = None,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    PUT /api/profile
    Updates citizen's preferred language, name, or area.
    """
    target_id = user_id or (current_user.id if current_user.id != "anonymous-user" else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or user must be signed in."
        )
    try:
        return supabase_service.update_profile(target_id, payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )
