"""
CivicConnect AI — Chatbot API Router
Exposes secure POST /api/chat and POST /api/chat/reset endpoints
protected by role-based user authentication.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.auth import get_current_user, AuthUser
from app.ai.chatbot_service import chatbot_service

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's query or message in English, Kannada, or Hindi")
    conversation_id: Optional[str] = Field(None, description="Optional multi-turn conversation/session ID")
    language: Optional[str] = Field("English", description="Target language ('English', 'Kannada', 'Hindi')")
    context: Optional[str] = Field(None, description="Optional current page or workflow context")


class ChatAction(BaseModel):
    type: str
    label: str
    url: Optional[str] = None
    action_id: Optional[str] = None


class ChatSource(BaseModel):
    type: str
    label: str
    status: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    language: str
    sources: List[ChatSource] = []
    actions: List[ChatAction] = []
    conversation_id: str


@router.post("", response_model=ChatResponse)
async def handle_chat_message(
    req: ChatRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    POST /api/chat
    Unified, role-aware, database-grounded GenAI chatbot endpoint.
    Uses authenticated user's role to execute permitted tools and query live data.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    try:
        result = chatbot_service.chat(
            message=req.message.strip(),
            user=current_user,
            conversation_id=req.conversation_id,
            language=req.language or current_user.preferred_language or "English",
            context=req.context
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in chatbot service: {str(e)}"
        )


@router.post("/reset")
async def reset_conversation(
    req: Dict[str, str],
    current_user: AuthUser = Depends(get_current_user)
):
    """
    POST /api/chat/reset
    Clears multi-turn conversation memory for a conversation_id.
    """
    conv_id = req.get("conversation_id")
    if conv_id:
        chatbot_service.memory.clear(conv_id)
    return {"status": "success", "message": "Conversation history reset."}
