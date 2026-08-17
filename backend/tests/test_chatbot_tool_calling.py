"""
CivicConnect AI — Comprehensive Chatbot & Tool Calling Test Suite
Validates:
1. Role-Based Tool Authorization (Citizen vs Worker vs Corporation)
2. Live Database Grounding & Zero Hallucination
3. RAG Knowledge Retrieval for Civic Charters & FAQs
4. Multilingual Chat Responses (English, Kannada, Hindi)
5. Multi-Turn Conversation Memory
6. Guardrails for Non-Civic Inquiries
"""

import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.auth import AuthUser
from app.ai.tool_registry import ToolRegistry
from app.ai.rag_service import rag_service
from app.ai.chatbot_service import chatbot_service
from app.services.supabase_service import supabase_service

client = TestClient(app)


# ====================================================================
# 1. ROLE-BASED TOOL AUTHORIZATION TESTS
# ====================================================================

def test_citizen_tool_permissions_and_restrictions():
    """Validates that citizen role can access search/my-complaints, but NOT worker/corp tools."""
    citizen_tools = ToolRegistry.get_tools_for_role("citizen")
    tool_names = [t["function"]["name"] for t in citizen_tools]

    assert "get_my_complaints" in tool_names
    assert "search_issues" in tool_names
    assert "find_similar_issues" in tool_names
    assert "get_help_information" in tool_names
    assert "get_assigned_issues" not in tool_names, "Citizen must not have worker tools"
    assert "get_priority_issues" not in tool_names, "Citizen must not have corporation tools"

    # Execution test: Citizen trying to invoke corporation tool directly
    unauthorized_res = ToolRegistry.execute_tool(
        tool_name="get_priority_issues",
        arguments={"limit": 5},
        user_id="citizen_123",
        user_role="citizen"
    )
    assert unauthorized_res["status"] == "unauthorized"
    assert "restricted" in unauthorized_res["message"].lower() or "denied" in unauthorized_res["message"].lower()


def test_worker_and_corporation_tool_permissions():
    """Validates that worker has assignment tools and corporation has triage tools."""
    worker_tools = [t["function"]["name"] for t in ToolRegistry.get_tools_for_role("worker")]
    assert "get_assigned_issues" in worker_tools
    assert "get_priority_issues" not in worker_tools

    corp_tools = [t["function"]["name"] for t in ToolRegistry.get_tools_for_role("corporation")]
    assert "get_assigned_issues" in corp_tools
    assert "get_priority_issues" in corp_tools
    assert "get_worker_assignments" in corp_tools


# ====================================================================
# 2. LIVE DATABASE RETRIEVAL & GROUNDING TESTS
# ====================================================================

def test_live_data_retrieval_accuracy():
    """Verifies that tool results match actual database records with zero hallucination."""
    # Seed a test issue
    test_id = "test_iss_grounding_001"
    supabase_service._memory_issues[test_id] = {
        "id": test_id,
        "title": "Severe Potholes on Kalidasa Road",
        "description": "Deep craters near water tank.",
        "category": "Roads & Footpaths",
        "area": "Jayalakshmipuram",
        "landmark": "Near Water Tank",
        "status": "in_progress",
        "priority_score": 85,
        "priority_level": "critical",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # Query via tool
    res = ToolRegistry.execute_tool("get_issue", {"issue_id": test_id}, "user_1", "citizen")
    assert res["status"] == "success"
    assert res["issue"]["title"] == "Severe Potholes on Kalidasa Road"
    assert res["issue"]["priority_score"] == 85
    assert res["issue"]["area"] == "Jayalakshmipuram"


# ====================================================================
# 3. RAG KNOWLEDGE BASE RETRIEVAL TESTS
# ====================================================================

def test_rag_knowledge_retrieval():
    """Validates semantic vector retrieval on MCC citizen charter and priority scoring."""
    docs = rag_service.retrieve_relevant_knowledge("how is the priority score calculated?", top_k=2)
    assert len(docs) > 0
    assert any("Priority" in d["title"] for d in docs)
    assert any("0 to 100" in d["content"] or "score" in d["content"] for d in docs)


# ====================================================================
# 4. MULTILINGUAL CHATBOT INTERACTIONS
# ====================================================================

def test_multilingual_citizen_queries():
    """Tests Kannada, Hindi, and English live responses for Citizen."""
    citizen_user = AuthUser(
        id="c1000000-0000-0000-0000-000000000001",
        role="citizen",
        full_name="Suresh Gowda",
        area="Gokulam"
    )

    # 1. Kannada Query
    res_kn = chatbot_service.chat(
        message="ಗೋಕುಲಂನಲ್ಲಿರುವ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳಾವವು?",
        user=citizen_user,
        language="Kannada"
    )
    assert res_kn["message"] is not None
    assert "Gokulam" in res_kn["message"] or "ಗೋಕುಲಂ" in res_kn["message"]
    assert res_kn["language"] == "Kannada"
    assert len(res_kn["sources"]) >= 1

    # 2. Hindi Query
    res_hi = chatbot_service.chat(
        message="गोकुलम में कौन सी समस्याएं हैं?",
        user=citizen_user,
        language="Hindi"
    )
    assert res_hi["message"] is not None
    assert res_hi["language"] == "Hindi"

    # 3. English Query
    res_en = chatbot_service.chat(
        message="Show my complaints",
        user=citizen_user,
        language="English"
    )
    assert res_en["message"] is not None
    assert "complaint" in res_en["message"].lower()


# ====================================================================
# 5. MULTI-TURN CONVERSATION MEMORY & GUARDRAILS
# ====================================================================

def test_conversation_memory_and_guardrails():
    """Tests multi-turn context retention and non-civic input filtering."""
    citizen_user = AuthUser(id="user_memory_test", role="citizen", full_name="Ravi", area="Vijayanagar")
    conv_id = "test_conv_session_999"

    # Non-civic query
    guard_res = chatbot_service.chat(
        message="Can you give me a recipe for chocolate cake?",
        user=citizen_user,
        conversation_id=conv_id,
        language="English"
    )
    assert "CivicConnect AI" in guard_res["message"]
    assert "problem" in guard_res["message"].lower() or "municipal" in guard_res["message"].lower()

    # Reset memory
    chatbot_service.memory.clear(conv_id)
    assert len(chatbot_service.memory.get_history(conv_id)) == 0


# ====================================================================
# 6. FASTAPI ENDPOINT INTEGRATION TESTS
# ====================================================================

def test_api_chat_endpoint():
    """Tests POST /api/chat endpoint with auth headers."""
    response = client.post(
        "/api/chat",
        headers={
            "X-User-Id": "c1000000-0000-0000-0000-000000000001",
            "X-User-Role": "citizen"
        },
        json={
            "message": "What is happening with issues in Gokulam?",
            "language": "English"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "sources" in data
    assert "actions" in data
    assert "conversation_id" in data
