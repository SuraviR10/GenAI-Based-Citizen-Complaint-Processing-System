from fastapi import APIRouter, HTTPException, status
from app.models.ai import (
    ComplaintAnalysisRequest,
    ComplaintAnalysisResponse,
    FollowUpRequest,
    FollowUpResponse,
    ResponseSimplificationRequest,
    ResponseSimplificationResponse
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Operations"])

@router.post("/analyze-complaint", response_model=ComplaintAnalysisResponse)
async def analyze_complaint(req: ComplaintAnalysisRequest):
    """
    POST /api/ai/analyze-complaint
    Analyzes a citizen's natural language complaint using Groq AI.
    Extracts category, problem title, severity score, priority, safety concerns,
    accidents, and missing information. Supports English, Kannada, Hindi, etc.
    """
    if not req.original_text or not req.original_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint text cannot be empty."
        )
    try:
        result = ai_service.analyze_complaint(req)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing complaint: {str(e)}"
        )

@router.post("/follow-up", response_model=FollowUpResponse)
async def generate_follow_up_questions(req: FollowUpRequest):
    """
    POST /api/ai/follow-up
    Generates dynamic single-question follow-ups for missing information.
    """
    try:
        return ai_service.generate_follow_up(req.missing_fields, req.current_category)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating follow up questions: {str(e)}"
        )

@router.post("/simplify-response", response_model=ResponseSimplificationResponse)
async def simplify_corporation_response(req: ResponseSimplificationRequest):
    """
    POST /api/ai/simplify-response
    Translates complex municipal corporation notices into plain, citizen-friendly language.
    """
    if not req.official_response or not req.official_response.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Official response text cannot be empty."
        )
    try:
        return ai_service.simplify_response(
            official_text=req.official_response,
            issue_title=req.issue_title,
            language=req.language or "English"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error simplifying response: {str(e)}"
        )

@router.post("/priority-explanation")
async def generate_priority_explanation(req: dict):
    """
    POST /api/ai/priority-explanation
    Uses Groq LLM to explain why an issue received a specific priority level and score,
    constrained strictly to supplied facts.
    """
    try:
        return ai_service.explain_priority(
            issue_id=req.get("issue_id", ""),
            title=req.get("title", "Civic Issue"),
            category=req.get("category", "General"),
            priority_level=req.get("priority_level", "medium"),
            priority_score=int(req.get("priority_score", 50)),
            accidents_count=int(req.get("accidents_count", 0)),
            injuries_count=int(req.get("injuries_count", 0)),
            support_count=int(req.get("support_count", 0)),
            complaints_count=int(req.get("complaints_count", 1)),
            duration=req.get("duration", "not_sure"),
            evidence_count=int(req.get("evidence_count", 0)),
            language=req.get("language", "English")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating priority explanation: {str(e)}"
        )

@router.post("/consolidate-summary")
async def consolidate_issue_summary(req: dict):
    """
    POST /api/ai/consolidate-summary
    Synthesizes multiple citizen reports into a grounded narrative summary.
    """
    from app.models.ai import CivicConsolidationRequest
    try:
        model_req = CivicConsolidationRequest(
            issue_id=req.get("issue_id"),
            issue_title=req.get("issue_title", "Civic Problem"),
            category=req.get("category", "Roads & Footpaths"),
            area=req.get("area", "Local Area"),
            complaint_texts=req.get("complaint_texts", []),
            accidents_count=int(req.get("accidents_count", 0)),
            injuries_count=int(req.get("injuries_count", 0)),
            supporters_count=int(req.get("supporters_count", 0))
        )
        return ai_service.consolidate_issue_summary(model_req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error consolidating issue summary: {str(e)}"
        )

@router.post("/image-observation")
async def analyze_image_observation(req: dict):
    """
    POST /api/ai/image-observation
    Provides AI-assisted visual observation of citizen evidence.
    """
    from app.models.ai import ImageObservationRequest
    try:
        model_req = ImageObservationRequest(
            image_url=req.get("image_url", ""),
            complaint_text=req.get("complaint_text"),
            category=req.get("category")
        )
        return ai_service.analyze_image_observation(model_req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing image observation: {str(e)}"
        )

@router.post("/translate")
async def translate_content(req: dict):
    """
    POST /api/ai/translate
    Translates dynamic AI content between English, Kannada, and Hindi.
    """
    from app.models.ai import TranslationRequest
    try:
        model_req = TranslationRequest(
            text=req.get("text", ""),
            target_language=req.get("target_language", "English"),
            source_language=req.get("source_language")
        )
        return ai_service.translate_dynamic_content(model_req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error translating content: {str(e)}"
        )

@router.post("/assistant")
async def ask_civic_assistant(req: dict):
    """
    POST /api/ai/assistant
    Civic-specific assistant answering citizen questions on problem reporting, tracking,
    priority calculation, and municipal workflows in English, Kannada, or Hindi.
    """
    query = req.get("query", "").strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query text cannot be empty."
        )
    try:
        return ai_service.assist_citizen_query(
            query=query,
            context=req.get("context"),
            language=req.get("language", "English"),
            role=req.get("role", "citizen"),
            area=req.get("area"),
            department=req.get("department"),
            user_id=req.get("user_id")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing assistant query: {str(e)}"
        )


