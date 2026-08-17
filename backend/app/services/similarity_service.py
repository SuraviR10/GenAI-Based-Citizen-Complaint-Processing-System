"""
CivicConnect AI — Intelligent Similarity & Deduplication Service
Implements modular embedding generation and hybrid similarity search
combining semantic vector embeddings, spatial locality, and categorical signals.
"""

import math
import re
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Set, Tuple, Optional, Any
from app.config import settings
from app.database import get_supabase
from app.models.issue import SimilaritySearchRequest, SimilaritySearchResponse, SimilarIssueMatch
from app.services.supabase_service import supabase_service

logger = logging.getLogger("civicconnect.similarity_service")

# ====================================================================
# 1. EMBEDDING PROVIDER ABSTRACTION
# ====================================================================

class BaseEmbeddingProvider(ABC):
    """Abstract Base Class for text embeddings to allow pluggable models."""
    
    @abstractmethod
    def get_embedding(self, text: str) -> Dict[str, float]:
        """Returns a normalized term-frequency / embedding vector."""
        pass

    @abstractmethod
    def calculate_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """Calculates cosine similarity between two embedding vectors (0.0 to 1.0)."""
        pass

class FastSemanticEmbeddingProvider(BaseEmbeddingProvider):
    """
    High-performance, zero-dependency sub-word n-gram & TF-IDF weighted embedding engine.
    Extracts semantic character n-grams and token frequencies to capture spelling variations,
    morphology, and domain terminology across English, Kannada, and Hindi transliterations.
    """

    STOPWORDS: Set[str] = {
        "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for",
        "of", "and", "or", "by", "with", "from", "near", "there", "this", "that",
        "very", "too", "please", "kindly", "problem", "issue", "sir", "madam"
    }

    def _tokenize_and_ngrams(self, text: str) -> List[str]:
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        tokens = [w for w in cleaned.split() if w and w not in self.STOPWORDS]
        features = list(tokens)

        # Generate character 3-grams for fuzzy word matching
        for token in tokens:
            if len(token) >= 4:
                for i in range(len(token) - 2):
                    features.append(token[i:i+3])
        return features

    def get_embedding(self, text: str) -> Dict[str, float]:
        features = self._tokenize_and_ngrams(text)
        if not features:
            return {}

        counts: Dict[str, float] = {}
        for f in features:
            counts[f] = counts.get(f, 0.0) + 1.0

        # Compute Euclidean norm for unit vector normalization
        norm_sq = sum(v * v for v in counts.values())
        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0

        return {k: v / norm for k, v in counts.items()}

    def calculate_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        if not vec_a or not vec_b:
            return 0.0

        # Dot product of normalized vectors = Cosine similarity
        common_keys = set(vec_a.keys()).intersection(vec_b.keys())
        dot_product = sum(vec_a[k] * vec_b[k] for k in common_keys)
        return max(0.0, min(1.0, dot_product))


# ====================================================================
# 2. SIMILARITY SERVICE
# ====================================================================

class SimilarityService:
    def __init__(self, embedding_provider: Optional[BaseEmbeddingProvider] = None):
        self.embedding_provider = embedding_provider or FastSemanticEmbeddingProvider()

    def get_embedding(self, text: str) -> Dict[str, float]:
        """Generates normalized semantic embedding vector."""
        return self.embedding_provider.get_embedding(text)

    def calculate_cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """Calculates cosine similarity between two embedding vectors."""
        return self.embedding_provider.calculate_similarity(vec_a, vec_b)

    def _calculate_text_overlap(self, text_a: str, text_b: str) -> float:
        """Calculates token overlap between two text segments."""
        words_a = set(re.findall(r'\b\w{3,}\b', text_a.lower()))
        words_b = set(re.findall(r'\b\w{3,}\b', text_b.lower()))
        if not words_a or not words_b:
            return 0.0
        intersection = words_a.intersection(words_b)
        union = words_a.union(words_b)
        return len(intersection) / len(union)

    def find_similar_issues(self, req: SimilaritySearchRequest) -> SimilaritySearchResponse:
        """
        Finds open civic issues matching the citizen's report to prevent duplication.
        Uses embedding similarity + locality & landmark matching.
        """
        issues = []
        support_counts = {}
        complaint_counts = {}
        latest_updates = {}

        if settings.is_supabase_configured:
            try:
                supabase = get_supabase()
                query = supabase.table("civic_issues").select(
                    "id, title, description, category, area, landmark, status, priority_level, created_at"
                ).in_("status", ["reported", "reviewed", "assigned", "in_progress"])

                if req.area:
                    response = query.eq("area", req.area).execute()
                    issues = response.data or []
                    if not issues:
                        response = supabase.table("civic_issues").select(
                            "id, title, description, category, area, landmark, status, priority_level, created_at"
                        ).in_("status", ["reported", "reviewed", "assigned", "in_progress"]).limit(30).execute()
                        issues = response.data or []
                else:
                    response = query.limit(30).execute()
                    issues = response.data or []

                issue_ids = [issue["id"] for issue in issues]
                if issue_ids:
                    try:
                        sup_res = supabase.table("issue_support").select("issue_id").in_("issue_id", issue_ids).execute()
                        for item in sup_res.data or []:
                            iid = item["issue_id"]
                            support_counts[iid] = support_counts.get(iid, 0) + 1

                        cmp_res = supabase.table("complaints").select("civic_issue_id").in_("civic_issue_id", issue_ids).execute()
                        for item in cmp_res.data or []:
                            iid = item["civic_issue_id"]
                            complaint_counts[iid] = complaint_counts.get(iid, 0) + 1

                        upd_res = supabase.table("issue_updates").select("issue_id, description, created_at").in_("issue_id", issue_ids).order("created_at", desc=True).execute()
                        for item in upd_res.data or []:
                            iid = item["issue_id"]
                            if iid not in latest_updates:
                                latest_updates[iid] = item["description"]
                    except Exception as e:
                        logger.warning(f"Error fetching counts for similarity candidates: {e}")
            except Exception as e:
                logger.error(f"Error executing similarity search in Supabase: {e}. Falling back to memory store.")

        # Merge in-memory store issues (e.g. test fixtures or newly submitted local issues)
        existing_ids = {iss["id"] for iss in issues if "id" in iss}
        for iid, iss in supabase_service._memory_issues.items():
            if iid not in existing_ids and iss.get("status") in ["reported", "reviewed", "assigned", "in_progress"]:
                issues.append(iss)
                support_counts[iid] = sum(1 for i, c in supabase_service._memory_support if i == iid)
                complaint_counts[iid] = sum(1 for c in supabase_service._memory_complaints.values() if c.get("civic_issue_id") == iid)
                upds = supabase_service._memory_updates.get(iid, [])
                if upds:
                    latest_updates[iid] = upds[-1]["description"]

        if not issues:
            return SimilaritySearchResponse(found_matches=False, matched_issues=[], suggested_action="create_new")

        # Generate embedding for the incoming complaint
        req_query_text = f"{req.text} {req.landmark or ''}"
        req_vec = self.embedding_provider.get_embedding(req_query_text)

        scored_matches: List[SimilarIssueMatch] = []

        for issue in issues:
            score = 0.0
            reasons = []

            # 1. Semantic Embedding Similarity (0.0 to 0.40 weight)
            issue_text = f"{issue.get('title', '')} {issue.get('description', '')}"
            issue_vec = self.embedding_provider.get_embedding(issue_text)
            semantic_sim = self.embedding_provider.calculate_similarity(req_vec, issue_vec)
            score += semantic_sim * 0.40

            if semantic_sim > 0.30:
                reasons.append("Similar problem description & symptoms")

            # 2. Area Match (0.30 weight)
            area_match = bool(req.area and issue.get("area") and req.area.strip().lower() == issue.get("area", "").strip().lower())
            if area_match:
                score += 0.30
                reasons.append(f"Located in same neighborhood ({issue.get('area')})")

            # 3. Category Match (0.20 weight)
            cat_match = bool(req.category and issue.get("category") and req.category.strip().lower() == issue.get("category", "").strip().lower())
            if cat_match:
                score += 0.20
                reasons.append(f"Matching civic category ({issue.get('category')})")

            # 4. Landmark Overlap (0.10 weight)
            if req.landmark and issue.get("landmark"):
                landmark_overlap = self._calculate_text_overlap(req.landmark, issue.get("landmark", ""))
                if landmark_overlap > 0.25:
                    score += 0.10
                    reasons.append(f"Similar landmark reference ({issue.get('landmark')})")

            # Threshold Filter: 0.35 minimum for candidates
            min_threshold = req.threshold if req.threshold is not None else 0.35
            if score >= min_threshold:
                # Recommendation classification
                if score >= 0.65 and area_match:
                    recommendation = "strong_match"
                elif score >= 0.40:
                    recommendation = "possible_match"
                else:
                    recommendation = "low_match"

                scored_matches.append(SimilarIssueMatch(
                    id=issue["id"],
                    title=issue.get("title", "Civic Problem"),
                    description=issue.get("description", ""),
                    category=issue.get("category", "General"),
                    area=issue.get("area", "Local Area"),
                    landmark=issue.get("landmark"),
                    status=issue.get("status", "reported"),
                    priority_level=issue.get("priority_level", "medium"),
                    support_count=support_counts.get(issue["id"], 0),
                    complaint_count=complaint_counts.get(issue["id"], 1),
                    latest_update=latest_updates.get(issue["id"]),
                    created_at=issue.get("created_at"),
                    similarity_score=round(min(1.0, score), 2),
                    location_match=area_match,
                    recommendation=recommendation,
                    match_reasons=reasons if reasons else ["Nearby problem reported by local residents"]
                ))

        # Sort candidate matches by score descending
        scored_matches.sort(key=lambda x: x.similarity_score, reverse=True)
        top_matches = scored_matches[:3]

        suggested_action = "link_existing" if top_matches and top_matches[0].similarity_score >= 0.55 else "create_new"

        return SimilaritySearchResponse(
            found_matches=len(top_matches) > 0,
            matched_issues=top_matches,
            suggested_action=suggested_action
        )

similarity_service = SimilarityService()
