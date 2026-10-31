from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.schemas.article import IngestedArticle
from app.schemas.language import LanguageDetectionResult
from app.schemas.nlp import (
    SentimentResult, EmotionResult, NamedEntity, ClaimObservation, SummaryResult
)
from app.schemas.framing import FramingAnalysisResult
from app.schemas.event import EventProfile, LanguageQuery
from app.schemas.discovery import ArticleCandidate, ProviderStatusReport
from app.schemas.comparison import CrossLanguageComparisonResult

class StatisticalReport(BaseModel):
    word_count: int
    char_count: int
    sentence_count: int
    evidence_density_per_1000_tokens: float
    sentiment_score: float
    primary_emotion: str
    entity_count_by_type: Dict[str, int]
    claim_count_by_type: Dict[str, int]
    framing_indicators_by_category: Dict[str, int]
    discovery_candidates_total: int
    verified_same_event_count: int
    likely_same_event_count: int
    language_breakdown: Dict[str, int]

class FullAnalysisReport(BaseModel):
    report_id: str
    generated_at: str
    article: IngestedArticle
    language: LanguageDetectionResult
    summary: SummaryResult
    sentiment: SentimentResult
    emotion: EmotionResult
    entities: List[NamedEntity]
    claims: List[ClaimObservation]
    framing: FramingAnalysisResult
    event_profile: EventProfile
    generated_queries: List[LanguageQuery]
    provider_statuses: List[ProviderStatusReport] = Field(default_factory=list)
    candidates: List[ArticleCandidate] = Field(default_factory=list)
    comparison: Optional[CrossLanguageComparisonResult] = None
    statistics: StatisticalReport
    methodology_summary: str
    limitations: List[str]

