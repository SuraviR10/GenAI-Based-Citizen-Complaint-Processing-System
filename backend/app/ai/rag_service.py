"""
CivicConnect AI — RAG (Retrieval-Augmented Generation) Service
Maintains the structured knowledge base of municipal policies, citizen charters,
complaint procedures, and SLAs, providing semantic context retrieval via embeddings.
"""

import logging
from typing import List, Dict, Any, Optional
from app.services.similarity_service import similarity_service

logger = logging.getLogger("civicconnect.ai.rag_service")

# ====================================================================
# 1. CIVIC KNOWLEDGE BASE DOCUMENTS
# ====================================================================

KNOWLEDGE_DOCUMENTS = [
    {
        "id": "doc_mcc_charter",
        "title": "Mysuru City Corporation (MCC) Citizen Charter & Service Standards",
        "category": "General Governance",
        "content": (
            "Mysuru City Corporation (MCC) is dedicated to providing transparent, citizen-centric municipal services. "
            "Under the Karnataka Municipal Corporation Act, citizens have the right to report road potholes, water supply leakages, "
            "overflowing sewage, uncollected garbage, and dysfunctional streetlights. Emergency safety hazards must be acknowledged "
            "within 24 hours, and standard road resurfacing works must commence within 48 to 72 hours of work order issuance."
        )
    },
    {
        "id": "doc_priority_engine",
        "title": "CivicConnect AI Deterministic Priority Engine Criteria",
        "category": "Priority & Triage",
        "content": (
            "Priority is NEVER decided arbitrarily by an LLM. CivicConnect AI computes a mathematical urgency score from 0 to 100 "
            "based on seven objective factors: 1) Baseline Severity (0-25 pts), 2) Citizen-reported Accidents (0-20 pts, +10 pts each), "
            "3) Reported Injuries (0-15 pts, +7.5 pts each), 4) Community Support Volume (0-15 pts logarithmic curve), "
            "5) Unresolved Duration (0-10 pts: >6 months gets 10 pts, 1-6 months gets 6.5 pts), 6) Photo Evidence (0-10 pts), "
            "and 7) Category Baseline Risk (0-5 pts). Scores map to LOW (0-24), MEDIUM (25-49), HIGH (50-74), and CRITICAL (75-100)."
        )
    },
    {
        "id": "doc_support_upvoting",
        "title": "Community Corroboration & Upvoting Protocol",
        "category": "Citizen Guidelines",
        "content": (
            "When multiple residents in the same neighborhood encounter a public infrastructure problem, they should click 'Support' "
            "on the existing issue rather than filing duplicate tickets. Each support vote corroborates that the issue is genuine, "
            "increases the community urgency score, and helps municipal engineers allocate field repair crews faster without cluttering the database."
        )
    },
    {
        "id": "doc_reporting_guide",
        "title": "How to Report a Civic Problem in Mysuru",
        "category": "Citizen Guidelines",
        "content": (
            "To report a civic problem: 1) Click 'Report a Problem' in the navigation bar. 2) Enter your description in English, Kannada, or Hindi. "
            "3) Select your Mysuru locality (e.g. Gokulam, Kuvempunagar, Vijayanagar, Hebbal) and landmark. 4) Upload clear photo evidence. "
            "5) Mention if any accidents, skids, or injuries occurred. CivicConnect AI will automatically check for similar existing issues "
            "to prevent duplicate tickets, assign a priority level, and submit the ticket to the relevant MCC department."
        )
    },
    {
        "id": "doc_worker_inspection",
        "title": "Field Worker Operations & Photo Verification Standards",
        "category": "Worker Protocols",
        "content": (
            "Field maintenance workers must follow a strict three-phase operational workflow: "
            "1) Phase 1 - Inspection: Upon arriving at the site, the worker changes status to 'Inspection' and uploads before-repair photos. "
            "2) Phase 2 - In Progress: Worker submits progress notes detailing asphalt application, pipe replacement, or drainage clearing. "
            "3) Phase 3 - Completion: Worker uploads clear after-repair proof photos and completion notes. Status is changed to 'Completed'."
        )
    },
    {
        "id": "doc_corporation_triage",
        "title": "Municipal Corporation Triage & Public Response Policy",
        "category": "Corporation Protocols",
        "content": (
            "Municipal officers must review the Priority Triage queue daily, prioritizing Critical and High items. "
            "When issuing formal work orders under Section 58 of the Municipal Act, officers can post official notices. "
            "CivicConnect AI automatically simplifies legalistic bureaucratic language into plain, citizen-friendly explanations "
            "in English, Kannada, and Hindi so residents clearly understand the repair timeline."
        )
    },
    {
        "id": "doc_mysore_localities",
        "title": "Mysuru City Corporation Wards & Key Localities",
        "category": "Geography",
        "content": (
            "MCC covers major residential, commercial, and heritage zones across Mysuru including Gokulam (Stages 1-3, Contour Road), "
            "Vijayanagar (Stages 1-4, High Tension Double Road), Kuvempunagar (Complex Circle, Vishwamanava Double Road), "
            "Jayalakshmipuram (Kalidasa Road), Saraswathipuram, Hebbal Industrial Area, Vontikoppal (VV Mohalla), Nazarbad, "
            "Chamundipuram, JP Nagar, Dattagalli, Yadavagiri, Bannimantap, and Siddhartha Layout."
        )
    }
]


# ====================================================================
# 2. RAG RETRIEVAL ENGINE
# ====================================================================

class RAGKnowledgeService:
    def __init__(self):
        self.documents = KNOWLEDGE_DOCUMENTS
        # Precompute embeddings for all knowledge chunks
        self._doc_embeddings = {}
        for doc in self.documents:
            text = f"{doc['title']}. {doc['category']}. {doc['content']}"
            self._doc_embeddings[doc['id']] = similarity_service.get_embedding(text)

    def retrieve_relevant_knowledge(self, query: str, top_k: int = 2, threshold: float = 0.22) -> List[Dict[str, Any]]:
        """
        Retrieves the top-k most semantically relevant knowledge document snippets
        matching the user's query using cosine similarity.
        """
        query_vec = similarity_service.get_embedding(query)
        if not query_vec:
            return []

        scored_docs = []
        for doc in self.documents:
            doc_vec = self._doc_embeddings.get(doc['id'], {})
            sim = similarity_service.calculate_cosine_similarity(query_vec, doc_vec)
            if sim >= threshold:
                scored_docs.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "category": doc["category"],
                    "content": doc["content"],
                    "similarity_score": round(sim, 3),
                    "source_type": "rag_knowledge_base",
                    "source_label": f"MCC Civic Guideline: {doc['title']}"
                })

        scored_docs.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_docs[:top_k]


rag_service = RAGKnowledgeService()
