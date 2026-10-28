import asyncio
from typing import List, Tuple
from app.schemas.event import EventProfile, LanguageQuery
from app.schemas.discovery import ArticleCandidate, ProviderStatusReport, ProviderState
from app.services.news_discovery.query_generator import generate_multilingual_search_queries
from app.services.news_discovery.google_news_rss import search_google_news_rss
from app.services.news_discovery.gdelt_adapter import search_gdelt_api

async def discover_cross_language_news(
    profile: EventProfile,
    target_languages: List[str],
    max_results_per_lang: int = 6
) -> Tuple[List[ArticleCandidate], List[ProviderStatusReport], List[LanguageQuery]]:
    """
    Executes cross-language news discovery across Google News RSS and GDELT.
    Providers are executed independently so failure or timeout in one does not block or drop the other.
    """
    language_queries = generate_multilingual_search_queries(profile, target_languages)
    all_candidates: List[ArticleCandidate] = []
    status_reports: List[ProviderStatusReport] = []

    tasks = []
    task_metadata = []

    for lq in language_queries:
        lang = lq.language_code
        primary_query = lq.queries[0] if lq.queries else profile.headline

        # Google News task
        tasks.append(search_google_news_rss(primary_query, lang, max_results=max_results_per_lang))
        task_metadata.append(("Google News RSS", lang))

        # GDELT task
        tasks.append(search_gdelt_api(primary_query, lang, max_results=max_results_per_lang))
        task_metadata.append(("GDELT", lang))

    # Execute all concurrently
    responses = await asyncio.gather(*tasks, return_exceptions=True)

    seen_urls = set()
    for idx, resp in enumerate(responses):
        prov_name, lang = task_metadata[idx]
        if isinstance(resp, Exception):
            status_reports.append(ProviderStatusReport(
                provider_name=prov_name,
                language=lang,
                state=ProviderState.PROVIDER_ERROR,
                result_count=0,
                message=f"Execution error: {resp}"
            ))
            continue

        candidates, report = resp
        status_reports.append(report)

        for cand in candidates:
            if cand.url and cand.url not in seen_urls:
                seen_urls.add(cand.url)
                all_candidates.append(cand)

    return all_candidates, status_reports, language_queries

