"""
Multi-Dataset Retrieval Engine for NASA BASS-II and FLEX Research Evidence.
Uses TF-IDF vectorization, cosine similarity scoring, and combustion domain keyword boosting.
Supports strict dataset filtering:
- "all": Cross-dataset search across all three NASA investigations
- "bass_ii": NASA PSI-25 solid polymer combustion records & TM-20210011385 report
- "flex_planned": NASA FLEX EIRD v4.0 planned science protocol matrix (290 conditions)
- "flex_results": NASA PSI-69 as-run droplet flight results (274 tests)

Integrates StructuredEvidenceEngine for exact numerical computations and citations.
"""

import logging
import re
from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.document_processor import DocumentProcessor
from src.structured_engine import StructuredEvidenceEngine

logger = logging.getLogger(__name__)

# Key combustion and NASA mission domain terms that warrant relevance boosting
DOMAIN_KEYWORDS = {
    "combustion",
    "flame",
    "fire",
    "microgravity",
    "bass",
    "bass-ii",
    "iss",
    "glovebox",
    "msg",
    "cir",
    "oxygen",
    "o2",
    "airflow",
    "velocity",
    "extinction",
    "quench",
    "spread",
    "ignition",
    "pmma",
    "sibal",
    "nomex",
    "carbon",
    "monoxide",
    "co",
    "co2",
    "bhattacharjee",
    "ferkul",
    "olson",
    "tien",
    "miller",
    "fernandez-pello",
    "williams",
    "hicks",
    "dietrich",
    "opposed",
    "concurrent",
    "stagnation",
    "flammability",
    "smoke",
    "buoyancy",
    "freefall",
    "flex",
    "droplet",
    "methanol",
    "heptane",
    "eird",
    "suppressant",
    "disruption",
    "completion",
    "diameter",
    "burning",
    "rate",
    "quiescent",
    "radiation",
    "tether",
    "diluent",
    "helium",
    "nitrogen",
}


class NASARetriever:
    """Lightweight, reliable evidence retrieval system across BASS-II and FLEX documents."""

    def __init__(self, document_processor: Optional[DocumentProcessor] = None):
        if document_processor is None:
            self.dp = DocumentProcessor()
        else:
            self.dp = document_processor

        self.structured_engine = StructuredEvidenceEngine(workspace_root=self.dp.root)
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self._initialize_index()

    def _initialize_index(self):
        """Load or build document chunks and fit TF-IDF vectorizer."""
        self.chunks = self.dp.build_or_load_index()
        if not self.chunks:
            logger.warning("No document chunks available for retrieval index.")
            return

        corpus = [c["content"] for c in self.chunks]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_df=0.85,
            min_df=1,
            sublinear_tf=True,
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        logger.info(
            f"NASARetriever initialized with {len(self.chunks)} multi-dataset chunks."
        )

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        dataset_filter: str = "all",
        min_raw_score: float = 0.04,
        min_final_score: float = 0.10,
    ) -> List[Dict[str, Any]]:
        """Search NASA documents for the most relevant evidence passages.

        Args:
            query: User search or question string.
            top_k: Maximum number of passages to return.
            dataset_filter: "all", "bass_ii", "flex_planned", or "flex_results".
            min_raw_score: Minimum baseline TF-IDF cosine similarity.
            min_final_score: Minimum boosted score to qualify as supporting evidence.

        Returns:
            List of passage dictionaries ranked by relevance, filtered by dataset.
        """
        if not query or not query.strip():
            return []

        if self.tfidf_matrix is None or not self.chunks:
            self._initialize_index()
            if self.tfidf_matrix is None:
                return []

        # 1. Compute cosine similarity with TF-IDF across whole index
        query_vec = self.vectorizer.transform([query])
        raw_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # 2. Extract query keywords for domain boosting
        query_words = set(re.findall(r"\w+", query.lower()))
        domain_matches = query_words.intersection(DOMAIN_KEYWORDS)

        final_scores = np.copy(raw_scores)

        for idx, chunk in enumerate(self.chunks):
            # Only boost if chunk already has non-trivial baseline lexical similarity
            if raw_scores[idx] >= min_raw_score:
                content_lower = chunk["content"].lower()
                match_count = sum(1 for kw in domain_matches if kw in content_lower)
                final_scores[idx] += 0.05 * match_count

        # 3. Sort by relevance
        ranked_indices = np.argsort(final_scores)[::-1]

        results = []
        for idx in ranked_indices:
            chunk_data = self.chunks[idx]
            chunk_dataset = chunk_data.get("dataset", "bass_ii")

            # Apply dataset filter
            if dataset_filter and dataset_filter != "all" and chunk_dataset != dataset_filter:
                continue

            score = float(final_scores[idx])
            # Strict threshold to reject completely irrelevant questions
            if score < min_final_score or raw_scores[idx] < min_raw_score:
                continue

            item = dict(chunk_data)
            item["relevance_score"] = round(score, 4)
            item["score"] = round(score, 4)
            item["raw_tfidf_score"] = round(float(raw_scores[idx]), 4)
            results.append(item)
            if len(results) >= top_k:
                break

        return results

    def retrieve_evidence(
        self,
        query: str,
        dataset_filter: str = "all",
        top_k: int = 4,
    ) -> Dict[str, Any]:
        """Perform unified multi-dataset evidence retrieval combining structured facts and document passages.

        Args:
            query: User search question.
            dataset_filter: "all", "bass_ii", "flex_planned", or "flex_results".
            top_k: Maximum document passages.

        Returns:
            Dictionary with structured evidence, passages, and active filter.
        """
        structured = self.structured_engine.query(query, dataset_filter=dataset_filter)
        passages = self.retrieve(query, top_k=top_k, dataset_filter=dataset_filter)

        return {
            "query": query,
            "dataset_filter": dataset_filter,
            "structured_evidence": structured,
            "passages": passages,
        }

    def get_source_statistics(self) -> Dict[str, Any]:
        """Return counts of indexed chunks and available source files across datasets."""
        stats = {
            "total_chunks": len(self.chunks),
            "datasets": {},
            "sources": {},
            "sources_verified": self.dp.verify_sources(),
        }
        for c in self.chunks:
            ds = c.get("dataset", "bass_ii")
            stats["datasets"][ds] = stats["datasets"].get(ds, 0) + 1
            src = c.get("source_file", "unknown")
            stats["sources"][src] = stats["sources"].get(src, 0) + 1
        return stats
