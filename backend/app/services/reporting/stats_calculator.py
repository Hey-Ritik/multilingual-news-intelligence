from typing import List, Dict, Any
from app.schemas.article import IngestedArticle
from app.schemas.nlp import (
    SentimentResult, EmotionResult, NamedEntity, ClaimObservation
)
from app.schemas.framing import FramingAnalysisResult
from app.schemas.discovery import ArticleCandidate, CandidateOutcome
from app.schemas.report import StatisticalReport
from app.utils.unicode_utils import count_words_and_tokens

def calculate_statistical_report(
    article: IngestedArticle,
    sentiment: SentimentResult,
    emotion: EmotionResult,
    entities: List[NamedEntity],
    claims: List[ClaimObservation],
    framing: FramingAnalysisResult,
    candidates: List[ArticleCandidate]
) -> StatisticalReport:
    """Calculates all normalized metrics and statistical distributions."""
    word_count, token_count = count_words_and_tokens(article.text)

    # Entity counts by type
    ent_counts = {}
    for e in entities:
        ent_counts[e.label.value] = ent_counts.get(e.label.value, 0) + 1

    # Claim counts by type
    claim_counts = {}
    for c in claims:
        claim_counts[c.claim_type.value] = claim_counts.get(c.claim_type.value, 0) + 1

    # Candidate outcomes
    verified_count = sum(1 for c in candidates if c.outcome == CandidateOutcome.VERIFIED_SAME_EVENT)
    likely_count = sum(1 for c in candidates if c.outcome == CandidateOutcome.LIKELY_SAME_EVENT)

    # Language breakdown of discovered candidates
    lang_breakdown = {}
    for c in candidates:
        lang_breakdown[c.language] = lang_breakdown.get(c.language, 0) + 1

    density = round((len(framing.findings) / max(1, token_count)) * 1000, 2)

    return StatisticalReport(
        word_count=word_count,
        char_count=len(article.text),
        sentence_count=article.metadata.sentence_count or 1,
        evidence_density_per_1000_tokens=density,
        sentiment_score=sentiment.score,
        primary_emotion=emotion.primary_emotion.value,
        entity_count_by_type=ent_counts,
        claim_count_by_type=claim_counts,
        framing_indicators_by_category=framing.category_counts,
        discovery_candidates_total=len(candidates),
        verified_same_event_count=verified_count,
        likely_same_event_count=likely_count,
        language_breakdown=lang_breakdown
    )

