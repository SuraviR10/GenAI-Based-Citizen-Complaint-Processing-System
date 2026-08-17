from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.auth import get_current_user, AuthUser
from app.models.issue import (
    CivicIssueResponse,
    CivicIssueDetailResponse,
    SimilaritySearchRequest,
    SimilaritySearchResponse,
    CreateIssueWithComplaintRequest,
    CreateIssueResponse,
    SupportToggleRequest,
    SupportToggleResponse
)
from app.services.supabase_service import supabase_service
from app.services.similarity_service import similarity_service

router = APIRouter(prefix="/api/issues", tags=["Civic Issues"])

@router.get("", response_model=List[CivicIssueResponse])
async def list_civic_issues(
    search: Optional[str] = Query(None, description="Search term in title, description, or landmark"),
    category: Optional[str] = Query(None, description="Category filter"),
    area: Optional[str] = Query(None, description="Area / locality filter"),
    priority: Optional[str] = Query(None, description="Priority level filter"),
    status: Optional[str] = Query(None, description="Issue status filter"),
    sort: Optional[str] = Query("newest", description="Sorting: newest, oldest, priority"),
    citizen_id: Optional[str] = Query(None, description="Current authenticated citizen ID to check support state"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    GET /api/issues
    Lists real civic issues from Supabase with multi-factor filtering, search, and live counts.
    """
    try:
        return supabase_service.list_civic_issues(
            search=search,
            category=category,
            area=area,
            priority=priority,
            status=status,
            sort=sort,
            citizen_id=citizen_id,
            limit=limit,
            offset=offset
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing civic issues: {str(e)}"
        )

@router.post("/find-similar", response_model=SimilaritySearchResponse)
async def find_similar_issues(req: SimilaritySearchRequest):
    """
    POST /api/issues/find-similar
    Checks existing civic issues in the area to prevent duplicate reports.
    """
    try:
        return similarity_service.find_similar_issues(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching for similar issues: {str(e)}"
        )

from app.models.ai import ComplaintAnalysisRequest
from app.services.ai_service import ai_service

@router.post("/create-with-complaint", response_model=CreateIssueResponse)
async def create_issue_with_complaint(
    req: CreateIssueWithComplaintRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    POST /api/issues/create-with-complaint
    Creates a new civic issue along with the citizen's initial complaint and timeline record.
    Rejects complaints that are not valid civic/municipal problems.
    """
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
        return supabase_service.create_issue_with_complaint(req)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating civic issue: {str(e)}"
        )

@router.get("/{issue_id}", response_model=CivicIssueDetailResponse)
async def get_issue_detail(
    issue_id: str,
    citizen_id: Optional[str] = Query(None, description="Optional citizen ID to check support state")
):
    """
    GET /api/issues/{issue_id}
    Retrieves full details of a civic issue including progress updates, evidence photos, and responses.
    """
    try:
        return supabase_service.get_issue_detail(issue_id, citizen_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving civic issue: {str(e)}"
        )

@router.get("/{issue_id}/corroboration")
async def get_issue_corroboration(issue_id: str):
    """
    GET /api/issues/{issue_id}/corroboration
    Retrieves transparent community corroboration indicators and score.
    """
    try:
        return supabase_service.get_corroboration(issue_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching corroboration metrics: {str(e)}"
        )

@router.get("/{issue_id}/priority")
async def get_issue_priority(issue_id: str):
    """
    GET /api/issues/{issue_id}/priority
    Retrieves deterministic priority engine factor breakdown and score (0-100).
    """
    try:
        return supabase_service.get_priority_breakdown(issue_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching priority breakdown: {str(e)}"
        )

@router.get("/{issue_id}/priority-explanation")
async def get_issue_priority_explanation(
    issue_id: str,
    language: Optional[str] = Query("English", description="Target language for explanation")
):
    """
    GET /api/issues/{issue_id}/priority-explanation
    Uses Groq LLM to generate plain-language priority explanation from verified issue facts.
    """
    try:
        detail = supabase_service.get_issue_detail(issue_id)
        from app.services.ai_service import ai_service
        return ai_service.explain_priority(
            issue_id=detail.id,
            title=detail.title,
            category=detail.category,
            priority_level=detail.priority_level.value,
            priority_score=detail.priority_score,
            accidents_count=detail.accident_reports_count or 0,
            injuries_count=detail.injuries_count or 0,
            support_count=detail.support_count,
            complaints_count=detail.complaints_count,
            evidence_count=detail.evidence_count or 0,
            language=language or "English"
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating priority explanation: {str(e)}"
        )

@router.get("/{issue_id}/tracking")
async def get_issue_tracking(issue_id: str):
    """
    GET /api/issues/{issue_id}/tracking
    Retrieves progress tracking, inspection notes, and chronological updates for a civic issue.
    """
    try:
        return supabase_service.get_issue_tracking(issue_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching tracking progress: {str(e)}"
        )

@router.post("/{issue_id}/support", response_model=SupportToggleResponse)
async def toggle_issue_support(
    issue_id: str,
    req: SupportToggleRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    POST /api/issues/{issue_id}/support
    Toggles support (upvote) for a civic issue. Unique database constraint guarantees 1 support per citizen.
    """
    citizen_id = req.citizen_id
    if current_user and current_user.id != "anonymous-user":
        citizen_id = current_user.id

    try:
        return supabase_service.toggle_support(issue_id, citizen_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error toggling support: {str(e)}"
        )

@router.delete("/{issue_id}/support", response_model=SupportToggleResponse)
async def remove_issue_support(
    issue_id: str,
    citizen_id: Optional[str] = Query(None, description="Citizen ID removing support"),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    DELETE /api/issues/{issue_id}/support
    Explicitly removes support for a civic issue.
    """
    target_id = citizen_id or (current_user.id if current_user.id != "anonymous-user" else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="citizen_id is required or user must be signed in."
        )
    try:
        return supabase_service.remove_support(issue_id, target_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing support: {str(e)}"
        )

@router.get("/supported-by/{citizen_id}", response_model=List[CivicIssueResponse])
async def list_supported_issues(
    citizen_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    GET /api/issues/supported-by/{citizen_id}
    Returns all civic issues supported by the current citizen.
    """
    target_id = citizen_id or (current_user.id if current_user.id != "anonymous-user" else citizen_id)
    try:
        return supabase_service.list_supported_issues(target_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching supported issues: {str(e)}"
        )
