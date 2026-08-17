from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import get_current_user, AuthUser
from app.models.notification import NotificationResponse, NotificationUpdate
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    user_id: Optional[str] = Query(None, description="User ID"),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    GET /api/notifications
    Fetches real notifications for the authenticated user.
    """
    target_id = user_id or (current_user.id if current_user.id != "anonymous-user" else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required or user must be signed in."
        )
    try:
        return supabase_service.list_notifications(target_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching notifications: {str(e)}"
        )

@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, payload: NotificationUpdate):
    """
    PATCH /api/notifications/{notification_id}/read
    Marks a notification as read.
    """
    try:
        success = supabase_service.mark_notification_read(notification_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating notification: {str(e)}"
        )
