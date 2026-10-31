import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.article import (
    IngestedArticle, TextIngestRequest, UrlIngestRequest, ExtractionStatus
)
from app.schemas.language import LanguageDetectionResult
from app.schemas.nlp import (
    SentimentResult, EmotionResult, NamedEntity, ClaimObservation, SummaryResult
)
from app.schemas.framing import FramingAnalysisResult
from app.schemas.event import EventProfile, LanguageQuery
from app.schemas.discovery import (
    ArticleCandidate, ProviderStatusReport, DiscoveryRequest
)
from app.schemas.comparison import CrossLanguageComparisonResult
from app.schemas.report import FullAnalysisReport, StatisticalReport

from app.services.ingestion.text_ingest import ingest_pasted_text
from app.services.ingestion.url_ingest import ingest_url_article
from app.services.ingestion.pdf_ingest import ingest_pdf_bytes
from app.services.language.detector import detect_language
from app.services.sentiment.sentiment_analyzer import analyze_sentiment
from app.services.emotion.emotion_analyzer import analyze_emotion
from app.services.entities.entity_extractor import extract_named_entities
from app.services.entities.claim_analyzer import analyze_claims_and_attribution
from app.services.framing.framing_analyzer import analyze_bias_and_framing
from app.services.summarisation.summarizer import generate_extractive_summary
from app.services.event_extraction.event_profiler import extract_event_profile
from app.services.news_discovery.query_generator import generate_multilingual_search_queries
from app.services.news_discovery.discovery_service import discover_cross_language_news
from app.services.event_matching.verifier import evaluate_and_filter_candidates
from app.services.article_retrieval.retriever import retrieve_promising_candidates
from app.services.comparison.cross_comparator import compare_cross_language_framing
from app.services.reporting.stats_calculator import calculate_statistical_report
from app.services.reporting.pdf_generator import generate_pdf_report
from app.config import settings

router = APIRouter()

# In-memory session store for transient article/report states
_ARTICLE_STORE = {}

class AnalyzeArticleRequest(BaseModel):
    article: IngestedArticle
    language_override: Optional[str] = None

class CompareArticleRequest(BaseModel):
    article: IngestedArticle
    event_profile: EventProfile
    target_languages: List[str] = ["en", "hi", "kn", "te", "ta"]
    max_results_per_lang: int = 6

class CompareSelectedRequest(BaseModel):
    article: IngestedArticle
    selected_candidates: List[ArticleCandidate]
    base_language: Optional[str] = "en"

class EndToEndReportRequest(BaseModel):
    article: IngestedArticle
    target_languages: List[str] = ["en", "hi", "kn", "te", "ta"]

@router.get("/health")
async def health_check():
    """Health check reporting system configuration and supported languages."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "supported_languages": settings.SUPPORTED_LANGUAGES,
        "providers_enabled": {
            "google_news_rss": settings.GOOGLE_NEWS_ENABLED,
            "gdelt": settings.GDELT_ENABLED
        }
    }

@router.post("/articles/text", response_model=IngestedArticle)
async def ingest_text_endpoint(req: TextIngestRequest):
    """Ingests raw pasted text with Unicode preservation."""
    try:
        article = ingest_pasted_text(req.text, req.title)
        _ARTICLE_STORE[article.article_id] = article
        return article
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text ingestion error: {e}")

@router.post("/articles/url", response_model=IngestedArticle)
async def ingest_url_endpoint(req: UrlIngestRequest):
    """Safely ingests and parses a remote article from an HTTP/HTTPS URL with SSRF defense."""
    try:
        article = await ingest_url_article(req.url)
        _ARTICLE_STORE[article.article_id] = article
        return article
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL ingestion error: {e}")

@router.post("/articles/pdf", response_model=IngestedArticle)
async def ingest_pdf_endpoint(file: UploadFile = File(...)):
    """Ingests and parses selectable text from a PDF document using PyMuPDF."""
    try:
        content = await file.read()
        article = ingest_pdf_bytes(content, filename=file.filename or "uploaded.pdf")
        _ARTICLE_STORE[article.article_id] = article
        return article
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF ingestion error: {e}")

@router.post("/analyze/article")
async def analyze_article_endpoint(req: AnalyzeArticleRequest):
    """
    Executes the multilingual NLP pipeline:
    language detection, sentiment, emotion, entities, claims, framing analysis,
    summary, and structured event profile.
    """
    article = req.article
    text = article.text

    # 1. Language Detection
    lang = detect_language(text)
    if req.language_override and req.language_override in settings.SUPPORTED_LANGUAGES:
        lang.language_code = req.language_override

    # 2. Sentiment Analysis
    sentiment = analyze_sentiment(text, lang.language_code)

    # 3. Emotion Analysis
    emotion = analyze_emotion(text, lang.language_code)

    # 4. Named Entity Recognition
    entities = extract_named_entities(text, lang.language_code)

    # 5. Claim and Attribution Analysis
    claims = analyze_claims_and_attribution(text, lang.language_code)

    # 6. Explainable Bias and Framing Analysis
    framing = analyze_bias_and_framing(text, lang.language_code, entities)

    # 7. Summary
    summary = generate_extractive_summary(text, entities, lang.language_code)

    # 8. Event Profile
    title = article.metadata.title or "News Article"
    event_profile = extract_event_profile(title, text, lang.language_code, entities)

    # 9. Queries
    generated_queries = generate_multilingual_search_queries(
        event_profile, settings.SUPPORTED_LANGUAGES
    )

    return {
        "article_id": article.article_id,
        "language": lang,
        "sentiment": sentiment,
        "emotion": emotion,
        "entities": entities,
        "claims": claims,
        "framing": framing,
        "summary": summary,
        "event_profile": event_profile,
        "generated_queries": generated_queries
    }

@router.post("/compare/article")
async def compare_article_endpoint(req: CompareArticleRequest):
    """
    Performs cross-language discovery via Google News RSS and GDELT,
    executes multi-signal same-event verification, retrieves content for promising matches,
    and conducts side-by-side cross-language framing comparison.
    """
    target_langs = [l for l in req.target_languages if l in settings.SUPPORTED_LANGUAGES]
    if not target_langs:
        target_langs = settings.SUPPORTED_LANGUAGES

    # 1. News Discovery
    candidates, provider_reports, queries = await discover_cross_language_news(
        profile=req.event_profile,
        target_languages=target_langs,
        max_results_per_lang=req.max_results_per_lang
    )

    # 2. Same-Event Verification
    verified_candidates = evaluate_and_filter_candidates(candidates, req.event_profile)

    # 3. Promising Candidate Content Retrieval
    retrieved_candidates = await retrieve_promising_candidates(verified_candidates)

    # 4. Cross-Language Framing Comparison
    comparison = compare_cross_language_framing(
        base_article=req.article,
        base_language=req.event_profile.original_language,
        candidates=retrieved_candidates
    )

    return {
        "article_id": req.article.article_id,
        "provider_reports": provider_reports,
        "queries": queries,
        "candidates": retrieved_candidates,
        "comparison": comparison
    }

@router.post("/compare/selected")
async def compare_selected_endpoint(req: CompareSelectedRequest):
    """
    Executes cross-language framing comparison on a user-selected subset of candidates.
    Attempts content retrieval if needed and conducts side-by-side passage comparison.
    """
    if not req.selected_candidates:
        raise HTTPException(status_code=400, detail="At least one candidate article must be selected for comparison.")

    # Retrieve content for selected candidates if not already fetched
    retrieved_candidates = await retrieve_promising_candidates(req.selected_candidates)

    comparison = compare_cross_language_framing(
        base_article=req.article,
        base_language=req.base_language or "en",
        candidates=retrieved_candidates
    )

    return {
        "article_id": req.article.article_id,
        "selected_candidates_count": len(retrieved_candidates),
        "candidates": retrieved_candidates,
        "comparison": comparison
    }

@router.post("/reports/full", response_model=FullAnalysisReport)
async def generate_full_report_endpoint(req: EndToEndReportRequest):
    """
    Orchestrates end-to-end analysis, cross-language discovery, same-event verification,
    and statistical synthesis into a structured full report.
    """
    article = req.article
    text = article.text

    # NLP Analysis
    lang = detect_language(text)
    sentiment = analyze_sentiment(text, lang.language_code)
    emotion = analyze_emotion(text, lang.language_code)
    entities = extract_named_entities(text, lang.language_code)
    claims = analyze_claims_and_attribution(text, lang.language_code)
    framing = analyze_bias_and_framing(text, lang.language_code, entities)
    summary = generate_extractive_summary(text, entities, lang.language_code)
    
    title = article.metadata.title or "News Article"
    event_profile = extract_event_profile(title, text, lang.language_code, entities)
    queries = generate_multilingual_search_queries(event_profile, req.target_languages)

    # Discovery & Matching
    raw_candidates, provider_reports, _ = await discover_cross_language_news(
        profile=event_profile,
        target_languages=req.target_languages,
        max_results_per_lang=settings.MAX_SEARCH_RESULTS_PER_LANG
    )
    verified_cands = evaluate_and_filter_candidates(raw_candidates, event_profile)
    retrieved_cands = await retrieve_promising_candidates(verified_cands)
    comparison = compare_cross_language_framing(article, lang.language_code, retrieved_cands)

    # Statistics
    stats = calculate_statistical_report(
        article=article,
        sentiment=sentiment,
        emotion=emotion,
        entities=entities,
        claims=claims,
        framing=framing,
        candidates=retrieved_cands
    )

    methodology_summary = (
        "Multi-stage multilingual linguistic framing and event intelligence pipeline. Combines grounded "
        "character-offset pattern detection, multi-signal candidate verification (cross-lingual semantic similarity, "
        "entity overlap, and action concordance), and side-by-side passage comparison."
    )

    limitations = [
        "Linguistic framing observations reflect rhetorical choices in the original text, not journalistic intent or editorial bad faith.",
        "Sentiment analysis captures emotional valence and conflict-heavy news subject matter, which must not be equated with bias.",
        "Emotion classifications inside quotations are strictly attributed to the speaker, not the reporting journalist.",
        "Cross-language discovery relies on external provider indexing (Google News RSS & GDELT) which may exhibit language coverage variances."
    ]

    return FullAnalysisReport(
        report_id=f"rep_{article.article_id}",
        generated_at=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        article=article,
        language=lang,
        summary=summary,
        sentiment=sentiment,
        emotion=emotion,
        entities=entities,
        claims=claims,
        framing=framing,
        event_profile=event_profile,
        generated_queries=queries,
        provider_statuses=provider_reports,
        candidates=retrieved_cands,
        comparison=comparison,
        statistics=stats,
        methodology_summary=methodology_summary,
        limitations=limitations
    )

@router.post("/reports/pdf")
async def download_pdf_report_endpoint(report: FullAnalysisReport):
    """Renders and streams a professional, downloadable A4 PDF report."""
    try:
        pdf_bytes = generate_pdf_report(report)
        filename = f"framing_report_{report.article.article_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF rendering error: {e}")

