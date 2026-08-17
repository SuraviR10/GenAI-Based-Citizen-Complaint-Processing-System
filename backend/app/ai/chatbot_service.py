"""
CivicConnect AI — Main Chatbot Service
Coordinates multi-turn conversation memory, Groq LLM tool calling (Function Calling),
knowledge base retrieval (RAG), and offline database-grounded generation across
Citizen, Worker, and Corporation modules in English, Kannada, and Hindi.
"""

import json
import uuid
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from app.config import settings
from app.auth import AuthUser
from app.ai.tool_registry import ToolRegistry
from app.ai.response_validator import ResponseValidator
from app.prompts import get_prompt

logger = logging.getLogger("civicconnect.ai.chatbot_service")


class ConversationMemory:
    """In-memory session conversation store keyed by conversation_id."""
    def __init__(self, max_history_per_session: int = 10):
        self.sessions: Dict[str, List[Dict[str, Any]]] = {}
        self.max_history = max_history_per_session

    def get_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        return self.sessions.get(conversation_id, [])

    def add_message(self, conversation_id: str, role: str, content: str, name: Optional[str] = None):
        if conversation_id not in self.sessions:
            self.sessions[conversation_id] = []
        msg = {"role": role, "content": content}
        if name:
            msg["name"] = name
        self.sessions[conversation_id].append(msg)
        if len(self.sessions[conversation_id]) > self.max_history * 2:
            self.sessions[conversation_id] = self.sessions[conversation_id][-self.max_history * 2:]

    def clear(self, conversation_id: str):
        if conversation_id in self.sessions:
            del self.sessions[conversation_id]


class ChatbotService:
    def __init__(self):
        self.memory = ConversationMemory()
        self._groq_client = None

    @property
    def groq_client(self):
        if not self._groq_client and settings.is_groq_configured:
            try:
                from groq import Groq
                self._groq_client = Groq(api_key=settings.GROQ_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize Groq client: {e}")
        return self._groq_client

    def chat(
        self,
        message: str,
        user: AuthUser,
        conversation_id: Optional[str] = None,
        language: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main entry point for role-aware, database-grounded chat interaction.
        """
        conv_id = conversation_id or str(uuid.uuid4())
        target_lang = language or user.preferred_language or "English"
        role = user.role or "citizen"
        user_area = user.area or "Gokulam"

        # 1. Guardrail: Check for non-civic input
        if ResponseValidator.is_non_civic_query(message):
            res = ResponseValidator.format_non_civic_response(target_lang)
            res["conversation_id"] = conv_id
            self.memory.add_message(conv_id, "user", message)
            self.memory.add_message(conv_id, "assistant", res["message"])
            return res

        # 2. Add user message to history
        self.memory.add_message(conv_id, "user", message)

        # 3. Check if Groq LLM with Tool Calling is available
        if settings.is_groq_configured and self.groq_client:
            try:
                return self._chat_with_groq_tool_calling(
                    message=message,
                    user=user,
                    conversation_id=conv_id,
                    language=target_lang,
                    context=context
                )
            except Exception as e:
                logger.error(f"Error in Groq tool calling execution: {e}. Falling back to grounded heuristic engine.")

        # 4. Fallback: Direct Tool Execution & Grounded Generation
        return self._chat_with_direct_tool_execution(
            message=message,
            user=user,
            conversation_id=conv_id,
            language=target_lang,
            context=context
        )

    def _chat_with_groq_tool_calling(
        self,
        message: str,
        user: AuthUser,
        conversation_id: str,
        language: str,
        context: Optional[str]
    ) -> Dict[str, Any]:
        """Executes full Groq function / tool calling loop with live database tools."""
        client = self.groq_client
        permitted_tools = ToolRegistry.get_tools_for_role(user.role)

        system_instruction = (
            f"You are the official CivicConnect AI Assistant for Mysuru Municipal Corporation (MCC).\n"
            f"User Role: {user.role.upper()}\n"
            f"User Name: {user.full_name or 'Resident'}\n"
            f"User Locality / Ward: {user.area or 'Gokulam'}\n"
            f"User Department: {user.department or 'General'}\n"
            f"Requested Language: {language}\n\n"
            f"STRICT CIVIC OPERATING RULES:\n"
            f"1. You MUST call tools whenever real application data is needed (e.g. issues, complaints, tasks, priority factors, support counts, search).\n"
            f"2. ZERO HALLUCINATION RULE: NEVER invent complaint IDs, issue titles, supporter numbers, or completion dates. Only state factual data returned by tools.\n"
            f"3. Always respond strictly in the requested language: English, Kannada (ಕನ್ನಡ), or Hindi (हिन्दी).\n"
            f"4. If no records are found, clearly state that in a friendly, helpful tone.\n"
        )

        messages_payload = [{"role": "system", "content": system_instruction}]
        
        # Add conversation history
        for m in self.memory.get_history(conversation_id)[-6:]:
            messages_payload.append(m)

        # Initial call to Groq with permitted tools
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages_payload,
            tools=permitted_tools,
            tool_choice="auto",
            temperature=0.2
        )

        choice = response.choices[0]
        response_msg = choice.message
        executed_tool_results: List[Dict[str, Any]] = []

        # Check if the LLM decided to call tools
        if response_msg.tool_calls:
            # Append model's tool call message
            messages_payload.append(response_msg)

            # Execute each requested tool
            for tc in response_msg.tool_calls:
                fn_name = tc.function.name
                try:
                    fn_args = json.loads(tc.function.arguments) if tc.function.arguments else {}
                except Exception:
                    fn_args = {}

                # Execute with strict authorization
                tool_output = ToolRegistry.execute_tool(
                    tool_name=fn_name,
                    arguments=fn_args,
                    user_id=user.id,
                    user_role=user.role,
                    user_area=user.area
                )
                executed_tool_results.append(tool_output)

                # Append tool result to messages
                messages_payload.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": fn_name,
                    "content": json.dumps(tool_output, ensure_ascii=False)
                })

            # Call Groq again to synthesize grounded response from tool outputs
            final_response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages_payload,
                temperature=0.2
            )
            raw_text = final_response.choices[0].message.content or ""
        else:
            raw_text = response_msg.content or ""

        # Validate and structure response
        result = ResponseValidator.sanitize_and_build_actions(
            raw_message=raw_text,
            role=user.role,
            language=language,
            tool_results=executed_tool_results,
            conversation_id=conversation_id
        )

        # Save assistant answer to memory
        self.memory.add_message(conversation_id, "assistant", result["message"])
        return result

    def _chat_with_direct_tool_execution(
        self,
        message: str,
        user: AuthUser,
        conversation_id: str,
        language: str,
        context: Optional[str]
    ) -> Dict[str, Any]:
        """
        Offline / Preview Mode Engine:
        Directly determines intent, executes the relevant live tool from ToolRegistry,
        and generates an authentic, database-grounded response in English, Kannada, or Hindi.
        """
        q = message.lower().strip()
        role_clean = (user.role or "citizen").lower()
        user_area = user.area or "Gokulam"
        executed_tool_results: List[Dict[str, Any]] = []

        # -------------------------------------------------------------
        # Intent A: Worker Tasks & Operations (Worker Role)
        # -------------------------------------------------------------
        if role_clean == "worker" and ("task" in q or "work" in q or "assigned" in q or "ಕಾರ್ಯ" in q or "ಕೆಲಸ" in q or "काम" in q or "कार्य" in q):
            tool_res = ToolRegistry.execute_tool("get_assigned_issues", {}, user.id, user.role, user.area)
            executed_tool_results.append(tool_res)
            tasks = tool_res.get("tasks", [])

            if tasks:
                task_items_en = "; ".join([f"'{t['title']}' at {t['area']} (Status: {t['status']}, Priority: {t['priority_level']})" for t in tasks])
                task_items_kn = "; ".join([f"'{t['title']}' - {t['area']} (ಸ್ಥಿತಿ: {t['status']}, ಆದ್ಯತೆ: {t['priority_level']})" for t in tasks])
                task_items_hi = "; ".join([f"'{t['title']}' - {t['area']} (स्थिति: {t['status']}, प्राथमिकता: {t['priority_level']})" for t in tasks])

                if "kannada" in language.lower():
                    msg = (
                        f"ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಲೈವ್ ಡೇಟಾ: ನಿಮ್ಮ ಖಾತೆಗೆ ಪ್ರಸ್ತುತ {len(tasks)} ಕಾರ್ಯಗಳು ನಿಯೋಜಿಸಲ್ಪಟ್ಟಿವೆ:\n\n"
                        f"{task_items_kn}\n\n"
                        f"ಸ್ಥಳಕ್ಕೆ ತಲುಪಿದಾಗ 'Start Inspection' ಕ್ಲಿಕ್ ಮಾಡಿ ಆರಂಭಿಕ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
                    )
                elif "hindi" in language.lower():
                    msg = (
                        f"मैसूर नगर निगम (MCC) लाइव डेटा: आपके खाते में वर्तमान में {len(tasks)} कार्य आवंटित हैं:\n\n"
                        f"{task_items_hi}\n\n"
                        f"कार्यस्थल पर पहुंचकर 'Start Inspection' के साथ प्रारंभिक फोटो अपलोड करें।"
                    )
                else:
                    msg = (
                        f"MCC Live Records: You currently have {len(tasks)} active assigned task(s):\n\n"
                        f"{task_items_en}\n\n"
                        f"Upon arriving on site, click 'Start Inspection' to record before-repair photos and notes."
                    )
            else:
                if "kannada" in language.lower():
                    msg = "ನಿಮ್ಮ ಸರದಿಯಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬಾಕಿ ಕೆಲಸಗಳಿಲ್ಲ. ಹೊಸ ಕಾಮಗಾರಿ ನಿಯೋಜನೆಯಾದಾಗ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ."
                elif "hindi" in language.lower():
                    msg = "आपकी कार्य सूची में वर्तमान में कोई लंबित कार्य नहीं है।"
                else:
                    msg = "You currently have no pending tasks assigned in your queue."

        # -------------------------------------------------------------
        # Intent B: Corporation Triage & Statistics (Corporation Role)
        # -------------------------------------------------------------
        elif role_clean == "corporation" and ("triage" in q or "priority" in q or "backlog" in q or "statistic" in q or "summary" in q or "ಆದ್ಯತೆ" in q or "ಬಾಕಿ" in q or "ವಾರ್ಡ್" in q or "प्राथमिकता" in q):
            tool_res = ToolRegistry.execute_tool("get_priority_issues", {"limit": 5}, user.id, user.role, user.area)
            stat_res = ToolRegistry.execute_tool("get_issue_statistics", {"area": user_area}, user.id, user.role, user.area)
            executed_tool_results.extend([tool_res, stat_res])

            issues = tool_res.get("issues", [])
            crit_count = tool_res.get("critical_count", 0)
            high_count = tool_res.get("high_count", 0)
            total_count = stat_res.get("total_issues", len(issues))

            top_iss_str_en = "; ".join([f"'{i['title']}' in {i['area']} (Score: {i['priority_score']}, Status: {i['status']})" for i in issues[:3]])
            top_iss_str_kn = "; ".join([f"'{i['title']}' - {i['area']} (ಅಂಕ: {i['priority_score']}, ಸ್ಥಿತಿ: {i['status']})" for i in issues[:3]])
            top_iss_str_hi = "; ".join([f"'{i['title']}' - {i['area']} (स्कोर: {i['priority_score']}, स्थिति: {i['status']})" for i in issues[:3]])

            if "kannada" in language.lower():
                msg = (
                    f"ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಲೈವ್ ಟ್ರಯೇಜ್ ವರದಿ:\n"
                    f"• ಒಟ್ಟು ಸಕ್ರಿಯ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು: {total_count}\n"
                    f"• ತುರ್ತು / ಅಧಿಕ ಆದ್ಯತೆ: {crit_count} Critical, {high_count} High\n"
                    f"• ಪ್ರಮುಖ ಸಮಸ್ಯೆಗಳು: {top_iss_str_kn}\n\n"
                    f"ವಿವರವಾದ ಪರಿಶೀಲನೆಗೆ ಕೆಳಗಿನ 'Priority Triage' ಆಯ್ಕೆ ಬಳಸಿ."
                )
            elif "hindi" in language.lower():
                msg = (
                    f"मैसूर नगर निगम (MCC) लाइव ट्राइएज रिपोर्ट:\n"
                    f"• कुल सक्रिय नागरिक समस्याएं: {total_count}\n"
                    f"• आपातकालीन / उच्च प्राथमिकता: {crit_count} Critical, {high_count} High\n"
                    f"• शीर्ष मामले: {top_iss_str_hi}\n\n"
                    f"विस्तृत समीक्षा के लिए 'Priority Triage' विकल्प चुनें।"
                )
            else:
                msg = (
                    f"MCC Live Triage & Operations Summary:\n"
                    f"• Total Active Civic Issues: {total_count}\n"
                    f"• Urgency Breakdown: {crit_count} Critical, {high_count} High priority\n"
                    f"• Top Priority Issues: {top_iss_str_en}\n\n"
                    f"Click 'Priority Triage' below to review corroboration or assign field crews."
                )

        # -------------------------------------------------------------
        # Intent C: User Complaints & Tracking ("Show my complaints")
        # -------------------------------------------------------------
        elif "my complaint" in q or "my report" in q or "ನನ್ನ ದೂರು" in q or "ನನ್ನ ವರದಿ" in q or "मेरी शिकायत" in q or "मेरे रिपोर्ट" in q:
            tool_res = ToolRegistry.execute_tool("get_my_complaints", {}, user.id, user.role, user.area)
            executed_tool_results.append(tool_res)
            complaints = tool_res.get("complaints", [])

            if complaints:
                cmp_str_en = "\n".join([f"• #{c['complaint_id'][:8]}: {c['description']} ({c['area']}) - Status: {c['status']}" for c in complaints[:4]])
                cmp_str_kn = "\n".join([f"• #{c['complaint_id'][:8]}: {c['description']} ({c['area']}) - ಸ್ಥಿತಿ: {c['status']}" for c in complaints[:4]])
                cmp_str_hi = "\n".join([f"• #{c['complaint_id'][:8]}: {c['description']} ({c['area']}) - स्थिति: {c['status']}" for c in complaints[:4]])

                if "kannada" in language.lower():
                    msg = f"ನೀವು ಮೈಸೂರು ಪಾಲಿಕೆಗೆ ಸಲ್ಲಿಸಿರುವ ಒಟ್ಟು {len(complaints)} ದೂರುಗಳು:\n\n{cmp_str_kn}"
                elif "hindi" in language.lower():
                    msg = f"आपके द्वारा मैसूर नगर निगम में दर्ज कुल {len(complaints)} शिकायतें:\n\n{cmp_str_hi}"
                else:
                    msg = f"You have {len(complaints)} registered complaint(s) in CivicConnect:\n\n{cmp_str_en}"
            else:
                if "kannada" in language.lower():
                    msg = "ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ದೂರುಗಳು ದಾಖಲಾಗಿಲ್ಲ. ಹೊಸ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು 'Report a Problem' ಕ್ಲಿಕ್ ಮಾಡಿ."
                elif "hindi" in language.lower():
                    msg = "आपके खाते में अभी कोई शिकायत दर्ज नहीं है। नई शिकायत के लिए 'Report a Problem' पर क्लिक करें।"
                else:
                    msg = "You haven't reported any complaints yet. Click 'Report a Problem' to file a new issue."

        # -------------------------------------------------------------
        # Intent D: Supported Issues ("Which problems do I support?")
        # -------------------------------------------------------------
        elif "support" in q and ("my" in q or "i support" in q or "ನಾನು ಬೆಂಬಲಿಸಿದ" in q or "मेरे समर्थित" in q):
            tool_res = ToolRegistry.execute_tool("get_my_supported_issues", {}, user.id, user.role, user.area)
            executed_tool_results.append(tool_res)
            supported = tool_res.get("supported_issues", [])

            if supported:
                sup_str_en = "\n".join([f"• {s['title']} ({s['area']}) - Supporters: {s['support_count']}, Status: {s['status']}" for s in supported[:4]])
                sup_str_kn = "\n".join([f"• {s['title']} ({s['area']}) - ಒಟ್ಟು ಬೆಂಬಲಿಗರು: {s['support_count']}, ಸ್ಥಿತಿ: {s['status']}" for s in supported[:4]])
                sup_str_hi = "\n".join([f"• {s['title']} ({s['area']}) - कुल समर्थक: {s['support_count']}, स्थिति: {s['status']}" for s in supported[:4]])

                if "kannada" in language.lower():
                    msg = f"ನೀವು ಬೆಂಬಲ ನೀಡಿರುವ {len(supported)} ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು:\n\n{sup_str_kn}"
                elif "hindi" in language.lower():
                    msg = f"आपके द्वारा समर्थित {len(supported)} सार्वजनिक समस्याएं:\n\n{sup_str_hi}"
                else:
                    msg = f"You are currently supporting {len(supported)} civic issue(s):\n\n{sup_str_en}"
            else:
                if "kannada" in language.lower():
                    msg = "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಸಮಸ್ಯೆಗೆ ಬೆಂಬಲ ನೀಡಿಲ್ಲ. ನಿಮ್ಮ ಬಡಾವಣೆಯ ಸಮಸ್ಯೆಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಲು 'Explore Community Issues' ನೋಡಿ."
                elif "hindi" in language.lower():
                    msg = "आपने अभी तक किसी समस्या का समर्थन नहीं किया है।"
                else:
                    msg = "You are not currently supporting any civic issues. Explore local issues to add your support."

        # -------------------------------------------------------------
        # Intent E: Area Specific Query ("Issues in Gokulam", "Problems near me")
        # -------------------------------------------------------------
        elif "near" in q or "area" in q or "gokulam" in q or "kuvempunagar" in q or "vijayanagar" in q or "hebbal" in q or "ಪ್ರದೇಶ" in q or "ಹತ್ತಿರ" in q or "क्षेत्र" in q or "पास" in q:
            target_area = user_area
            for known_area in ("Gokulam", "Kuvempunagar", "Vijayanagar", "Hebbal", "Jayalakshmipuram", "Saraswathipuram", "Nazarbad", "JP Nagar"):
                if known_area.lower() in q:
                    target_area = known_area
                    break

            tool_res = ToolRegistry.execute_tool("get_area_issues", {"area": target_area}, user.id, user.role, user.area)
            executed_tool_results.append(tool_res)
            issues = tool_res.get("issues", [])

            if issues:
                area_iss_en = "\n".join([f"• {i['title']} (Priority: {i['priority_level']}, Supporters: {i['support_count']}, Status: {i['status']})" for i in issues[:4]])
                area_iss_kn = "\n".join([f"• {i['title']} (ಆದ್ಯತೆ: {i['priority_level']}, ಬೆಂಬಲಿಗರು: {i['support_count']}, ಸ್ಥಿತಿ: {i['status']})" for i in issues[:4]])
                area_iss_hi = "\n".join([f"• {i['title']} (प्राथमिकता: {i['priority_level']}, समर्थक: {i['support_count']}, स्थिति: {i['status']})" for i in issues[:4]])

                if "kannada" in language.lower():
                    msg = f"{target_area} (ಮೈಸೂರು) ಲೈವ್ ವರದಿಗಳು ({len(issues)} ಸಮಸ್ಯೆಗಳು ದಾಖಲಾಗಿವೆ):\n\n{area_iss_kn}\n\nನೀವು ಈ ಸಮಸ್ಯೆಗೆ ಬೆಂಬಲ ನೀಡಬಹುದು ಅಥವಾ ಹೊಸ ವರದಿ ಸಲ್ಲಿಸಬಹುದು."
                elif "hindi" in language.lower():
                    msg = f"{target_area} (मैसूर) लाइव रिपोर्ट ({len(issues)} समस्याएं दर्ज):\n\n{area_iss_hi}\n\nआप इन समस्याओं का समर्थन कर सकते हैं या नई रिपोर्ट दर्ज कर सकते हैं।"
                else:
                    msg = f"Live Civic Issues in {target_area}, Mysuru ({len(issues)} reported):\n\n{area_iss_en}\n\nClick 'Explore Community Issues' to support an existing problem."
            else:
                if "kannada" in language.lower():
                    msg = f"{target_area} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬಾಕಿ ಸಮಸ್ಯೆಗಳಿಲ್ಲ. ಹೊಸ ಸಮಸ್ಯೆ ಕಂಡರೆ ವರದಿ ಮಾಡಿ."
                elif "hindi" in language.lower():
                    msg = f"{target_area} में वर्तमान में कोई खुली समस्या नहीं है।"
                else:
                    msg = f"No open civic issues are currently reported in {target_area}, Mysuru."

        # -------------------------------------------------------------
        # Intent F: Priority Explanation ("Why is this issue Critical?")
        # -------------------------------------------------------------
        elif "priority" in q or "critical" in q or "score" in q or "ಆದ್ಯತೆ" in q or "ಅಂಕ" in q or "प्राथमिकता" in q:
            # Query top issue or search
            search_res = ToolRegistry.execute_tool("search_issues", {"query": "pothole", "area": user_area}, user.id, user.role, user.area)
            executed_tool_results.append(search_res)
            issues = search_res.get("issues", [])

            if issues:
                top_i = issues[0]
                p_res = ToolRegistry.execute_tool("get_issue_priority", {"issue_id": top_i["id"]}, user.id, user.role, user.area)
                executed_tool_results.append(p_res)
                factors = p_res.get("factors", {})

                if "kannada" in language.lower():
                    msg = (
                        f"ಆದ್ಯತೆಯ ಲೆಕ್ಕಾಚಾರ ({top_i['title']}):\n"
                        f"• ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: {top_i['priority_level'].upper()} ({top_i['priority_score']}/100)\n"
                        f"• ನಾಗರಿಕರ ಬೆಂಬಲ: {factors.get('support_count', 0)} ಬೆಂಬಲಿಗರು\n"
                        f"• ಅಪಘಾತಗಳ ವರದಿ: {factors.get('accidents_count', 0)}\n"
                        f"• ಗಾಯಗೊಂಡವರ ಸಂಖ್ಯೆ: {factors.get('injuries_count', 0)}\n\n"
                        f"ಆದ್ಯತೆಯನ್ನು ಯಾವುದೇ AI ಅಥವಾ ವ್ಯಕ್ತಿ ಯಾದೃಚ್ಛಿಕವಾಗಿ ನಿರ್ಧರಿಸುವುದಿಲ್ಲ. ಸುರಕ್ಷತೆ, ಅಪಘಾತಗಳು ಮತ್ತು ಸಮುದಾಯದ ಬೆಂಬಲದ ಗಣಿತೀಯ ಸೂತ್ರದ ಮೂಲಕ ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ."
                    )
                elif "hindi" in language.lower():
                    msg = (
                        f"प्राथमिकता गणना ({top_i['title']}):\n"
                        f"• वर्तमान स्थिति: {top_i['priority_level'].upper()} ({top_i['priority_score']}/100)\n"
                        f"• नागरिकों का समर्थन: {factors.get('support_count', 0)} समर्थक\n"
                        f"• दर्ज दुर्घटनाएं: {factors.get('accidents_count', 0)}\n"
                        f"• चोटों की संख्या: {factors.get('injuries_count', 0)}\n\n"
                        f"प्राथमिकता किसी AI द्वारा मनमाने ढंग से तय नहीं की जाती, बल्कि सुरक्षा, दुर्घटनाओं और नागरिक समर्थन के आधार पर गणना की जाती है।"
                    )
                else:
                    msg = (
                        f"Priority Factors for '{top_i['title']}':\n"
                        f"• Evaluated Priority: {top_i['priority_level'].upper()} (Score: {top_i['priority_score']}/100)\n"
                        f"• Community Support: {factors.get('support_count', 0)} verified supporters\n"
                        f"• Reported Accidents: {factors.get('accidents_count', 0)}\n"
                        f"• Reported Injuries: {factors.get('injuries_count', 0)}\n\n"
                        f"CivicConnect AI uses a strict deterministic formula based on real safety risks and community corroboration."
                    )
            else:
                rag_res = ToolRegistry.execute_tool("get_help_information", {"query": "how priority score calculated"}, user.id, user.role, user.area)
                executed_tool_results.append(rag_res)
                if "kannada" in language.lower():
                    msg = "ಆದ್ಯತಾ ಅಂಕ (Priority Score 0-100): ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ, ಅಪಘಾತಗಳು, ಗಾಯಗಳು, ಬಾಕಿ ಇರುವ ಸಮಯ ಮತ್ತು ಬೆಂಬಲದ ಆಧಾರದ ಮೇಲೆ ಕಟ್ಟುನಿಟ್ಟಾದ ಗಣಿತೀಯ ಸೂತ್ರದ ಮೂಲಕ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ."
                elif "hindi" in language.lower():
                    msg = "प्राथमिकता स्कोर (0-100): सुरक्षा खतरों, दुर्घटनाओं, चोटों और नागरिक समर्थन के आधार पर एक सटीक फॉर्मूले द्वारा तय किया जाता है।"
                else:
                    msg = "Priority Score (0-100): Computed deterministically using baseline severity, accident reports, injuries, community support volume, duration, and photo evidence."

        # -------------------------------------------------------------
        # Intent G: Similarity & Problem Reporting ("Pothole near ABC School")
        # -------------------------------------------------------------
        elif any(kw in q for kw in ("pothole", "leak", "garbage", "drain", "light", "ಗುಂಡಿ", "ನೀರು", "ಕಸ", "ಗಡ್ಡೆ", "कचरा", "सड़क")):
            sim_res = ToolRegistry.execute_tool("find_similar_issues", {"complaint_text": message, "area": user_area}, user.id, user.role, user.area)
            executed_tool_results.append(sim_res)
            matches = sim_res.get("matched_issues", [])

            if matches:
                top_m = matches[0]
                if "kannada" in language.lower():
                    msg = (
                        f"ನಾವು {top_m['area']} ನಲ್ಲಿ ಇದೇ ರೀತಿಯ ಸಮಸ್ಯೆಯನ್ನು ಪತ್ತೆಹಚ್ಚಿದ್ದೇವೆ:\n\n"
                        f"📌 '{top_m['title']}'\n"
                        f"• ಸ್ಥಿತಿ: {top_m['status']}\n"
                        f"• ಆದ್ಯತೆ: {top_m['priority_level'].upper()}\n"
                        f"• ಬೆಂಬಲಿಗರು: {top_m['support_count']} ಜನರು\n\n"
                        f"ನಕಲಿ ಟಿಕೆಟ್ ಸೃಷ್ಟಿಸದೆ ಪಾಲಿಕೆಯ ಗಮನ ಸೆಳೆಯಲು ನೀವು ಈ ಸಮಸ್ಯೆಗೆ ಬೆಂಬಲ ನೀಡಬಹುದು."
                    )
                elif "hindi" in language.lower():
                    msg = (
                        f"हमें {top_m['area']} में मिलती-जुलती समस्या मिली है:\n\n"
                        f"📌 '{top_m['title']}'\n"
                        f"• स्थिति: {top_m['status']}\n"
                        f"• प्राथमिकता: {top_m['priority_level'].upper()}\n"
                        f"• समर्थक: {top_m['support_count']} नागरिक\n\n"
                        f"डुप्लिकेट टिकट बनाए बिना नगर निगम का ध्यान आकर्षित करने के लिए आप इसका समर्थन कर सकते हैं।"
                    )
                else:
                    msg = (
                        f"We found a closely related existing civic problem in {top_m['area']}:\n\n"
                        f"📌 '{top_m['title']}'\n"
                        f"• Current Status: {top_m['status']}\n"
                        f"• Priority Level: {top_m['priority_level'].upper()}\n"
                        f"• Community Supporters: {top_m['support_count']} residents\n\n"
                        f"Would you like to support this existing issue or report a separate problem?"
                    )
            else:
                if "kannada" in language.lower():
                    msg = f"{user_area} ನಲ್ಲಿ ಯಾವುದೇ ನಿಕಟ ಸಮಸ್ಯೆಯು ಕಂಡುಬಂದಿಲ್ಲ. ನೀವು 'Report a Problem' ಮೂಲಕ ಹೊಸ ವರದಿಯನ್ನು ಸಲ್ಲಿಸಬಹುದು."
                elif "hindi" in language.lower():
                    msg = f"{user_area} में कोई मिलता-जुलता मामला नहीं मिला। आप 'Report a Problem' पर क्लिक करके नई रिपोर्ट दर्ज कर सकते हैं।"
                else:
                    msg = f"I couldn't find a matching existing problem in {user_area}. Would you like to create a new report?"

        # -------------------------------------------------------------
        # Default Civic Guide
        # -------------------------------------------------------------
        else:
            rag_res = ToolRegistry.execute_tool("get_help_information", {"query": message}, user.id, user.role, user.area)
            executed_tool_results.append(rag_res)

            if "kannada" in language.lower():
                msg = f"ನಮಸ್ಕಾರ {user.full_name or 'ನಾಗರಿಕರೇ'}! ನಾನು ಮೈಸೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (MCC) ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ಮಾರ್ಗದರ್ಶಿ. {user_area} ದ ಲೈವ್ ಸಮಸ್ಯೆಗಳು, ದೂರು ಸಲ್ಲಿಕೆ, ಆದ್ಯತಾ ಲೆಕ್ಕಾಚಾರ ಅಥವಾ ಕಾಮಗಾರಿ ಪ್ರಗತಿ ಬಗ್ಗೆ ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು."
            elif "hindi" in language.lower():
                msg = f"नमस्ते {user.full_name or 'नागरिक'}! मैं मैसूर नगर निगम (MCC) सिविककनेक्ट AI गाइड हूँ। {user_area} की समस्याओं, रिपोर्ट दर्ज करने, प्राथमिकता गणना या कार्य प्रगति के बारे में पूछें।"
            else:
                msg = f"Hello {user.full_name or 'Resident'}! I am your real-time CivicConnect AI Assistant for Mysuru Municipal Corporation. Ask me about live issues in {user_area}, reporting problems, tracking repairs, or municipal triage."

        result = ResponseValidator.sanitize_and_build_actions(
            raw_message=msg,
            role=user.role,
            language=language,
            tool_results=executed_tool_results,
            conversation_id=conversation_id
        )

        self.memory.add_message(conversation_id, "assistant", result["message"])
        return result


chatbot_service = ChatbotService()
