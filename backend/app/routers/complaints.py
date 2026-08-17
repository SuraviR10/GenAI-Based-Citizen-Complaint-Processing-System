from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import get_current_user, AuthUser
from app.models.complaint import ComplaintLinkRequest, ComplaintResponse
from app.services.supabase_service import supabase_service
from app.models.ai import ComplaintAnalysisRequest
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("/link-to-existing")
async def link_complaint_to_existing(
    req: ComplaintLinkRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    POST /api/complaints/link-to-existing
    Links a citizen's complaint to an existing consolidated Civic Issue.
    Rejects complaints that are not valid civic/municipal problems.
    """
    # If user is authenticated, ensure complaint is bound to their authentic user ID
    if current_user and current_user.id != "anonymous-user":
        req.citizen_id = current_user.id

    # Validate civic relevance
    analysis = ai_service.analyze_complaint(ComplaintAnalysisRequest(
        original_text=req.original_text,
        language=req.language,
        area=req.area,
        landmark=req.landmark,
        accident_reported=req.accident_reported,
        accident_description=req.accident_description,
        duration=req.duration
    ))

    if not analysis.is_civic_issue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=analysis.rejection_reason or "This is not the right place to complain about this. CivicConnect AI is dedicated to public and municipal infrastructure problems."
        )

    try:
        return supabase_service.link_complaint_to_existing_issue(req)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error linking complaint to existing issue: {str(e)}"
        )

@router.get("/my", response_model=List[ComplaintResponse])
async def list_my_complaints(
    citizen_id: Optional[str] = Query(None, description="Authenticated citizen ID"),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    GET /api/complaints/my
    Returns all complaints submitted by the given citizen with linked issue information.
    """
    target_id = citizen_id or (current_user.id if current_user.id != "anonymous-user" else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="citizen_id is required or user must be signed in."
        )
    try:
        return supabase_service.list_citizen_complaints(target_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching citizen complaints: {str(e)}"
        )
