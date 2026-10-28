import urllib.parse
import uuid
from typing import List, Tuple
import httpx
from app.schemas.discovery import ArticleCandidate, ProviderState, ProviderStatusReport, RetrievalStatus, CandidateOutcome
from app.utils.html_sanitizer import clean_html_text

GDELT_LANG_FILTERS = {
    "en": "sourcelang:eng",
    "hi": "sourcelang:hin",
    "kn": "sourcelang:kan",
    "te": "sourcelang:tel",
    "ta": "sourcelang:tam"
}

async def search_gdelt_api(
    query: str,
    language_code: str,
    max_results: int = 6,
    timeout_seconds: float = 8.0
) -> Tuple[List[ArticleCandidate], ProviderStatusReport]:
    """
    Queries the GDELT 2.0 Doc API with language filters.
    Parses JSON responses, maps metadata, and handles provider timeouts safely.
    """
    lang_filter = GDELT_LANG_FILTERS.get(language_code, "sourcelang:eng")
    full_query = f"{query} {lang_filter}"
    encoded_query = urllib.parse.quote(full_query)
    
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={encoded_query}&mode=artlist&format=json&maxrecords={max_results}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MultilingualNewsDiscovery/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                return [], ProviderStatusReport(
                    provider_name="GDELT 2.0 Doc API",
                    language=language_code,
                    state=ProviderState.PROVIDER_ERROR,
                    result_count=0,
                    message=f"GDELT returned HTTP status {resp.status_code}."
                )

            data = resp.json()
            articles = data.get("articles", [])
            candidates: List[ArticleCandidate] = []

            for art in articles[:max_results]:
                title = clean_html_text(art.get("title", ""))
                link = art.get("url", "")
                seendate = art.get("seendate", "")
                domain = clean_html_text(art.get("domain", "Online Source"))

                if not title:
                    continue

                candidate = ArticleCandidate(
                    candidate_id=f"gd_{uuid.uuid4().hex[:10]}",
                    title=title,
                    url=link,
                    publisher=domain,
                    publish_date=seendate,
                    language=language_code,
                    snippet=f"Discovered via GDELT from domain {domain}",
                    discovery_provider="GDELT",
                    discovery_query=query,
                    outcome=CandidateOutcome.INSUFFICIENT_EVIDENCE,
                    outcome_reasoning="Discovered via GDELT; pending same-event cross-language verification.",
                    similarity_score=0.0,
                    entity_overlap_score=0.0,
                    retrieval_status=RetrievalStatus.METADATA_ONLY
                )
                candidates.append(candidate)

            state = ProviderState.SUCCESS_WITH_RESULTS if candidates else ProviderState.SUCCESS_NO_RESULTS
            return candidates, ProviderStatusReport(
                provider_name="GDELT",
                language=language_code,
                state=state,
                result_count=len(candidates),
                message=f"Discovered {len(candidates)} records from GDELT."
            )

    except httpx.TimeoutException:
        return [], ProviderStatusReport(
            provider_name="GDELT",
            language=language_code,
            state=ProviderState.TIMEOUT,
            result_count=0,
            message=f"GDELT request timed out after {timeout_seconds}s."
        )
    except Exception as e:
        return [], ProviderStatusReport(
            provider_name="GDELT",
            language=language_code,
            state=ProviderState.PROVIDER_ERROR,
            result_count=0,
            message=f"GDELT connection or response error: {e}"
        )

