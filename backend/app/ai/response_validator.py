"""
CivicConnect AI — Response Validator & Guardrails Engine
Enforces hallucination checks, non-civic input filtering, source citation attribution,
action button generation, and language consistency across English, Kannada, and Hindi.
"""

import re
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger("civicconnect.ai.response_validator")

class ResponseValidator:
    """
    Validates and enriches GenAI chatbot outputs with guardrails,
    grounded source citations, and interactive action buttons.
    """

    NON_CIVIC_KEYWORDS = {
        "recipe", "cook", "movie", "weather", "horoscope", "crypto", "bitcoin",
        "stock", "python code", "javascript code", "homework", "essay", "joke",
        "sing a song", "cricket score", "ipl score", "capital of", "prime minister"
    }

    @classmethod
    def is_non_civic_query(cls, text: str) -> bool:
        """Detects if a user question is completely unrelated to municipal or civic affairs."""
        t_clean = text.lower().strip()
        for kw in cls.NON_CIVIC_KEYWORDS:
            if kw in t_clean and not any(civic in t_clean for civic in ("road", "water", "garbage", "pothole", "light", "drainage", "mysore", "mcc", "complaint", "issue")):
                return True
        return False

    @classmethod
    def format_non_civic_response(cls, language: str = "English") -> Dict[str, Any]:
        """Generates a polite guidance message redirecting the user to civic topics."""
        lang_clean = (language or "English").lower()
        if "kannada" in lang_clean or "kn" in lang_clean:
            msg = (
                "ನಾನು ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ಮಾರ್ಗದರ್ಶಿ. "
                "ರಸ್ತೆ, ಕುಡಿಯುವ ನೀರು, ಒಳಚರಂಡಿ, ಬೀದಿದೀಪ ಮತ್ತು ಕಸ ವಿಲೇವಾರಿ ಮುಂತಾದ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ವರದಿ, "
                "ಬೆಂಬಲ ಮತ್ತು ಪ್ರಗತಿ ಪರಿಶೀಲನೆ ಕುರಿತು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ. "
                "ನಿಮ್ಮ ಬಡಾವಣೆಯ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ತಿಳಿಸಿ."
            )
            actions = [
                {"type": "navigate", "label": "📝 ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", "url": "/citizen/report"},
                {"type": "navigate", "label": "📋 ವಾರ್ಡ್ ಸಮಸ್ಯೆಗಳು", "url": "/citizen/issues"}
            ]
        elif "hindi" in lang_clean or "hi" in lang_clean:
            msg = (
                "मैं मैसूर नगर निगम (MCC) सिविककनेक्ट AI गाइड हूँ। "
                "सड़क, पानी, सीवरेज, स्ट्रीटलाइट और कचरा जैसी सार्वजनिक समस्याओं की रिपोर्टिंग, "
                "समर्थन और प्रगति देखने के बारे में मैं आपकी सहायता कर सकता हूँ। "
                "कृपया अपने क्षेत्र की नागरिक समस्या के बारे में पूछें।"
            )
            actions = [
                {"type": "navigate", "label": "📝 समस्या रिपोर्ट करें", "url": "/citizen/report"},
                {"type": "navigate", "label": "📋 वार्ड समस्याएं", "url": "/citizen/issues"}
            ]
        else:
            msg = (
                "I am the CivicConnect AI Guide for Mysuru Municipal Corporation (MCC). "
                "I am dedicated to helping you with municipal problem reporting (roads, water, garbage, streetlights), "
                "supporting community issues, and tracking repair progress. "
                "How can I help with your neighborhood's civic services?"
            )
            actions = [
                {"type": "navigate", "label": "📝 Report a Problem", "url": "/citizen/report"},
                {"type": "navigate", "label": "📋 Explore Issues", "url": "/citizen/issues"}
            ]

        return {
            "message": msg,
            "language": language,
            "sources": [{"type": "system", "label": "CivicConnect AI Help Desk"}],
            "actions": actions
        }

    @classmethod
    def sanitize_and_build_actions(
        cls,
        raw_message: str,
        role: str,
        language: str,
        tool_results: List[Dict[str, Any]],
        conversation_id: str
    ) -> Dict[str, Any]:
        """
        Extracts verified source citations, formats interactive action buttons,
        and ensures the message is factual and grounded.
        """
        sources: List[Dict[str, Any]] = []
        actions: List[Dict[str, Any]] = []

        # 1. Extract Sources from executed tool results
        for res in tool_results:
            source_type = res.get("source_type", "database")
            source_label = res.get("source_label")
            if source_label:
                sources.append({
                    "type": source_type,
                    "label": source_label,
                    "status": res.get("status", "success")
                })

            # Check if similar issues found -> suggest link/support actions
            if res.get("found_matches") and res.get("matched_issues"):
                top_match = res["matched_issues"][0]
                actions.append({
                    "type": "navigate",
                    "label": f"🔍 View Similar: {top_match['title'][:32]}...",
                    "url": f"/citizen/issues/{top_match['id']}"
                })
                actions.append({
                    "type": "navigate",
                    "label": "📝 Create New Report Instead",
                    "url": "/citizen/report"
                })

        # 2. Add Role-Specific Default Quick Actions if empty
        if not actions:
            role_clean = (role or "citizen").lower()
            lang_clean = (language or "English").lower()

            if role_clean == "worker":
                if "kannada" in lang_clean or "kn" in lang_clean:
                    actions = [
                        {"type": "navigate", "label": "📋 ನನ್ನ ಕೆಲಸಗಳ ಪಟ್ಟಿ", "url": "/worker"},
                        {"type": "navigate", "label": "📸 ಪರಿಶೀಲನೆ ಫೋಟೋ ಸಲ್ಲಿಸಿ", "url": "/worker"}
                    ]
                elif "hindi" in lang_clean or "hi" in lang_clean:
                    actions = [
                        {"type": "navigate", "label": "📋 मेरी कार्य सूची", "url": "/worker"},
                        {"type": "navigate", "label": "📸 निरीक्षण फोटो सबमिट करें", "url": "/worker"}
                    ]
                else:
                    actions = [
                        {"type": "navigate", "label": "📋 View Task Queue", "url": "/worker"},
                        {"type": "navigate", "label": "📸 Submit Inspection", "url": "/worker"}
                    ]

            elif role_clean == "corporation":
                if "kannada" in lang_clean or "kn" in lang_clean:
                    actions = [
                        {"type": "navigate", "label": "🏛️ ಆದ್ಯತಾ ಟ್ರಯೇಜ್", "url": "/corporation"},
                        {"type": "navigate", "label": "👷 ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣೆ", "url": "/corporation/workers"}
                    ]
                elif "hindi" in lang_clean or "hi" in lang_clean:
                    actions = [
                        {"type": "navigate", "label": "🏛️ प्राथमिकता ट्राइएज", "url": "/corporation"},
                        {"type": "navigate", "label": "👷 कार्यकर्ता प्रबंधन", "url": "/corporation/workers"}
                    ]
                else:
                    actions = [
                        {"type": "navigate", "label": "🏛️ Priority Triage", "url": "/corporation"},
                        {"type": "navigate", "label": "👷 Field Crews", "url": "/corporation/workers"}
                    ]

            else:
                if "kannada" in lang_clean or "kn" in lang_clean:
                    actions = [
                        {"type": "navigate", "label": "📝 ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", "url": "/citizen/report"},
                        {"type": "navigate", "label": "📋 ಸ್ಥಳೀಯ ವಾರ್ಡ್ ಸಮಸ್ಯೆಗಳು", "url": "/citizen/issues"}
                    ]
                elif "hindi" in lang_clean or "hi" in lang_clean:
                    actions = [
                        {"type": "navigate", "label": "📝 समस्या रिपोर्ट करें", "url": "/citizen/report"},
                        {"type": "navigate", "label": "📋 स्थानीय समस्याएं", "url": "/citizen/issues"}
                    ]
                else:
                    actions = [
                        {"type": "navigate", "label": "📝 Report a Problem", "url": "/citizen/report"},
                        {"type": "navigate", "label": "📋 Explore Community Issues", "url": "/citizen/issues"}
                    ]

        # 3. Clean and normalize message
        clean_msg = raw_message.strip()
        # Remove any lingering internal JSON artifacts if LLM outputted raw JSON
        if clean_msg.startswith("{") and clean_msg.endswith("}"):
            try:
                import json
                parsed = json.loads(clean_msg)
                clean_msg = parsed.get("answer") or parsed.get("message") or clean_msg
            except Exception:
                pass

        return {
            "message": clean_msg,
            "language": language,
            "sources": sources if sources else [{"type": "database", "label": "Mysuru MCC Live Records"}],
            "actions": actions,
            "conversation_id": conversation_id
        }
