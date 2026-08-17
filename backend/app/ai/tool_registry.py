"""
CivicConnect AI — Tool Registry & Authorization Engine
Defines Groq tool calling schemas (JSON Function definitions), role permissions,
and executes tool functions with strict parameter and permission enforcement.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from app.ai import tools
from app.ai.rag_service import rag_service

logger = logging.getLogger("civicconnect.ai.tool_registry")

# ====================================================================
# 1. GROQ TOOL CALLING SCHEMAS (JSON FUNCTION SPECIFICATIONS)
# ====================================================================

CITIZEN_TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_my_complaints",
            "description": "Retrieves the authenticated citizen's submitted complaints and their live resolution statuses.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_supported_issues",
            "description": "Retrieves all civic issues that the authenticated citizen has upvoted / supported.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_issue",
            "description": "Gets full details for a specific civic issue ID including supporters count, priority score, and complaints count.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "The unique ID of the civic issue"}
                },
                "required": ["issue_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_issues",
            "description": "Searches public civic issues in Mysuru by keywords, locality name, or category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search keyword or problem title"},
                    "area": {"type": "string", "description": "Mysuru locality (e.g. Gokulam, Kuvempunagar, Vijayanagar)"},
                    "category": {"type": "string", "description": "Civic category (e.g. Roads & Footpaths, Water & Sewage)"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_similar_issues",
            "description": "Checks whether a similar civic problem has already been reported nearby using semantic embeddings to prevent duplicate tickets.",
            "parameters": {
                "type": "object",
                "properties": {
                    "complaint_text": {"type": "string", "description": "The citizen's description of the problem"},
                    "area": {"type": "string", "description": "Mysuru locality / ward name"},
                    "landmark": {"type": "string", "description": "Nearby landmark or street name"}
                },
                "required": ["complaint_text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_issue_tracking",
            "description": "Retrieves the real-time timeline, updates from workers, and official municipal statements for an issue.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "The unique ID of the civic issue"}
                },
                "required": ["issue_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_area_issues",
            "description": "Retrieves active civic issues in a specific Mysuru neighborhood or ward.",
            "parameters": {
                "type": "object",
                "properties": {
                    "area": {"type": "string", "description": "Mysuru locality name (e.g. Gokulam, Kuvempunagar, Vijayanagar, Hebbal)"}
                },
                "required": ["area"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_issue_priority",
            "description": "Retrieves the factual accident reports, injury counts, supporter numbers, and duration contributing to an issue's priority score.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "The unique ID of the civic issue"}
                },
                "required": ["issue_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_help_information",
            "description": "Searches MCC guidelines, complaint procedures, priority scoring criteria, and FAQs via knowledge retrieval.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Civic help or policy question"}
                },
                "required": ["query"]
            }
        }
    }
]

WORKER_TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_assigned_issues",
            "description": "Retrieves all work orders and repair tasks currently assigned to the authenticated field worker.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_worker_issue",
            "description": "Retrieves detailed operational specifications and location coordinates for an assigned work order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "The unique ID of the assigned issue"}
                },
                "required": ["issue_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_issue_evidence",
            "description": "Retrieves photo evidence, inspection photos, and citizen attachments for an issue.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "The unique ID of the civic issue"}
                },
                "required": ["issue_id"]
            }
        }
    }
]

CORPORATION_TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_priority_issues",
            "description": "Retrieves the top priority civic issues across Mysuru ranked by deterministic urgency score (0-100).",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "description": "Number of issues to retrieve (default 10)"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_issue_statistics",
            "description": "Retrieves high-level municipal statistics on issues, status breakdown, and priority metrics.",
            "parameters": {
                "type": "object",
                "properties": {
                    "department": {"type": "string", "description": "Filter by department (optional)"},
                    "area": {"type": "string", "description": "Filter by Mysuru locality (optional)"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_worker_assignments",
            "description": "Retrieves active field crews, their assigned departments, locations, and current workloads.",
            "parameters": {
                "type": "object",
                "properties": {
                    "department": {"type": "string", "description": "Filter by department (optional)"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_corroboration_data",
            "description": "Retrieves multi-source corroboration metrics and independent citizen reports for an issue.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "The unique ID of the civic issue"}
                },
                "required": ["issue_id"]
            }
        }
    }
]


# ====================================================================
# 2. ROLE-BASED TOOL PERMISSION REGISTRY
# ====================================================================

class ToolRegistry:
    @classmethod
    def get_tools_for_role(cls, role: str) -> List[Dict[str, Any]]:
        """Returns the permitted Groq tool schemas for the given role."""
        role_clean = (role or "citizen").lower()
        
        # Base tools available to everyone
        permitted = list(CITIZEN_TOOL_SCHEMAS)
        
        if role_clean in ("worker", "corporation"):
            permitted.extend(WORKER_TOOL_SCHEMAS)
            
        if role_clean == "corporation":
            permitted.extend(CORPORATION_TOOL_SCHEMAS)
            
        return permitted

    @classmethod
    def execute_tool(
        cls,
        tool_name: str,
        arguments: Dict[str, Any],
        user_id: str,
        user_role: str,
        user_area: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a tool function with verified role authorization and parameter injection.
        """
        role_clean = (user_role or "citizen").lower()
        logger.info(f"Executing tool '{tool_name}' for user {user_id} (Role: {role_clean})")

        # -------------------------------------------------------------
        # Citizen Permitted Tools
        # -------------------------------------------------------------
        if tool_name == "get_my_complaints":
            return tools.get_my_complaints(user_id=user_id)

        elif tool_name == "get_my_supported_issues":
            return tools.get_my_supported_issues(user_id=user_id)

        elif tool_name == "get_issue":
            issue_id = arguments.get("issue_id")
            if not issue_id:
                return {"status": "error", "message": "issue_id parameter is required"}
            return tools.get_issue(issue_id=issue_id)

        elif tool_name == "search_issues":
            query = arguments.get("query", "")
            area = arguments.get("area") or user_area
            category = arguments.get("category")
            return tools.search_issues(query=query, area=area, category=category)

        elif tool_name == "find_similar_issues":
            complaint_text = arguments.get("complaint_text", "")
            area = arguments.get("area") or user_area
            landmark = arguments.get("landmark")
            return tools.find_similar_issues(complaint_text=complaint_text, area=area, landmark=landmark)

        elif tool_name == "get_issue_tracking":
            issue_id = arguments.get("issue_id")
            if not issue_id:
                return {"status": "error", "message": "issue_id parameter is required"}
            return tools.get_issue_tracking(issue_id=issue_id)

        elif tool_name == "get_area_issues":
            area = arguments.get("area") or user_area or "Gokulam"
            return tools.get_area_issues(area=area)

        elif tool_name == "get_issue_priority":
            issue_id = arguments.get("issue_id")
            if not issue_id:
                return {"status": "error", "message": "issue_id parameter is required"}
            return tools.get_issue_priority(issue_id=issue_id)

        elif tool_name == "get_help_information":
            query = arguments.get("query", "")
            docs = rag_service.retrieve_relevant_knowledge(query=query)
            return {
                "status": "success",
                "query": query,
                "count": len(docs),
                "knowledge_documents": docs,
                "source_type": "rag_knowledge_base",
                "source_label": "MCC Citizen Charter & Municipal Guidelines"
            }

        # -------------------------------------------------------------
        # Worker Tools (Worker & Corporation Authorized)
        # -------------------------------------------------------------
        elif tool_name in ("get_assigned_issues", "get_worker_issue", "get_issue_evidence"):
            if role_clean not in ("worker", "corporation"):
                logger.warning(f"Unauthorized tool call '{tool_name}' by citizen user {user_id}")
                return {
                    "status": "unauthorized",
                    "message": "Access denied. This operational tool is restricted to authorized field workers and municipal officials."
                }

            if tool_name == "get_assigned_issues":
                return tools.get_assigned_issues(worker_id=user_id)
            elif tool_name == "get_worker_issue":
                issue_id = arguments.get("issue_id")
                return tools.get_worker_issue(issue_id=issue_id, worker_id=user_id)
            elif tool_name == "get_issue_evidence":
                issue_id = arguments.get("issue_id")
                return tools.get_issue_evidence(issue_id=issue_id)

        # -------------------------------------------------------------
        # Corporation Tools (Corporation Officials Only)
        # -------------------------------------------------------------
        elif tool_name in ("get_priority_issues", "get_issue_statistics", "get_worker_assignments", "get_corroboration_data"):
            if role_clean != "corporation":
                logger.warning(f"Unauthorized corporation tool call '{tool_name}' by role {role_clean}")
                return {
                    "status": "unauthorized",
                    "message": "Access denied. This tool is restricted to Mysuru City Corporation officials."
                }

            if tool_name == "get_priority_issues":
                limit = int(arguments.get("limit", 10))
                return tools.get_priority_issues(limit=limit)
            elif tool_name == "get_issue_statistics":
                department = arguments.get("department")
                area = arguments.get("area") or user_area
                return tools.get_issue_statistics(department=department, area=area)
            elif tool_name == "get_worker_assignments":
                department = arguments.get("department")
                return tools.get_worker_assignments(department=department)
            elif tool_name == "get_corroboration_data":
                issue_id = arguments.get("issue_id")
                return tools.get_corroboration_data(issue_id=issue_id)

        # Unknown Tool
        return {
            "status": "error",
            "message": f"Unknown or unrecognized tool '{tool_name}'."
        }
