import asyncio
from typing import List
from app.schemas.discovery import ArticleCandidate, RetrievalStatus, CandidateOutcome
from app.services.ingestion.url_ingest import ingest_url_article

async def retrieve_candidate_content(candidate: ArticleCandidate) -> ArticleCandidate:
    """
    Safely retrieves the full article body for a promising candidate using SSRF-protected ingestion.
    Accurately classifies retrieval outcome without misrepresenting snippets as full text.
    """
    if not candidate.url:
        candidate.retrieval_status = RetrievalStatus.METADATA_ONLY
        candidate.retrieval_error = "Candidate record has no URL."
        return candidate

    try:
        ingested = await ingest_url_article(candidate.url)
        text = ingested.text
        if len(text) > 400:
            candidate.retrieval_status = RetrievalStatus.FULL_TEXT_RETRIEVED
            candidate.retrieved_text = text
            if ingested.metadata.publisher:
                candidate.publisher = ingested.metadata.publisher
        elif len(text) > 100:
            candidate.retrieval_status = RetrievalStatus.PARTIAL_TEXT_RETRIEVED
            candidate.retrieved_text = text
        else:
            candidate.retrieval_status = RetrievalStatus.SNIPPET_ONLY
            candidate.retrieved_text = candidate.snippet
            candidate.retrieval_error = "Retrieved content was under 100 characters; defaulted to discovery snippet."

    except Exception as e:
        candidate.retrieval_status = RetrievalStatus.RETRIEVAL_FAILED
        candidate.retrieval_error = str(e)
        candidate.retrieved_text = None

    return candidate

async def retrieve_promising_candidates(
    candidates: List[ArticleCandidate],
    max_to_fetch: int = 4
) -> List[ArticleCandidate]:
    """
    Fetches full content concurrently for VERIFIED and LIKELY same-event candidates.
    Bounded concurrency prevents rate-limiting and hangs.
    """
    promising = [
        c for c in candidates 
        if c.outcome in (CandidateOutcome.VERIFIED_SAME_EVENT, CandidateOutcome.LIKELY_SAME_EVENT)
    ][:max_to_fetch]

    tasks = [retrieve_candidate_content(cand) for cand in promising]
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)

    return candidates

