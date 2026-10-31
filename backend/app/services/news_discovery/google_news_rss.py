import urllib.parse
import uuid
from typing import List, Tuple
import httpx
import feedparser
from app.schemas.discovery import ArticleCandidate, ProviderState, ProviderStatusReport, RetrievalStatus, CandidateOutcome
from app.utils.html_sanitizer import clean_html_text

LANGUAGE_PARAMS = {
    "en": {"hl": "en-IN", "gl": "IN", "ceid": "IN:en"},
    "hi": {"hl": "hi", "gl": "IN", "ceid": "IN:hi"},
    "kn": {"hl": "kn", "gl": "IN", "ceid": "IN:kn"},
    "te": {"hl": "te", "gl": "IN", "ceid": "IN:te"},
    "ta": {"hl": "ta", "gl": "IN", "ceid": "IN:ta"}
}

async def search_google_news_rss(
    query: str,
    language_code: str,
    max_results: int = 6,
    timeout_seconds: float = 8.0
) -> Tuple[List[ArticleCandidate], ProviderStatusReport]:
    """
    Queries Google News RSS using language-specific regional endpoints.
    Parses RSS feeds, extracts title, publisher, publication date, and URLs.
    Handles timeouts, encoding, and deduplication.
    """
    params = LANGUAGE_PARAMS.get(language_code, {"hl": "en-IN", "gl": "IN", "ceid": "IN:en"})
    encoded_query = urllib.parse.quote(query)
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl={params['hl']}&gl={params['gl']}&ceid={params['ceid']}"

    candidates: List[ArticleCandidate] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MultilingualNewsDiscovery/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            resp = await client.get(rss_url, headers=headers)
            if resp.status_code != 200:
                return [], ProviderStatusReport(
                    provider_name="Google News RSS",
                    language=language_code,
                    state=ProviderState.PROVIDER_ERROR,
                    result_count=0,
                    message=f"HTTP {resp.status_code} returned by Google News RSS."
                )

            feed = feedparser.parse(resp.text)
            seen_titles = set()

            for entry in feed.entries[:max_results]:
                title = entry.get("title", "")
                link = entry.get("link", "")
                pub_date = entry.get("published", "")
                
                # Google News titles usually have format: "Headline - Publisher"
                publisher = None
                raw_title = clean_html_text(title)
                clean_title = raw_title
                if " - " in raw_title:
                    parts = raw_title.rsplit(" - ", 1)
                    clean_title = parts[0].strip()
                    publisher = parts[1].strip()

                clean_title = clean_html_text(clean_title)
                clean_snippet = clean_html_text(entry.get("summary", ""))

                if clean_title.lower() in seen_titles or not clean_title:
                    continue
                seen_titles.add(clean_title.lower())

                candidate = ArticleCandidate(
                    candidate_id=f"gn_{uuid.uuid4().hex[:10]}",
                    title=clean_title,
                    url=link,
                    publisher=clean_html_text(publisher) or "News Source",
                    publish_date=pub_date,
                    language=language_code,
                    snippet=clean_snippet,
                    discovery_provider="Google News RSS",
                    discovery_query=query,
                    outcome=CandidateOutcome.INSUFFICIENT_EVIDENCE,
                    outcome_reasoning="Discovered via Google News RSS; awaiting multi-signal same-event verification.",
                    similarity_score=0.0,
                    entity_overlap_score=0.0,
                    retrieval_status=RetrievalStatus.METADATA_ONLY
                )
                candidates.append(candidate)

            state = ProviderState.SUCCESS_WITH_RESULTS if candidates else ProviderState.SUCCESS_NO_RESULTS
            return candidates, ProviderStatusReport(
                provider_name="Google News RSS",
                language=language_code,
                state=state,
                result_count=len(candidates),
                message=f"Discovered {len(candidates)} candidate articles for language '{language_code}'."
            )

    except httpx.TimeoutException:
        return [], ProviderStatusReport(
            provider_name="Google News RSS",
            language=language_code,
            state=ProviderState.TIMEOUT,
            result_count=0,
            message=f"Request to Google News RSS timed out after {timeout_seconds}s."
        )
    except Exception as e:
        return [], ProviderStatusReport(
            provider_name="Google News RSS",
            language=language_code,
            state=ProviderState.PROVIDER_ERROR,
            result_count=0,
            message=f"Google News RSS network or parsing error: {e}"
        )

