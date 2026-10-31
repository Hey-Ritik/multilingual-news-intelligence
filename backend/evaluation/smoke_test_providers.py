"""
Bounded Live-Provider Smoke Test.
Safely tests external network connectivity and response structure for
Google News RSS and GDELT without failing ordinary unit tests if offline.
"""
import asyncio
import sys
import os

# Ensure backend path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.news_discovery.google_news_rss import search_google_news_rss
from app.services.news_discovery.gdelt_adapter import search_gdelt_api

async def run_live_smoke_test():
    print("=" * 65)
    print("RUNNING BOUNDED LIVE PROVIDER SMOKE TEST")
    print("=" * 65)

    test_query = "India Space Mission"
    print(f"Query: '{test_query}' | Language: 'en'\n")

    # 1. Test Google News RSS
    print("--> Probing Google News RSS...")
    gn_cands, gn_report = await search_google_news_rss(
        query=test_query, language_code="en", max_results=3, timeout_seconds=6.0
    )
    print(f"    State: {gn_report.state.value}")
    print(f"    Count: {gn_report.result_count}")
    print(f"    Message: {gn_report.message}")
    if gn_cands:
        print(f"    Sample Headline: {gn_cands[0].title[:60]}... ({gn_cands[0].publisher})")

    print("\n--> Probing GDELT 2.0 Doc API...")
    # 2. Test GDELT
    gd_cands, gd_report = await search_gdelt_api(
        query=test_query, language_code="en", max_results=3, timeout_seconds=6.0
    )
    print(f"    State: {gd_report.state.value}")
    print(f"    Count: {gd_report.result_count}")
    print(f"    Message: {gd_report.message}")
    if gd_cands:
        print(f"    Sample Headline: {gd_cands[0].title[:60]}... ({gd_cands[0].publisher})")

    print("\nSmoke test probe finished cleanly.")

if __name__ == "__main__":
    def run_sync(coro):
        try:
            coro.send(None)
        except StopIteration:
            pass

    # Use asyncio.run if available or direct
    try:
        asyncio.run(run_live_smoke_test())
    except Exception as e:
        print(f"Network restricted in current environment: {e}")

