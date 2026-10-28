from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class ProviderState(str, Enum):
    SUCCESS_WITH_RESULTS = "SUCCESS_WITH_RESULTS"
    SUCCESS_NO_RESULTS = "SUCCESS_NO_RESULTS"
    TIMEOUT = "TIMEOUT"
    PROVIDER_ERROR = "PROVIDER_ERROR"
    UNSUPPORTED_QUERY = "UNSUPPORTED_QUERY"

class CandidateOutcome(str, Enum):
    VERIFIED_SAME_EVENT = "VERIFIED SAME EVENT"
    POSSIBLE_MATCH = "POSSIBLE MATCH"
    RELATED_TOPIC = "RELATED TOPIC ONLY"
    DIFFERENT_EVENT = "DIFFERENT EVENT"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT EVIDENCE"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            v_upper = value.upper().replace("-", " ").strip()
            if v_upper in ("VERIFIED_SAME_EVENT", "VERIFIED SAME EVENT"):
                return cls.VERIFIED_SAME_EVENT
            if v_upper in ("POSSIBLE_MATCH", "POSSIBLE MATCH", "LIKELY_SAME_EVENT", "LIKELY SAME EVENT"):
                return cls.POSSIBLE_MATCH
            if v_upper in ("RELATED_TOPIC", "RELATED TOPIC", "RELATED TOPIC ONLY"):
                return cls.RELATED_TOPIC
            if v_upper in ("DIFFERENT_EVENT", "DIFFERENT EVENT", "REJECTED"):
                return cls.DIFFERENT_EVENT
            if v_upper in ("INSUFFICIENT_EVIDENCE", "INSUFFICIENT EVIDENCE"):
                return cls.INSUFFICIENT_EVIDENCE
        return super()._missing_(value)

# Backward-compatibility aliases on enum
CandidateOutcome.LIKELY_SAME_EVENT = CandidateOutcome.POSSIBLE_MATCH
CandidateOutcome.REJECTED = CandidateOutcome.DIFFERENT_EVENT

class RetrievalStatus(str, Enum):
    FULL_TEXT_RETRIEVED = "FULL_TEXT_RETRIEVED"
    PARTIAL_TEXT_RETRIEVED = "PARTIAL_TEXT_RETRIEVED"
    SNIPPET_ONLY = "SNIPPET_ONLY"
    METADATA_ONLY = "METADATA_ONLY"
    RETRIEVAL_FAILED = "RETRIEVAL_FAILED"

class ArticleCandidate(BaseModel):
    candidate_id: str
    title: str
    url: str
    publisher: Optional[str] = None
    publish_date: Optional[str] = None
    language: str
    snippet: Optional[str] = None
    discovery_provider: str
    discovery_query: str
    outcome: CandidateOutcome = CandidateOutcome.INSUFFICIENT_EVIDENCE
    outcome_reasoning: str = ""
    similarity_score: float = 0.0
    entity_overlap_score: float = 0.0
    retrieval_status: RetrievalStatus = RetrievalStatus.METADATA_ONLY
    retrieved_text: Optional[str] = None
    retrieval_error: Optional[str] = None

class ProviderStatusReport(BaseModel):
    provider_name: str
    language: str
    state: ProviderState
    result_count: int = 0
    message: Optional[str] = None

class DiscoveryRequest(BaseModel):
    target_languages: List[str] = Field(default_factory=lambda: ["en", "hi", "kn", "te", "ta"])
    max_results_per_lang: int = 6

