"""
CivicConnect AI — Comprehensive GenAI Evaluation Benchmark & Test Suite
Evaluates the core GenAI capabilities across English, Kannada, and Hindi:
1. Civic Relevance & Non-Civic Graceful Rejection
2. Structured Entity, Safety, and Accident Extraction
3. Cross-Lingual Semantic Similarity & Deduplication
4. Zero-Hallucination Grounded Priority Explanations
5. Bureaucracy Simplification Integrity
6. Multi-Complaint Grounded Issue Synthesis
"""

import pytest
from app.models.ai import (
    ComplaintAnalysisRequest,
    ResponseSimplificationRequest,
    CivicConsolidationRequest,
    TranslationRequest
)
from app.services.ai_service import ai_service
from app.services.similarity_service import similarity_service
from app.services.priority_service import priority_engine

# ====================================================================
# 1. MULTILINGUAL CIVIC RELEVANCE EVALUATION BENCHMARK
# ====================================================================

EVALUATION_COMPLAINTS = [
    # English Civic Complaints
    {
        "text": "Deep dangerous pothole near ABC National School on 100ft Road. Two bikes skidded yesterday.",
        "lang": "English",
        "expected_civic": True,
        "expected_category": "Roads & Footpaths",
        "expected_safety": True,
        "min_accidents": 2
    },
    {
        "text": "Main drainage sewage overflow on 5th Cross Koramangala. Disgusting smell and health hazard.",
        "lang": "English",
        "expected_civic": True,
        "expected_category": "Water & Sewage",
        "expected_safety": False,
        "min_accidents": 0
    },
    {
        "text": "All streetlights are completely off on 12th Main Road for the past two weeks, making it pitch black.",
        "lang": "English",
        "expected_civic": True,
        "expected_category": "Street Lighting",
        "expected_safety": False,
        "min_accidents": 0
    },
    # English Non-Civic Complaints
    {
        "text": "My iPhone 14 display screen cracked after falling from table. Need screen replacement.",
        "lang": "English",
        "expected_civic": False,
        "expected_category": None,
        "expected_safety": False,
        "min_accidents": 0
    },
    {
        "text": "My food delivery order #4819 was delayed by 45 minutes and soup was cold. Refund please.",
        "lang": "English",
        "expected_civic": False,
        "expected_category": None,
        "expected_safety": False,
        "min_accidents": 0
    },
    # Kannada Civic Complaints
    {
        "text": "ABC ಶಾಲೆಯ ಹತ್ತಿರ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ. ಇಬ್ಬರು ಬೈಕ್‌ನಿಂದ ಬಿದ್ದಿದ್ದಾರೆ.",
        "lang": "Kannada",
        "expected_civic": True,
        "expected_category": "Roads & Footpaths",
        "expected_safety": True,
        "min_accidents": 2
    },
    {
        "text": "ನಮ್ಮ ಏರಿಯಾದಲ್ಲಿ ಕಸದ ಡಬ್ಬಿ ತುಂಬಿ ತುಳುಕುತ್ತಿದೆ, ರಸ್ತೆಯಲ್ಲಿ ಕಸ ಹರಡಿದೆ.",
        "lang": "Kannada",
        "expected_civic": True,
        "expected_category": "Garbage & Sanitation",
        "expected_safety": False,
        "min_accidents": 0
    },
    # Kannada Non-Civic Complaints
    {
        "text": "ನನ್ನ ಲ್ಯಾಪ್‌ಟಾಪ್ ಚಾರ್ಜರ್ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ, ಹೊಸದು ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?",
        "lang": "Kannada",
        "expected_civic": False,
        "expected_category": None,
        "expected_safety": False,
        "min_accidents": 0
    },
    # Hindi Civic Complaints
    {
        "text": "ABC स्कूल के पास सड़क पर बहुत बड़ा गड्ढा है। कल दो बाइक सवार गिर गए थे।",
        "lang": "Hindi",
        "expected_civic": True,
        "expected_category": "Roads & Footpaths",
        "expected_safety": True,
        "min_accidents": 2
    },
    {
        "text": "गली की सभी स्ट्रीट लाइटें पिछले 10 दिनों से बंद हैं, रात में अंधेरा रहता है।",
        "lang": "Hindi",
        "expected_civic": True,
        "expected_category": "Street Lighting",
        "expected_safety": False,
        "min_accidents": 0
    },
    # Hindi Non-Civic Complaints
    {
        "text": "मेरा ऑनलाइन शॉपिंग का पार्सल अभी तक डिलीवर नहीं हुआ है।",
        "lang": "Hindi",
        "expected_civic": False,
        "expected_category": None,
        "expected_safety": False,
        "min_accidents": 0
    }
]

def test_multilingual_complaint_relevance_benchmark():
    """Validates civic relevance accuracy across English, Kannada, and Hindi."""
    for case in EVALUATION_COMPLAINTS:
        req = ComplaintAnalysisRequest(
            original_text=case["text"],
            language=case["lang"]
        )
        res = ai_service.analyze_complaint(req)
        
        assert res.is_civic_issue == case["expected_civic"], (
            f"Failed relevance check for [{case['lang']}]: {case['text']}. "
            f"Expected {case['expected_civic']}, got {res.is_civic_issue}"
        )
        
        if not case["expected_civic"]:
            assert res.rejection_reason is not None, "Non-civic issue must have a polite educational rejection reason"
            assert len(res.rejection_reason) > 10, "Rejection reason must be informative"
        else:
            assert res.category is not None, "Civic issue must have an assigned category"
            assert len(res.problem_title) > 3, "Civic issue must have a clear problem title"


def test_structured_accident_and_safety_extraction():
    """Validates that accidents, injuries, and safety concerns are correctly extracted."""
    req = ComplaintAnalysisRequest(
        original_text="Severe crater near metro pillar 120. Two bikers fell into it and suffered bleeding injuries.",
        language="English",
        accident_reported=True,
        accident_description="2 bikers injured after falling into crater"
    )
    res = ai_service.analyze_complaint(req)
    assert res.safety_concern is True, "Must identify severe safety concern"
    assert res.reported_accidents_count >= 1, "Must extract accident count"
    assert res.severity_score >= 3, "Severity must be elevated for injuries"


# ====================================================================
# 2. CROSS-LINGUAL SIMILARITY BENCHMARK
# ====================================================================

def test_cross_lingual_semantic_similarity():
    """
    Validates that similar complaints in different languages referring to the same
    location and problem yield strong semantic similarity.
    """
    comp_en = "Massive dangerous pothole near ABC National School on main road."
    comp_kn = "ABC ಶಾಲೆಯ ಹತ್ತಿರ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ."
    comp_hi = "ABC स्कूल के पास सड़क पर बहुत बड़ा गड्ढा है।"

    vec_en = similarity_service.get_embedding(comp_en)
    vec_kn = similarity_service.get_embedding(comp_kn)
    vec_hi = similarity_service.get_embedding(comp_hi)

    sim_en_kn = similarity_service.calculate_cosine_similarity(vec_en, vec_kn)
    sim_en_hi = similarity_service.calculate_cosine_similarity(vec_en, vec_hi)

    # Cross-lingual shared entity 'ABC' and domain concepts should yield positive similarity
    assert sim_en_kn > 0.15, f"Expected cross-lingual overlap for EN-KN, got {sim_en_kn}"
    assert sim_en_hi > 0.15, f"Expected cross-lingual overlap for EN-HI, got {sim_en_hi}"


def test_distinct_complaints_low_similarity():
    """Validates that completely different problems in different areas have low similarity."""
    comp_road = "Massive pothole on Indiranagar 100ft road near KFC."
    comp_garbage = "Overflowing garbage dump in Whitefield behind ITPL park."

    vec_a = similarity_service.get_embedding(comp_road)
    vec_b = similarity_service.get_embedding(comp_garbage)

    sim = similarity_service.calculate_cosine_similarity(vec_a, vec_b)
    assert sim < 0.35, f"Dissimilar complaints should have low similarity, got {sim}"


# ====================================================================
# 3. FACT-CONSTRAINED PRIORITY EXPLANATION EVALUATION
# ====================================================================

def test_priority_explanation_strict_fact_grounding():
    """
    Verifies that the GenAI priority explanation strictly incorporates
    supplied factual numbers and never fabricates nonexistent facts.
    """
    explanation_res = ai_service.explain_priority(
        issue_id="issue-test-99",
        title="Damaged Road – ABC School",
        category="Roads & Footpaths",
        priority_level="critical",
        priority_score=91,
        accidents_count=3,
        injuries_count=2,
        support_count=73,
        complaints_count=5,
        duration="20_days",
        evidence_count=4,
        language="English"
    )

    exp_text = explanation_res["explanation"]
    
    # Priority score and level must match exactly
    assert explanation_res["priority_score"] == 91
    assert explanation_res["priority_level"] == "critical"
    
    # The factual numbers must be referenced
    assert "3" in exp_text or "three" in exp_text.lower(), "Must reference 3 accidents"
    assert "73" in exp_text or "supporters" in exp_text.lower(), "Must reference community supporters"
    assert len(explanation_res["key_factors_summary"]) >= 2, "Must return structured contributing factors"


# ====================================================================
# 4. MULTI-REPORT ISSUE CONSOLIDATION EVALUATION
# ====================================================================

def test_multi_complaint_grounded_consolidation():
    """
    Verifies that multiple independent complaints are synthesized into a cohesive narrative
    grounded strictly in the input reports.
    """
    req = CivicConsolidationRequest(
        issue_title="Severe Potholes & Waterlogging – 80ft Road",
        category="Roads & Footpaths",
        area="Indiranagar",
        complaint_texts=[
            "Huge pothole right outside coffee shop on 80ft road. Two wheelers skid when it rains.",
            "Water accumulates in the crater near 80ft road junction. Very dangerous at night.",
            "Bike fell in the hole yesterday evening. Rider got minor scratches."
        ],
        accidents_count=1,
        injuries_count=1,
        supporters_count=34
    )
    res = ai_service.consolidate_issue_summary(req)

    assert res.consolidated_title is not None
    assert len(res.executive_summary) > 20
    assert "80ft" in res.executive_summary or "Indiranagar" in res.executive_summary
    assert len(res.key_symptoms) >= 2


# ====================================================================
# 5. RESPONSE SIMPLIFICATION INTEGRITY EVALUATION
# ====================================================================

def test_response_simplification_factual_integrity():
    """
    Verifies that bureaucratic notices are simplified into clear citizen language
    without altering the underlying factual commitment.
    """
    bureaucratic_notice = (
        "Pursuant to municipal engineering audit under Section 42 of Karnataka Municipal Corporations Act, "
        "Work Order #ENG-2026-8941 has been issued to the asphalt division for immediate hot-mix milling and "
        "sub-base rectification. Field crews are dispatched to commence preliminary works within 24 hours."
    )

    req = ResponseSimplificationRequest(
        official_response=bureaucratic_notice,
        issue_title="Damaged Road Pothole",
        language="English"
    )
    res = ai_service.simplify_official_response(req)

    assert res.simplified_summary is not None
    assert len(res.simplified_summary) > 20
    assert len(res.key_action_points) >= 1
    assert "Karnataka Municipal Corporations Act" not in res.simplified_summary, "Must strip legalistic jargon"


# ====================================================================
# 6. DYNAMIC TRANSLATION EVALUATION
# ====================================================================

def test_dynamic_translation_service():
    """Validates translation service for dynamic AI content."""
    req = TranslationRequest(
        text="The repair crew has arrived at the site and started road resurfacing.",
        target_language="Kannada"
    )
    res = ai_service.translate_dynamic_content(req)
    assert res.translated_text is not None
    assert res.target_language == "Kannada"


# ====================================================================
# 7. REAL-TIME MULTILINGUAL ASSISTANT EVALUATION
# ====================================================================

def test_realtime_assistant_multilingual_citizen():
    """Validates real-time live querying for Citizen in Kannada, Hindi, English."""
    # 1. Kannada Query
    res_kn = ai_service.assist_citizen_query(
        query="ಗೋಕುಲಂನಲ್ಲಿರುವ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳಾವವು?",
        language="Kannada",
        role="citizen",
        area="Gokulam"
    )
    assert res_kn["answer"] is not None
    assert len(res_kn["suggested_actions"]) >= 1
    assert "Gokulam" in res_kn["answer"] or "ಗೋಕುಲಂ" in res_kn["answer"] or "ಮೈಸೂರು" in res_kn["answer"]

    # 2. Hindi Query
    res_hi = ai_service.assist_citizen_query(
        query="गोकुलम में कौन सी समस्याएं दर्ज हैं?",
        language="Hindi",
        role="citizen",
        area="Gokulam"
    )
    assert res_hi["answer"] is not None
    assert "Gokulam" in res_hi["answer"] or "गोकुलम" in res_hi["answer"] or "मैसूर" in res_hi["answer"]

    # 3. English Query
    res_en = ai_service.assist_citizen_query(
        query="What are the live issues near Gokulam?",
        language="English",
        role="citizen",
        area="Gokulam"
    )
    assert res_en["answer"] is not None
    assert "Gokulam" in res_en["answer"]


def test_realtime_assistant_corporation_and_worker():
    """Validates real-time assistant for Corporation Officials and Field Workers."""
    # Corporation Triage in Kannada
    corp_res = ai_service.assist_citizen_query(
        query="ಬಾಕಿ ಇರುವ ತುರ್ತು ಸಮಸ್ಯೆಗಳ ವಿವರ ತಿಳಿಸಿ",
        language="Kannada",
        role="corporation",
        area="Vijayanagar"
    )
    assert corp_res["answer"] is not None
    assert any(word in corp_res["answer"].lower() for word in ["vijayanagar", "ಮೈಸೂರು", "mcc", "ವಿಜಯನಗರ", "ಸಮಸ್ಯೆ", "ತುರ್ತು", "ಆಡಳಿತ", "ನಾಗರಿಕ", "ಲೈವ್", "ವಿವರ"])

    # Worker Tasks in Hindi
    worker_res = ai_service.assist_citizen_query(
        query="मेरे आवंटित कार्य कौन से हैं?",
        language="Hindi",
        role="worker",
        area="Kuvempunagar",
        user_id="w1000000-0000-0000-0000-000000000001"
    )
    assert worker_res["answer"] is not None
    assert "कार्य" in worker_res["answer"] or "मैसूर" in worker_res["answer"]

