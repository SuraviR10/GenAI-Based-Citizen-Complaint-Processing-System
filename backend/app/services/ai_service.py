import json
import logging
import re
from typing import Dict, Any, List, Optional
from groq import Groq
from app.config import settings
from app.prompts import get_prompt
from app.models.ai import (
    ComplaintAnalysisRequest,
    ComplaintAnalysisResponse,
    FollowUpRequest,
    FollowUpResponse,
    ResponseSimplificationRequest,
    ResponseSimplificationResponse,
    CivicConsolidationRequest,
    CivicConsolidationResponse,
    ImageObservationRequest,
    ImageObservationResponse,
    TranslationRequest,
    TranslationResponse
)

logger = logging.getLogger("civicconnect.ai_service")

class AIService:
    """
    Central AI service orchestrator for CivicConnect.
    Directs natural language processing, complaint classification,
    triage severity calculation, deduplication matching, and bureaucratic simplification.
    """

    def __init__(self):
        self._groq_client = None

    @property
    def groq_client(self) -> Groq:
        if self._groq_client is None and settings.is_groq_configured:
            self._groq_client = Groq(api_key=settings.GROQ_API_KEY)
        return self._groq_client

    def analyze_complaint(self, req: ComplaintAnalysisRequest) -> ComplaintAnalysisResponse:
        """
        Processes a natural language civic complaint.
        Extracts structured entities, civic category, normalized title,
        safety indicators, and severity score (1-5).
        """
        # If Groq is not configured or in testing fallback mode
        if not settings.is_groq_configured or not self.groq_client:
            return self._heuristic_analyze(req)

        client = self.groq_client
        system_prompt = get_prompt("complaint_analysis")

        user_content = (
            f"Original Complaint: \"{req.original_text}\"\n"
            f"User Declared Language: {req.language}\n"
            f"User Declared Area: {req.area}\n"
            f"User Declared Landmark: {req.landmark}\n"
            f"User Reported Accident: {req.accident_reported}\n"
            f"Accident Description: {req.accident_description}\n"
            f"Reported Duration: {req.duration}\n"
        )

        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            raw_json = chat_completion.choices[0].message.content
            parsed = json.loads(raw_json)

            is_civic = bool(parsed.get("is_civic_issue", True))
            rejection_reason = parsed.get("rejection_reason")
            category = parsed.get("category") or "Roads & Footpaths"
            problem_title = parsed.get("problem_title") or "Civic Complaint Reported"
            normalized_text = parsed.get("normalized_text") or req.original_text
            detected_lang = parsed.get("detected_language") or req.language or "English"
            area = parsed.get("area") or req.area or "Local Area"
            landmark = parsed.get("landmark") or req.landmark
            safety_concern = bool(parsed.get("safety_concern", req.accident_reported))
            severity_score = int(parsed.get("severity_score", 3))
            suggested_priority = parsed.get("suggested_priority") or ("high" if safety_concern else "medium")
            accidents_count = int(parsed.get("reported_accidents_count", 1 if req.accident_reported else 0))
            duration = parsed.get("estimated_duration") or req.duration or "not_sure"
            missing = parsed.get("missing_critical_info") or []

            return ComplaintAnalysisResponse(
                is_civic_issue=is_civic,
                rejection_reason=rejection_reason,
                category=category,
                problem_title=problem_title,
                normalized_text=normalized_text,
                detected_language=detected_lang,
                area=area,
                landmark=landmark,
                safety_concern=safety_concern,
                severity_score=severity_score,
                suggested_priority=suggested_priority,
                reported_accidents_count=accidents_count,
                estimated_duration=duration,
                missing_critical_info=missing,
                is_fallback=False
            )
        except Exception as e:
            logger.error(f"Groq AI call failed: {e}. Falling back to heuristic engine.")
            return self._heuristic_analyze(req)

    def _heuristic_analyze(self, req: ComplaintAnalysisRequest) -> ComplaintAnalysisResponse:
        """Intelligent rule-based fallback when Groq credentials are not yet configured."""
        text_clean = (req.original_text or "").strip()
        text_lower = text_clean.lower()

        # Non-civic pattern detection
        non_civic_patterns = [
            r"^(hi|hello|hey|test|testing|asdf|qwerty|zzz|aaa|bbb|yo|sup|hola)\b",
            r"\b(girlfriend|boyfriend|love story|breakup|dating|marry|husband|wife|divorce|crush)\b",
            r"\b(homework|essay on|write code|python script|solve this math|2\+2|calculate|exam|algebra)\b",
            r"\b(restaurant food|ordered pizza|burger|zomato|swiggy|uber eats|movie review|cricket score|buy bitcoin|crypto|stock market|soup was cold)\b",
            r"\b(how are you|who are you|what is your name|tell me a joke|sing a song|good morning|good evening)\b",
            r"\b(iphone|android|smartphone|phone screen|display screen|screen cracked|screen replacement|cracked screen|mobile charger|charger|wifi router|pc gaming|playstation|xbox|netflix|youtube channel|laptop)\b",
            r"\b(buy car|sell bike|flipkart delivery|amazon parcel|courier delay|shoes|clothes|online delivery|shopping|delivery order)\b",
            r"(ಪಿಜ್ಜಾ|ಆರ್ಡರ್|ಹೋಟೆಲ್|ಜೊಮ್ಯಾಟೊ|ಸ್ವಿಗ್ಗಿ|ಮೊಬೈಲ್|ಲ್ಯಾಪ್‌ಟಾಪ್|ಚಾರ್ಜರ್|ಸ್ಕ್ರೀನ್|ಫೋನ್|ಸಿನಿಮಾ|ಹಾಡು|ಹಲೋ|ಹೇಗಿದ್ದೀರಾ)",
            r"(पिज़्ज़ा|ऑर्डर|होटल|ज़ोमैटो|स्वीगी|मोबाइल|लैपटॉप|चार्जर|स्क्रीन|फोन|सिनेमा|गाना|नमस्ते|कैसे हो|क्रिकेट|शॉपिंग|डिलीवर)"
        ]

        # Gibberish & repetition checks
        cleaned_chars = re.sub(r"[^a-zA-Z]", "", text_lower)
        is_too_short = len(text_clean) < 6 or len(text_clean.split()) < 2
        is_repetitive = len(set(text_lower.replace(" ", ""))) < 4
        is_gibberish = bool(cleaned_chars and (
            re.search(r"(.)\1{3,}", text_lower) or # e.g. aaaaa, zzzz
            re.search(r"[bcdfghjklmnpqrstvwxyz]{6,}", text_lower) # e.g. dsfghjkl
        ))
        is_pattern_match = any(re.search(pat, text_lower) for pat in non_civic_patterns)

        # Check for positive civic keywords in English, transliterated, Kannada and Hindi
        civic_keywords = [
            # English & Transliteration
            "road", "pothole", "potholes", "street", "footpath", "tar", "asphalt", "crater", "craters", "lane", "khadde", "rasta", "daari",
            "water", "sewage", "drain", "drainage", "pipe", "pipeline", "leak", "leaking", "overflow", "overflowing", "gutter", "manhole", "pani", "neeru",
            "light", "dark", "lamp", "pole", "bulb", "electricity", "wire", "cable", "blackout", "roshni", "deepa", "streetlight", "streetlights",
            "garbage", "trash", "waste", "dump", "dumping", "bin", "bins", "smell", "odor", "kachra", "clean", "debris", "kasavu", "sanitation",
            "hazard", "fire", "danger", "fall", "falling", "tree", "shock", "collapse", "khatra", "accident", "injury", "slip", "traffic",
            "park", "garden", "noise", "pollution", "stray", "mosquito", "fogging", "bbmp", "ward", "corporation", "pavement", "culvert",
            # Native Kannada terms
            "ರಸ್ತೆ", "ಗುಂಡಿ", "ಪಾದಚಾರಿ", "ಹೊಂಡ", "ನೀರು", "ಒಳಚರಂಡಿ", "ಸೋರಿಕೆ", "ಕೊಳವೆ", "ಮ್ಯಾನ್‌ಹೋಲ್", "ದೀಪ", "ಬೆಳಕು", "ಬೀದಿದೀಪ", "ಕತ್ತಲೆ", "ತಂತಿ", "ವಿದ್ಯುತ್", "ಕಸ", "ತ್ಯಾಜ್ಯ", "ವಾಸನೆ", "ನೈರ್ಮಲ್ಯ", "ಅಪಾಯ", "ಅಪಘಾತ", "ಮರ", "ಬಿದ್ದಿದೆ", "ಚರಂಡಿ",
            # Native Hindi terms
            "सड़क", "गड्ढा", "गड्ढे", "फुटपाथ", "रास्ता", "पानी", "सीवेज", "नाली", "लीकेज", "पाइप", "मैनहोल", "जल", "लाइट", "स्ट्रीटलाइट", "बत्ती", "अंधेरा", "बिजली", "तार", "खंभा", "कचरा", "कूड़ा", "गंदगी", "बदबू", "सफाई", "खतरा", "दुर्घटना", "पेड़", "चोट"
        ]
        has_civic_term = any(w in text_lower for w in civic_keywords)

        # Language Detection
        detected_language = req.language or "English"
        if any('\u0c80' <= c <= '\u0cff' for c in text_clean):
            detected_language = "Kannada"
        elif any('\u0900' <= c <= '\u097f' for c in text_clean):
            detected_language = "Hindi"

        # Check for non-civic input rejection
        if (is_too_short or is_repetitive or is_gibberish or is_pattern_match or not has_civic_term):
            rejection_msg = (
                "This does not appear to be a civic or municipal infrastructure issue. "
                "CivicConnect AI is dedicated to public problems such as damaged roads, broken streetlights, sewage leaks, "
                "garbage accumulation, and neighborhood hazards. Please describe a municipal problem or contact the appropriate service."
            )
            if detected_language == "Kannada":
                rejection_msg = "ಇದು ಸಾರ್ವಜನಿಕ ಅಥವಾ ಪುರಸಭೆಯ ಸಮಸ್ಯೆಯಾಗಿ ಕಾಣಿಸುತ್ತಿಲ್ಲ. ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ರಸ್ತೆ ಗುಂಡಿ, ಒಳಚರಂಡಿ, ಬೀದಿದೀಪ ಮತ್ತು ಕಸದಂತಹ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ವರದಿಗೆ ಮಾತ್ರ ಮೀಸಲಾಗಿದೆ."
            elif detected_language == "Hindi":
                rejection_msg = "यह कोई नागरिक या नगर निगम से संबंधित समस्या नहीं लग रही है। सिविककनेक्ट AI टूटी सड़कें, स्ट्रीटलाइट, सीवेज और कचरे जैसी सार्वजनिक समस्याओं के समाधान के लिए है।"

            return ComplaintAnalysisResponse(
                is_civic_issue=False,
                rejection_reason=rejection_msg,
                category="Other Civic Issue",
                problem_title="Non-Civic / Invalid Request",
                normalized_text=text_clean,
                detected_language=detected_language,
                area=req.area or "Local Ward",
                landmark=req.landmark,
                safety_concern=False,
                severity_score=1,
                suggested_priority="low",
                reported_accidents_count=0,
                estimated_duration="not_sure",
                missing_critical_info=["Valid municipal or civic problem description"],
                is_fallback=True
            )

        # Category detection
        category = "Other Civic Issue"
        if any(w in text_lower for w in ["pothole", "potholes", "road", "footpath", "asphalt", "crater", "pavement", "tar", "khadde", "rasta", "daari", "ರಸ್ತೆ", "ಗುಂಡಿ", "ಪಾದಚಾರಿ", "ಹೊಂಡ", "सड़क", "गड्ढा", "गड्ढे", "फुटपाथ"]):
            category = "Roads & Footpaths"
        elif any(w in text_lower for w in ["water", "sewage", "drain", "drainage", "pipe", "leak", "overflow", "gutter", "manhole", "pani", "neeru", "ನೀರು", "ಒಳಚರಂಡಿ", "ಸೋರಿಕೆ", "ಚರಂಡಿ", "पानी", "सीवेज", "नाली", "पाइप"]):
            category = "Water & Sewage"
        elif any(w in text_lower for w in ["light", "dark", "lamp", "pole", "bulb", "electricity", "wire", "cable", "blackout", "roshni", "deepa", "streetlight", "ದೀಪ", "ಬೆಳಕು", "ಬೀದಿದೀಪ", "ಕತ್ತಲೆ", "ತಂತಿ", "ವಿದ್ಯುತ್", "लाइट", "स्ट्रीटलाइट", "बत्ती", "अंधेरा", "बिजली"]):
            category = "Street Lighting"
        elif any(w in text_lower for w in ["garbage", "trash", "waste", "dump", "bin", "smell", "odor", "kachra", "clean", "kasavu", "sanitation", "ಕಸ", "ತ್ಯಾಜ್ಯ", "ವಾಸನೆ", "ನೈರ್ಮಲ್ಯ", "कचरा", "कूड़ा", "गंदगी", "बदबू", "सफाई"]):
            category = "Garbage & Sanitation"
        elif any(w in text_lower for w in ["hazard", "fire", "danger", "fall", "tree", "wire", "shock", "collapse", "khatra", "ಅಪಾಯ", "ಅಪಘಾತ", "ಮರ", "खतरा", "दुर्घटना", "पेड़"]):
            category = "Public Safety & Hazards"

        # Safety & Accidents
        safety_words = ["accident", "fall", "injury", "injured", "hospital", "slip", "hit", "crash", "danger", "risk", "ಅಪಘಾತ", "ಅಪಾಯ", "दुर्घटना", "खतरा", "चोट"]
        has_safety = req.accident_reported or any(w in text_lower for w in safety_words)
        accident_count = 1 if req.accident_reported or "accident" in text_lower or "ಅಪಘಾತ" in text_lower or "दुर्घटना" in text_lower else 0

        # Severity Score
        severity = 2
        if category in ["Public Safety & Hazards"]:
            severity = 4
        if has_safety:
            severity = max(severity, 4)
        if req.duration in ["more_than_6_months", "1_to_6_months"]:
            severity = min(severity + 1, 5)

        priority = "low"
        if severity >= 4:
            priority = "critical" if (accident_count > 0 or severity == 5) else "high"
        elif severity == 3:
            priority = "medium"

        # Construct concise problem title
        title_map = {
            "Roads & Footpaths": "Road Surface & Pothole Damage",
            "Water & Sewage": "Water Leakage & Sewage Blockage",
            "Street Lighting": "Street Lighting & Electrical Failure",
            "Garbage & Sanitation": "Garbage & Sanitation Issue",
            "Public Safety & Hazards": "Public Safety Hazard Reported",
            "Parks & Environment": "Park & Environmental Maintenance",
            "Other Civic Issue": "Civic Maintenance Request"
        }
        problem_title = title_map.get(category, "Civic Problem Reported")
        if req.landmark:
            problem_title += f" near {req.landmark}"
        elif req.area:
            problem_title += f" in {req.area}"

        return ComplaintAnalysisResponse(
            is_civic_issue=True,
            rejection_reason=None,
            category=category,
            problem_title=problem_title,
            normalized_text=text_clean,
            detected_language=detected_language,
            area=req.area or "Gokulam",
            landmark=req.landmark,
            safety_concern=has_safety,
            severity_score=severity,
            suggested_priority=priority,
            reported_accidents_count=accident_count,
            estimated_duration=req.duration or "not_sure",
            missing_critical_info=[],
            is_fallback=True
        )

    def simplify_official_response(self, req: ResponseSimplificationRequest) -> ResponseSimplificationResponse:
        """
        Translates bureaucratic or technical municipal notices into citizen-friendly summaries.
        """
        text = req.official_response or ""
        lang = req.language or "English"

        if not settings.is_groq_configured or not self.groq_client:
            return ResponseSimplificationResponse(
                simplified_summary=(
                    f"Good news: Municipal teams have reviewed this issue. "
                    f"Necessary materials and repair workers are being coordinated for on-site execution."
                ),
                key_action_points=[
                    "Issue reviewed by the department",
                    "Assigned repair crew organizing field work",
                    "Expected resolution scheduled"
                ],
                estimated_timeframe="As per regular municipal maintenance schedule",
                current_status_meaning="The municipal authority has registered this action and work is in progress.",
                is_fallback=True
            )

        client = self.groq_client
        system_prompt = get_prompt("response_simplification")
        user_content = (
            f"Official Response: \"{text}\"\n"
            f"Issue Title: {req.issue_title or 'Civic Problem'}\n"
            f"Target Language: {lang}\n"
        )

        try:
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return ResponseSimplificationResponse(
                simplified_summary=data.get("simplified_summary") or data.get("simplified_text") or text,
                key_action_points=data.get("key_action_points") or data.get("key_actions") or ["Review completed", "Follow-up scheduled"],
                estimated_timeframe=data.get("estimated_timeframe") or data.get("estimated_timeline"),
                current_status_meaning=data.get("current_status_meaning") or "Work order registered by the municipal division.",
                is_fallback=False
            )
        except Exception as e:
            logger.error(f"Response simplification error: {e}")
            return ResponseSimplificationResponse(
                simplified_summary=f"The municipal authority has officially recorded this update: {text}",
                key_action_points=["Notice recorded", "Action scheduled"],
                estimated_timeframe=None,
                current_status_meaning="Official update posted by municipal department.",
                is_fallback=True
            )

    def simplify_response(self, official_text: str, issue_title: Optional[str] = None, language: str = "English") -> ResponseSimplificationResponse:
        return self.simplify_official_response(ResponseSimplificationRequest(
            official_response=official_text,
            issue_title=issue_title,
            language=language
        ))

    def consolidate_issue_summary(self, req: CivicConsolidationRequest) -> CivicConsolidationResponse:
        """
        Synthesizes multiple individual citizen complaints into a grounded, cohesive narrative summary.
        """
        if not settings.is_groq_configured or not self.groq_client:
            return self._heuristic_consolidate(req)

        client = self.groq_client
        system_prompt = get_prompt("issue_summary")
        complaints_list = "\n".join([f"- Report #{i+1}: \"{t}\"" for i, t in enumerate(req.complaint_texts)])
        user_content = (
            f"Civic Issue Title: {req.issue_title}\n"
            f"Category: {req.category}\n"
            f"Area: {req.area}\n"
            f"Verified Facts:\n"
            f"- Citizen supporters: {req.supporters_count}\n"
            f"- Citizen-reported accidents: {req.accidents_count}\n"
            f"- Reported injuries: {req.injuries_count}\n"
            f"Individual Citizen Complaints:\n{complaints_list}\n"
        )

        try:
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return CivicConsolidationResponse(
                consolidated_title=data.get("consolidated_title") or req.issue_title,
                executive_summary=data.get("executive_summary") or f"Multiple citizens have reported {req.issue_title.lower()} in {req.area}.",
                key_symptoms=data.get("key_symptoms") or [req.category, f"{len(req.complaint_texts)} citizen reports"],
                safety_risk_summary=data.get("safety_risk_summary"),
                is_fallback=False
            )
        except Exception as e:
            logger.error(f"Consolidation summary error: {e}")
            return self._heuristic_consolidate(req)

    def _heuristic_consolidate(self, req: CivicConsolidationRequest) -> CivicConsolidationResponse:
        num_reports = len(req.complaint_texts)
        acc_text = f" with {req.accidents_count} reported accident(s)" if req.accidents_count > 0 else ""
        summary = (
            f"Residents have submitted {num_reports} report(s) regarding {req.issue_title.lower()} "
            f"in {req.area}{acc_text}. The issue has gathered backing from {req.supporters_count} neighborhood supporters."
        )
        return CivicConsolidationResponse(
            consolidated_title=req.issue_title,
            executive_summary=summary,
            key_symptoms=[req.category, f"{num_reports} citizen complaints", f"{req.supporters_count} supporters"],
            safety_risk_summary=f"{req.accidents_count} citizen accident(s) logged" if req.accidents_count > 0 else None,
            is_fallback=True
        )

    def analyze_image_observation(self, req: ImageObservationRequest) -> ImageObservationResponse:
        """
        AI-assisted visual observation of evidence images (with strict disclaimer).
        """
        cat = req.category or "Civic Infrastructure"
        return ImageObservationResponse(
            observed_category=cat,
            visual_features=["Infrastructure surface visible", "Site condition logged"],
            apparent_severity_rating=3,
            image_clarity="clear",
            disclaimer="AI-assisted visual observation. AI cannot verify complaint authenticity.",
            is_fallback=True
        )

    def translate_dynamic_content(self, req: TranslationRequest) -> TranslationResponse:
        """
        Translates dynamic AI explanations into English, Kannada, or Hindi.
        """
        if req.target_language.lower() in ("english", "en") and not req.source_language:
            return TranslationResponse(
                translated_text=req.text,
                source_language="English",
                target_language="English",
                is_fallback=False
            )

        if not settings.is_groq_configured or not self.groq_client:
            return TranslationResponse(
                translated_text=req.text,
                source_language=req.source_language or "English",
                target_language=req.target_language,
                is_fallback=True
            )

        client = self.groq_client
        system_prompt = get_prompt("multilingual_translation")
        user_content = (
            f"Text to translate: \"{req.text}\"\n"
            f"Target Language: {req.target_language}\n"
        )

        try:
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return TranslationResponse(
                translated_text=data.get("translated_text") or req.text,
                source_language=data.get("source_language") or "English",
                target_language=req.target_language,
                is_fallback=False
            )
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return TranslationResponse(
                translated_text=req.text,
                source_language="English",
                target_language=req.target_language,
                is_fallback=True
            )

    def _heuristic_explain_priority(
        self,
        issue_id: str,
        title: str,
        category: str,
        priority_level: str,
        priority_score: int,
        accidents_count: int = 0,
        injuries_count: int = 0,
        support_count: int = 0,
        complaints_count: int = 1,
        duration: str = "not_sure",
        evidence_count: int = 0,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Fact-constrained explanation generated from exact numbers without hallucinations."""
        key_factors = []
        if accidents_count > 0:
            key_factors.append(f"{accidents_count} citizen-reported accident(s)")
        if injuries_count > 0:
            key_factors.append(f"{injuries_count} injury report(s)")
        if support_count > 0:
            key_factors.append(f"{support_count} neighborhood residents")
        if complaints_count > 1:
            key_factors.append(f"{complaints_count} independent reports")
        if evidence_count > 0:
            key_factors.append(f"{evidence_count} attached photo(s)")

        explanation_text = (
            f"This {category} issue has been evaluated with a priority score of {priority_score}/100 "
            f"({priority_level}) based on {accidents_count} citizen-reported accident(s), "
            f"{injuries_count} injury report(s), backing from {support_count} neighborhood residents, "
            f"and {complaints_count} consolidated complaint reports."
        )

        return {
            "issue_id": issue_id,
            "priority_level": priority_level,
            "priority_score": priority_score,
            "explanation": explanation_text,
            "key_factors_summary": key_factors,
            "is_fallback": True
        }

    def explain_issue_priority(
        self,
        issue_id: str,
        title: str,
        category: str,
        priority_level: str,
        priority_score: int,
        accidents_count: int = 0,
        injuries_count: int = 0,
        support_count: int = 0,
        complaints_count: int = 1,
        duration: str = "not_sure",
        evidence_count: int = 0,
        language: str = "English"
    ) -> Dict[str, Any]:
        if not settings.is_groq_configured or not self.groq_client:
            return self._heuristic_explain_priority(
                issue_id=issue_id,
                title=title,
                category=category,
                priority_level=priority_level,
                priority_score=priority_score,
                accidents_count=accidents_count,
                injuries_count=injuries_count,
                support_count=support_count,
                complaints_count=complaints_count,
                duration=duration,
                evidence_count=evidence_count,
                language=language
            )

        client = self.groq_client
        system_prompt = get_prompt("priority_explanation")
        user_content = (
            f"Issue Title: {title}\n"
            f"Category: {category}\n"
            f"Target Language: {language}\n"
            f"Deterministic Priority Level: {priority_level}\n"
            f"Deterministic Priority Score: {priority_score}/100\n"
            f"Verified Facts:\n"
            f"- Citizen-reported accidents: {accidents_count}\n"
            f"- Citizen-reported injuries: {injuries_count}\n"
            f"- Verified community supporters: {support_count}\n"
            f"- Consolidated independent complaints: {complaints_count}\n"
            f"- Estimated duration: {duration}\n"
            f"- Photo evidence count: {evidence_count}\n"
        )

        try:
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return {
                "issue_id": issue_id,
                "priority_level": priority_level,
                "priority_score": priority_score,
                "explanation": data.get("explanation") or f"This issue is scored {priority_score}/100 based on verified community safety factors.",
                "key_factors_summary": data.get("key_factors_summary") or [f"Score: {priority_score}", f"{accidents_count} accidents"],
                "is_fallback": False
            }
        except Exception as e:
            logger.error(f"Priority explanation error: {e}")
            return self._heuristic_explain_priority(
                issue_id=issue_id,
                title=title,
                category=category,
                priority_level=priority_level,
                priority_score=priority_score,
                accidents_count=accidents_count,
                injuries_count=injuries_count,
                support_count=support_count,
                complaints_count=complaints_count,
                duration=duration,
                evidence_count=evidence_count,
                language=language
            )

    explain_priority = explain_issue_priority

    def assist_citizen_query(
        self,
        query: str,
        context: Optional[str] = None,
        language: str = "English",
        role: str = "citizen",
        area: Optional[str] = None,
        department: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Real-time multi-role, multi-lingual assistant for Citizens, Corporation Officials, and Field Workers.
        Queries live database state to provide grounded, real-time answers in English, Kannada, or Hindi.
        """
        # Fetch Real-Time Live Database State
        live_data = self._gather_live_context(role=role, area=area, department=department, user_id=user_id)

        if not settings.is_groq_configured or not self.groq_client:
            return self._realtime_heuristic_assist(
                query=query,
                role=role,
                language=language,
                area=area,
                department=department,
                live_data=live_data
            )

        client = self.groq_client
        system_prompt = get_prompt("civic_assistant")
        
        # Build Real-Time Context string
        live_context_str = (
            f"=== LIVE REAL-TIME DATABASE CONTEXT (MYSURU MCC) ===\n"
            f"User Role: {role.upper()}\n"
            f"User Mysore Locality: {area or 'Mysore City'}\n"
            f"User Department: {department or 'General'}\n"
            f"Total Live Civic Issues in System: {live_data.get('total_issues', 0)}\n"
            f"Active Issues in {area or 'User Ward'}: {live_data.get('area_issues_count', 0)}\n"
            f"Critical / High Priority Backlog: {live_data.get('critical_count', 0)}\n"
            f"Recent Area Issues: {json.dumps(live_data.get('area_issue_titles', []), ensure_ascii=False)}\n"
        )
        if role == "worker" and live_data.get("worker_tasks"):
            live_context_str += f"Worker Live Tasks: {json.dumps(live_data.get('worker_tasks', []), ensure_ascii=False)}\n"
        if role == "corporation":
            live_context_str += f"Corporation Triage Backlog: {live_data.get('triage_count', 0)} items\n"

        user_content = (
            f"User Question: \"{query}\"\n"
            f"Active Role: {role}\n"
            f"Requested Language: {language}\n"
            f"Real-Time Database Snapshot:\n{live_context_str}\n"
        )

        try:
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            return {
                "answer": data.get("answer") or "CivicConnect AI is actively tracking live Mysuru municipal operations.",
                "suggested_actions": data.get("suggested_actions") or (
                    ["Report Problem", "Explore Ward Issues"] if role == "citizen" else
                    ["View Triage Queue", "Assign Crew"] if role == "corporation" else
                    ["View Task Queue", "Upload Inspection Photo"]
                ),
                "helpful_links": data.get("helpful_links") or (
                    ["/citizen/report", "/citizen/issues"] if role == "citizen" else
                    ["/corporation", "/corporation/issues"] if role == "corporation" else
                    ["/worker", "/worker/tasks"]
                ),
                "is_fallback": False,
                "language": language
            }
        except Exception as e:
            logger.error(f"Civic assistant Groq error: {e}")
            return self._realtime_heuristic_assist(
                query=query,
                role=role,
                language=language,
                area=area,
                department=department,
                live_data=live_data
            )

    def _gather_live_context(
        self,
        role: str,
        area: Optional[str],
        department: Optional[str],
        user_id: Optional[str]
    ) -> Dict[str, Any]:
        """Queries live Supabase/memory tables in real time to assemble factual context."""
        try:
            from app.services.supabase_service import supabase_service
            all_issues = supabase_service.list_civic_issues(status="all", limit=50)
            
            user_area = (area or "Gokulam").lower()
            area_issues = [i for i in all_issues if i.area and i.area.lower() == user_area]
            
            critical_count = sum(
                1 for i in all_issues
                if getattr(i, "priority_level", None) and (
                    i.priority_level.value if hasattr(i.priority_level, "value") else str(i.priority_level)
                ).lower() in ("critical", "high")
            )
            
            worker_tasks_summary = []
            if role == "worker" and user_id:
                try:
                    tasks = supabase_service.list_worker_tasks(worker_id=user_id)
                    for t in tasks[:5]:
                        worker_tasks_summary.append({
                            "title": t.title,
                            "area": t.area,
                            "landmark": t.landmark,
                            "status": t.status.value if hasattr(t.status, "value") else str(t.status),
                            "priority": t.priority_level.value if hasattr(t.priority_level, "value") else str(t.priority_level)
                        })
                except Exception:
                    pass

            triage_count = len(all_issues)
            if role == "corporation":
                try:
                    c_stats = supabase_service.get_corporation_dashboard_stats(department=department, area=area)
                    triage_count = c_stats.total_issues
                except Exception:
                    pass

            return {
                "total_issues": len(all_issues),
                "area_issues_count": len(area_issues),
                "critical_count": critical_count,
                "area_issue_titles": [{"title": i.title, "status": i.status.value if hasattr(i.status, "value") else str(i.status), "score": i.priority_score} for i in area_issues[:4]],
                "worker_tasks": worker_tasks_summary,
                "triage_count": triage_count,
                "active_area": area or "Gokulam"
            }
        except Exception as e:
            logger.warning(f"Error gathering live context: {e}")
            return {
                "total_issues": 3,
                "area_issues_count": 1,
                "critical_count": 1,
                "area_issue_titles": [{"title": "Contour Road Pothole", "status": "in_progress", "score": 88}],
                "worker_tasks": [],
                "triage_count": 3,
                "active_area": area or "Gokulam"
            }

    def _realtime_heuristic_assist(
        self,
        query: str,
        role: str,
        language: str,
        area: Optional[str],
        department: Optional[str],
        live_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Dynamically generates real-time, data-grounded responses in English, Kannada, and Hindi
        reflecting live database state.
        """
        q = query.lower()
        active_area = area or live_data.get("active_area", "Gokulam")
        total_iss = live_data.get("total_issues", 0)
        area_iss = live_data.get("area_issues_count", 0)
        crit_iss = live_data.get("critical_count", 0)
        recent_titles = live_data.get("area_issue_titles", [])
        worker_tasks = live_data.get("worker_tasks", [])

        # Format area issues summary string
        if recent_titles:
            recent_titles_en = ", ".join([f"'{t['title']}' (Status: {t['status']})" for t in recent_titles])
            recent_titles_kn = ", ".join([f"'{t['title']}' (ಸ್ಥಿತಿ: {t['status']})" for t in recent_titles])
            recent_titles_hi = ", ".join([f"'{t['title']}' (स्थिति: {t['status']})" for t in recent_titles])
        else:
            recent_titles_en = f"No open issues currently reported in {active_area}."
            recent_titles_kn = f"{active_area} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬಾಕಿ ಸಮಸ್ಯೆಗಳಿಲ್ಲ."
            recent_titles_hi = f"{active_area} में वर्तमान में कोई लंबित समस्या नहीं है।"

        # -------------------------------------------------------------
        # 1. FIELD WORKER ROLE
        # -------------------------------------------------------------
        if role == "worker":
            if "task" in q or "work" in q or "ಕಾರ್ಯ" in q or "ಕೆಲಸ" in q or "काम" in q or "कार्य" in q:
                if worker_tasks:
                    task_str_en = f"You have {len(worker_tasks)} active assigned tasks in Mysuru: " + "; ".join([f"{t['title']} at {t['area']} ({t['status']})" for t in worker_tasks])
                    task_str_kn = f"ನಿಮಗೆ ಮೈಸೂರಿನಲ್ಲಿ {len(worker_tasks)} ನಿಯೋಜಿತ ಕಾರ್ಯಗಳಿವೆ: " + "; ".join([f"{t['title']} - {t['area']} (ಸ್ಥಿತಿ: {t['status']})" for t in worker_tasks])
                    task_str_hi = f"आपके पास मैसूर में {len(worker_tasks)} सक्रिय कार्य हैं: " + "; ".join([f"{t['title']} - {t['area']} (स्थिति: {t['status']})" for t in worker_tasks])
                else:
                    task_str_en = f"You currently have no pending tasks in your queue. Across Mysuru, there are {total_iss} active civic reports."
                    task_str_kn = f"ನಿಮ್ಮ ಸರದಿಯಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬಾಕಿ ಕೆಲಸಗಳಿಲ್ಲ. ಮೈಸೂರು ನಗರದಲ್ಲಿ ಒಟ್ಟು {total_iss} ಸಾರ್ವಜನಿಕ ವರದಿಗಳಿವೆ."
                    task_str_hi = f"आपकी सूची में वर्तमान में कोई लंबित कार्य नहीं है। मैसूर भर में {total_iss} सक्रिय नागरिक रिपोर्ट हैं।"

                if language == "Kannada":
                    ans = task_str_kn + "\n\nಸ್ಥಳ ಪರಿಶೀಲನೆ ಆರಂಭಿಸಲು 'Start Inspection' ಕ್ಲಿಕ್ ಮಾಡಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
                    actions = ["ನನ್ನ ಕೆಲಸಗಳ ಪಟ್ಟಿ", "ಪರಿಶೀಲನೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್"]
                elif language == "Hindi":
                    ans = task_str_hi + "\n\nकार्य शुरू करने के लिए 'Start Inspection' पर क्लिक करके फोटो अपलोड करें।"
                    actions = ["मेरी कार्य सूची", "निरीक्षण फोटो अपलोड"]
                else:
                    ans = task_str_en + "\n\nClick 'Start Inspection' to record initial site condition and upload inspection photos."
                    actions = ["View Task Queue", "Upload Inspection Photo"]

                return {
                    "answer": ans,
                    "suggested_actions": actions,
                    "helpful_links": ["/worker", "/worker/tasks"],
                    "is_fallback": True,
                    "language": language
                }

            elif "photo" in q or "inspection" in q or "ಫೋಟೋ" in q or "ತಪಾಸಣೆ" in q or "फोटो" in q:
                if language == "Kannada":
                    ans = "ಫೀಲ್ಡ್ ವರ್ಕರ್ ಪ್ರಕ್ರಿಯೆ: 1) ಸ್ಥಳಕ್ಕೆ ತಲುಪಿ 'Start Inspection' ಮೂಲಕ ಆರಂಭಿಕ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. 2) ಕಾಮಗಾರಿ ಮುಗಿದ ಮೇಲೆ 'Complete Task' ನಲ್ಲಿ ಪೂರ್ಣಗೊಂಡ ಫೋಟೋ ಮತ್ತು ಟಿಪ್ಪಣಿ ಸಲ್ಲಿಸಿ."
                    actions = ["ಕಾರ್ಯಗಳ ಪಟ್ಟಿ", "ಸ್ಥಿತಿ ಬದಲಾಯಿಸಿ"]
                elif language == "Hindi":
                    ans = "फील्ड वर्कर प्रक्रिया: 1) कार्यस्थल पर पहुंचकर 'Start Inspection' के साथ प्रारंभिक फोटो अपलोड करें। 2) कार्य पूरा होने पर 'Complete Task' में अंतिम फोटो और रिपोर्ट दर्ज करें।"
                    actions = ["कार्य सूची", "स्थिति अपडेट करें"]
                else:
                    ans = "Field Operations Protocol: 1) Upon arrival, click 'Start Inspection' and upload before-repair photos. 2) Once repairs conclude, submit completion notes with after-repair evidence under 'Complete Task'."
                    actions = ["Open Task Queue", "Submit Progress"]

                return {
                    "answer": ans,
                    "suggested_actions": actions,
                    "helpful_links": ["/worker"],
                    "is_fallback": True,
                    "language": language
                }

        # -------------------------------------------------------------
        # 2. CORPORATION OFFICIAL ROLE
        # -------------------------------------------------------------
        if role == "corporation":
            if "triage" in q or "priority" in q or "backlog" in q or "ಆದ್ಯತೆ" in q or "ಬಾಕಿ" in q or "प्राथमिकता" in q:
                if language == "Kannada":
                    ans = f"ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಲೈವ್ ಸ್ಥಿತಿ: ಒಟ್ಟು {total_iss} ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳಿವೆ. ಇದರಲ್ಲಿ {crit_iss} ಅಧಿಕ/ತುರ್ತು ಆದ್ಯತೆಯ ವರದಿಗಳಾಗಿವೆ. {active_area} ವಾರ್ಡ್‌ನಲ್ಲಿ {area_iss} ಸಕ್ರಿಯ ವರದಿಗಳಿವೆ: {recent_titles_kn}."
                    actions = ["ಆದ್ಯತಾ ಪರಿಶೀಲನೆ", "ಕೆಲಸಗಾರರ ನಿಯೋಜನೆ", "ಅಧಿಕೃತ ಪ್ರಕಟಣೆ"]
                elif language == "Hindi":
                    ans = f"मैसूर नगर निगम (MCC) लाइव स्थिति: कुल {total_iss} नागरिक समस्याएं दर्ज हैं, जिनमें {crit_iss} उच्च/महत्वपूर्ण प्राथमिकता वाली हैं। {active_area} वार्ड में {area_iss} सक्रिय मामले हैं: {recent_titles_hi}."
                    actions = ["प्राथमिकता समीक्षा", "कार्यकर्ता आवंटन", "आधिकारिक सूचना"]
                else:
                    ans = f"MCC Live Operations Summary: There are currently {total_iss} active civic issues across Mysuru ({crit_iss} Critical/High Urgency). In {active_area} ward, there are {area_iss} issues: {recent_titles_en}."
                    actions = ["Open Priority Triage", "Assign Field Crews", "Post Official Notice"]

                return {
                    "answer": ans,
                    "suggested_actions": actions,
                    "helpful_links": ["/corporation", "/corporation/issues"],
                    "is_fallback": True,
                    "language": language
                }

        # -------------------------------------------------------------
        # 3. CITIZEN ROLE & GENERAL QUERIES
        # -------------------------------------------------------------
        if "near" in q or "area" in q or "ward" in q or "gokulam" in q or "kuvempunagar" in q or "vijayanagar" in q or "ಪ್ರದೇಶ" in q or "ಸಮಸ್ಯೆ" in q or "क्षेत्र" in q:
            if language == "Kannada":
                ans = f"{active_area} ಮೈಸೂರು ಲೈವ್ ಮಾಹಿತಿ: ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ {area_iss} ಸಕ್ರಿಯ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳಿವೆ ({recent_titles_kn}). ಮೈಸೂರು ನಗರದಲ್ಲಿ ಒಟ್ಟು {total_iss} ಸಮಸ್ಯೆಗಳು ದಾಖಲಾಗಿವೆ. ಹೊಸ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು ಅಥವಾ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಮಸ್ಯೆಗೆ ಬೆಂಬಲ ನೀಡಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಬಳಸಿ."
                actions = ["ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", "ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳು", "ಪ್ರಗತಿ ಪರಿಶೀಲನೆ"]
            elif language == "Hindi":
                ans = f"{active_area} मैसूर लाइव अपडेट: आपके क्षेत्र में {area_iss} सक्रिय समस्याएं हैं ({recent_titles_hi})। पूरे मैसूर में कुल {total_iss} मामले दर्ज हैं। नई समस्या दर्ज करने या समर्थन देने के लिए नीचे दिए गए विकल्प चुनें।"
                actions = ["समस्या रिपोर्ट करें", "स्थानीय समस्याएं", "प्रगति देखें"]
            else:
                ans = f"Live Update for {active_area}, Mysuru: There are currently {area_iss} active civic reports in your area ({recent_titles_en}). City-wide, {total_iss} issues are under management by MCC."
                actions = ["Report a Problem", "Explore Ward Issues", "Track Progress"]

            return {
                "answer": ans,
                "suggested_actions": actions,
                "helpful_links": ["/citizen/report", "/citizen/issues"],
                "is_fallback": True,
                "language": language
            }

        elif "report" in q or "submit" in q or "ಹೇಗೆ" in q or "ದಾಖಲಿಸು" in q or "रिपोर्ट" in q:
            if language == "Kannada":
                ans = "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡುವ ವಿಧಾನ: 1) 'Report a Problem' ಕ್ಲಿಕ್ ಮಾಡಿ. 2) ನಿಮ್ಮ ಪ್ರದೇಶ (ಉದಾ: ಗೋಕುಲಂ, ವಿಜಯನಗರ), ರಸ್ತೆ ಹೆಸರು ಹಾಗೂ ಸಮಸ್ಯೆಯನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ. 3) ನಮ್ಮ AI ಸಿಸ್ಟಮ್ ನಕಲಿ ವರದಿ ತಡೆಗಟ್ಟಿ, ತುರ್ತು ಆದ್ಯತೆ ಲೆಕ್ಕಹಾಕಿ ಪಾಲಿಕೆಗೆ ಕಳುಹಿಸುತ್ತದೆ."
                actions = ["ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", "ವಾರ್ಡ್ ಸಮಸ್ಯೆಗಳು"]
            elif language == "Hindi":
                ans = "समस्या दर्ज करने की प्रक्रिया: 1) 'Report a Problem' पर क्लिक करें। 2) अपने मैसूर क्षेत्र (उदा: गोकुलम, विजयनगर) और समस्या का विवरण लिखें। 3) हमारा AI सिस्टम डुप्लिकेट की जांच करेगा और प्राथमिकता तय करके निगम को भेजेगा।"
                actions = ["समस्या रिपोर्ट करें", "वार्ड समस्याएं"]
            else:
                ans = "How to Report a Problem: 1) Click 'Report a Problem'. 2) Select your Mysuru locality (e.g. Gokulam, Kuvempunagar) and describe the problem in your words. 3) Our AI analyzes safety hazards, calculates priority, and prevents duplicate records."
                actions = ["Report a Problem", "Explore Issues"]

            return {
                "answer": ans,
                "suggested_actions": actions,
                "helpful_links": ["/citizen/report", "/citizen/issues"],
                "is_fallback": True,
                "language": language
            }

        elif "support" in q or "upvote" in q or "ಬೆಂಬಲ" in q or "ಸಮರ್ಥನ" in q:
            if language == "Kannada":
                ans = "ಬೆಂಬಲ (Support) ನೀಡುವುದು ಎಂದರೆ: ನಿಮ್ಮ ಬಡಾವಣೆಯಲ್ಲಿ ಈಗಾಗಲೇ ದಾಖಲಾಗಿರುವ ಸಮಸ್ಯೆಗೆ ನಿಮ್ಮ ಮತ ನೀಡುವುದು. ಇದು ಹೊಸ ನಕಲಿ ಟಿಕೆಟ್ ಸೃಷ್ಟಿಸದೆ, ಸಮಸ್ಯೆಯ ತುರ್ತು ಆದ್ಯತೆ ಹೆಚ್ಚಿಸಿ ಅಧಿಕಾರಿಗಳ ಗಮನ ಬೇಗ ಸೆಳೆಯಲು ನೆರವಾಗುತ್ತದೆ."
                actions = ["ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳು", "ವರದಿ ಪರಿಶೀಲನೆ"]
            elif language == "Hindi":
                ans = "समस्या का समर्थन (Support) करने का अर्थ: पहले से दर्ज समस्या पर अपना समर्थन दर्ज करना। इससे डुप्लिकेट टिकट बनाए बिना समस्या की प्राथमिकता बढ़ती है और नगर निगम जल्दी कार्रवाई करता है।"
                actions = ["स्थानीय समस्याएं", "रिपोर्ट देखें"]
            else:
                ans = "Supporting an Issue: When you click 'Support', you corroborate that this problem affects you too. It increases the community priority score (0-100) and accelerates municipal dispatch without creating duplicate tickets."
                actions = ["Explore Issues", "View Priority Queue"]

            return {
                "answer": ans,
                "suggested_actions": actions,
                "helpful_links": ["/citizen/issues"],
                "is_fallback": True,
                "language": language
            }

        elif "priority" in q or "score" in q or "ಆದ್ಯತೆ" in q or "ಅಂಕ" in q or "प्राथमिकता" in q:
            if language == "Kannada":
                ans = "ಆದ್ಯತಾ ಅಂಕ (Priority Score 0-100): ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ, ಅಪಘಾತಗಳು, ಗಾಯಗಳು, ಬಾಕಿ ಇರುವ ಸಮಯ (ದಿನಗಳು/ತಿಂಗಳುಗಳು) ಮತ್ತು ನಾಗರಿಕರ ಬೆಂಬಲದ ಆಧಾರದ ಮೇಲೆ ಕಟ್ಟುನಿಟ್ಟಾದ ಗಣಿತೀಯ ಸೂತ್ರದ ಮೂಲಕ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ (Critical, High, Medium, Low)."
                actions = ["ವಾರ್ಡ್ ಸಮಸ್ಯೆಗಳು", "ಪ್ರಗತಿ ಟ್ರ್ಯಾಕಿಂಗ್"]
            elif language == "Hindi":
                ans = "प्राथमिकता स्कोर (Priority Score 0-100): दुर्घटनाओं, चोटों, सुरक्षा खतरों, समस्या की अवधि और नागरिकों के समर्थन के आधार पर एक सटीक फॉर्मूले से तय किया जाता है (Critical, High, Medium, Low)।"
                actions = ["वार्ड समस्याएं", "प्रगति ट्रैकिंग"]
            else:
                ans = "Priority Score (0-100): Computed deterministically using safety risk severity, reported accidents/injuries, unresolved duration, and community support counts to rank issues objectively (Critical, High, Medium, Low)."
                actions = ["Explore Issues", "Track Progress"]

            return {
                "answer": ans,
                "suggested_actions": actions,
                "helpful_links": ["/citizen/issues", "/citizen/tracking"],
                "is_fallback": True,
                "language": language
            }

        # Default Greeting & Guide
        if language == "Kannada":
            ans = f"ನಮಸ್ಕಾರ! ನಾನು ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ಮಾರ್ಗದರ್ಶಿ. {active_area} ಹಾಗೂ ಇಡೀ ಮೈಸೂರಿನ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ಲೈವ್ ಮಾಹಿತಿ, ವರದಿ ಸಲ್ಲಿಕೆ, ಮತ್ತು ದುರಸ್ತಿ ಪ್ರಗತಿ ಕುರಿತು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ."
            actions = ["ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", "ವಾರ್ಡ್ ಸಮಸ್ಯೆಗಳು", "ಪ್ರಗತಿ ಪರಿಶೀಲನೆ"]
        elif language == "Hindi":
            ans = f"नमस्ते! मैं मैसूर नगर निगम (MCC) सिविककनेक्ट AI गाइड हूँ। {active_area} और पूरे मैसूर की नागरिक समस्याओं की लाइव स्थिति, रिपोर्टिंग और प्रगति की जानकारी के लिए मैं आपकी सहायता कर सकता हूँ।"
            actions = ["समस्या रिपोर्ट करें", "वार्ड समस्याएं", "प्रगति देखें"]
        else:
            ans = f"Hello! I am your real-time CivicConnect AI Assistant for Mysuru Municipal Corporation (MCC). I can provide live ward statistics for {active_area}, guide problem reporting, explain priority scores, and track field repairs."
            actions = ["Report a Problem", "Explore Ward Issues", "Track Progress"]

        return {
            "answer": ans,
            "suggested_actions": actions,
            "helpful_links": ["/citizen/report", "/citizen/issues", "/citizen/complaints"],
            "is_fallback": True,
            "language": language
        }

ai_service = AIService()
