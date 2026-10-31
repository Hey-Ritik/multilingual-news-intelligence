import pytest
from tests.fixtures.articles import (
    EN_NEWS_ARREST, HI_NEWS_ARREST, EN_NEWS_SAME_ACTOR_DIFFERENT_EVENT, EN_NEWS_NEUTRAL_FACTUAL
)
from app.services.entities.entity_extractor import extract_named_entities
from app.services.event_extraction.event_profiler import extract_event_profile
from app.services.news_discovery.query_generator import generate_multilingual_search_queries
from app.services.event_matching.verifier import verify_candidate_same_event
from app.services.comparison.cross_comparator import compare_cross_language_framing
from app.schemas.discovery import ArticleCandidate, CandidateOutcome, RetrievalStatus
from app.schemas.article import IngestedArticle, ArticleMetadata, ExtractionStatus
from app.utils.html_sanitizer import clean_html_text

@pytest.fixture
def source_event_profile():
    entities = extract_named_entities(EN_NEWS_ARREST, "en")
    headline = "Enforcement Directorate arrests Delhi Chief Minister Arvind Kejriwal in excise case"
    return extract_event_profile(headline, EN_NEWS_ARREST, "en", entities)

def test_event_profiler_and_query_generation(source_event_profile):
    profile = source_event_profile
    assert "arrest" in profile.main_action.lower()
    assert any("Arvind Kejriwal" in a for a in profile.principal_actors)

    queries = generate_multilingual_search_queries(profile, ["en", "hi", "kn", "te", "ta"])
    assert len(queries) == 5

    # Check that Hindi query contains Hindi action verb or actor
    hi_q = next(q for q in queries if q.language_code == "hi")
    assert len(hi_q.queries) > 0
    assert any("गिरफ्तार" in q or "Arvind Kejriwal" in q for q in hi_q.queries)

# --------------------------------------------------------------------------
# CRITICAL BUG 1 TESTS: False Positive Elimination for Different Events
# --------------------------------------------------------------------------

def test_false_positive_rejection_chole_stabbing(source_event_profile):
    """Test A: Sharing location 'Delhi' and generic action 'arrested/stabbed' must NOT match."""
    cand = ArticleCandidate(
        candidate_id="cand_chole",
        title="Driver stabbed over extra chole in Delhi, accused arrested",
        url="https://example.com/delhi-chole-stabbing",
        publisher="Delhi Crime Watch",
        language="en",
        snippet="A 28-year-old auto driver was stabbed following an argument over extra chole bhature in northwest Delhi. Police have arrested one person.",
        discovery_provider="Google News RSS",
        discovery_query="arrest Delhi"
    )
    outcome, sim, ent, explanation = verify_candidate_same_event(cand, source_event_profile)
    assert outcome == CandidateOutcome.DIFFERENT_EVENT
    assert "conflicting incident" in explanation.lower() or "different" in explanation.lower()

def test_false_positive_rejection_cyber_fraud(source_event_profile):
    """Test B: Cyber-fraud arrests in Delhi must be classified as DIFFERENT_EVENT."""
    cand = ArticleCandidate(
        candidate_id="cand_cyber",
        title="Delhi Police arrests 5 for nationwide cyber-fraud syndicate",
        url="https://example.com/delhi-cyber-arrests",
        publisher="National Express",
        language="en",
        snippet="Special cell of Delhi Police busted an inter-state cyber fraud gang operating fake bank portals and arrested five individuals.",
        discovery_provider="GDELT",
        discovery_query="Delhi police arrest"
    )
    outcome, sim, ent, explanation = verify_candidate_same_event(cand, source_event_profile)
    assert outcome == CandidateOutcome.DIFFERENT_EVENT
    assert "conflicting incident" in explanation.lower() or "different" in explanation.lower()

def test_false_positive_rejection_heroin_narcotics(source_event_profile):
    """Test C: Student heroin arrest in Delhi must be classified as DIFFERENT_EVENT."""
    cand = ArticleCandidate(
        candidate_id="cand_heroin",
        title="College student arrested with 500g heroin in North Delhi",
        url="https://example.com/delhi-drugs-arrest",
        publisher="City Chronicle",
        language="en",
        snippet="A final year university student was arrested near North Campus with 500 grams of commercial grade heroin, police said on Friday.",
        discovery_provider="Google News RSS",
        discovery_query="student arrested Delhi"
    )
    outcome, sim, ent, explanation = verify_candidate_same_event(cand, source_event_profile)
    assert outcome == CandidateOutcome.DIFFERENT_EVENT
    assert "conflicting incident" in explanation.lower() or "different" in explanation.lower()

# --------------------------------------------------------------------------
# CRITICAL BUG 1 TESTS: True Positives across English, Hindi, Indic Languages
# --------------------------------------------------------------------------

def test_true_positive_hindi_kejriwal_arrest(source_event_profile):
    """Test D: Legitimate Hindi coverage of Kejriwal excise arrest must be VERIFIED_SAME_EVENT."""
    cand = ArticleCandidate(
        candidate_id="cand_hi_kejriwal",
        title="प्रवर्तन निदेशालय ने दिल्ली आबकारी नीति मामले में मुख्यमंत्री अरविंद केजरीवाल को गिरफ्तार किया",
        url="https://example.com/hindi-kejriwal-arrest",
        publisher="Dainik Jagran",
        language="hi",
        snippet="शराब नीति घोटाले में ईडी ने दिल्ली के मुख्यमंत्री अरविंद केजरीवाल के आवास पर तलाशी के बाद उन्हें गिरफ्तार कर लिया।",
        discovery_provider="Google News RSS",
        discovery_query="अरविंद केजरीवाल गिरफ्तार आबकारी"
    )
    outcome, sim, ent, explanation = verify_candidate_same_event(cand, source_event_profile)
    assert outcome == CandidateOutcome.VERIFIED_SAME_EVENT
    assert "verified" in explanation.lower()
    assert "actor" in explanation.lower() or "kejriwal" in explanation.lower()

def test_true_positive_vernacular_languages(source_event_profile):
    """Test E: Legitimate Kannada, Telugu, and Tamil coverage must be recognized."""
    # Kannada
    cand_kn = ArticleCandidate(
        candidate_id="cand_kn_1",
        title="ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಪ್ರಕರಣದಲ್ಲಿ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಇಡಿ ಬಂಧಿಸಿದೆ",
        url="https://example.com/kannada-kejriwal",
        publisher="Prajavani",
        language="kn",
        snippet="ದೆಹಲಿಯ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಅಬಕಾರಿ ಹಗರಣದಲ್ಲಿ ಬಂಧಿಸಿದೆ.",
        discovery_provider="Google News RSS",
        discovery_query="ಅರವಿಂದ ಕೇಜ್ರಿವಾಲ್ ಬಂಧನ"
    )
    outcome_kn, _, _, exp_kn = verify_candidate_same_event(cand_kn, source_event_profile)
    assert outcome_kn in (CandidateOutcome.VERIFIED_SAME_EVENT, CandidateOutcome.POSSIBLE_MATCH)

    # Telugu
    cand_te = ArticleCandidate(
        candidate_id="cand_te_1",
        title="ఢిల్లీ లిక్కర్ పాలసీ కేసులో సీఎం అరవింద్ కేజ్రీవాల్‌ను అరెస్ట్ చేసిన ఈడీ",
        url="https://example.com/telugu-kejriwal",
        publisher="Eenadu",
        language="te",
        snippet="మద్యం పాలసీ కేసు విచారణ అనంతరం ఢిల్లీ ముఖ్యమంత్రి అరవింద్ కేజ్రీవాల్‌ను ఈడీ అధికారులు అదుపులోకి తీసుకున్నారు.",
        discovery_provider="Google News RSS",
        discovery_query="అరవింద్ కేజ్రీవాల్ అరెస్ట్"
    )
    outcome_te, _, _, exp_te = verify_candidate_same_event(cand_te, source_event_profile)
    assert outcome_te in (CandidateOutcome.VERIFIED_SAME_EVENT, CandidateOutcome.POSSIBLE_MATCH)

    # Tamil
    cand_ta = ArticleCandidate(
        candidate_id="cand_ta_1",
        title="தில்லி மதுபான கொள்கை வழக்கில் முதல்வர் அரவிந்த் கெஜ்ரிவாலை கைது செய்தது அமலாக்கத்துறை",
        url="https://example.com/tamil-kejriwal",
        publisher="Dinamalar",
        language="ta",
        snippet="தில்லி மதுபான ஊழல் வழக்கில் முதல்வர் அரவிந்த் கெஜ்ரிவாலை அமலாக்கத்துறை அதிகாரிகள் கைது செய்துள்ளனர்.",
        discovery_provider="Google News RSS",
        discovery_query="அரவிந்த் கெஜ்ரிவால் கைது"
    )
    outcome_ta, _, _, exp_ta = verify_candidate_same_event(cand_ta, source_event_profile)
    assert outcome_ta in (CandidateOutcome.VERIFIED_SAME_EVENT, CandidateOutcome.POSSIBLE_MATCH)

def test_same_actor_different_event_is_related_topic(source_event_profile):
    """Test F: Same actor (Arvind Kejriwal) announcing solar policy must be RELATED_TOPIC, NOT same event."""
    cand = ArticleCandidate(
        candidate_id="cand_solar",
        title="Arvind Kejriwal launches new solar energy policy for households in Delhi",
        url="https://example.com/kejriwal-solar",
        publisher="Delhi News",
        language="en",
        snippet="Chief Minister Arvind Kejriwal announced zero power bills under a new rooftop solar scheme in Delhi.",
        discovery_provider="Google News RSS",
        discovery_query="Arvind Kejriwal Delhi"
    )
    outcome, sim, ent, explanation = verify_candidate_same_event(cand, source_event_profile)
    assert outcome == CandidateOutcome.RELATED_TOPIC
    assert "different news story" in explanation.lower() or "action" in explanation.lower()

# --------------------------------------------------------------------------
# CRITICAL BUG 4 TESTS: Raw HTML Tag and Entity Stripping
# --------------------------------------------------------------------------

def test_html_sanitizer_unescapes_entities_and_removes_tags():
    raw_snippet = "AAP chief &amp; Delhi CM Arvind Kejriwal arrested by <b>Enforcement Directorate</b> &#39;after hours of questioning&#39; &quot;in liquor policy case&quot; <font color=\"#777\">more details</font>"
    cleaned = clean_html_text(raw_snippet)
    assert "<b>" not in cleaned
    assert "</b>" not in cleaned
    assert "<font" not in cleaned
    assert "&amp;" not in cleaned
    assert "&#39;" not in cleaned
    assert "&quot;" not in cleaned
    assert "AAP chief & Delhi CM Arvind Kejriwal arrested by Enforcement Directorate 'after hours of questioning' \"in liquor policy case\" more details" == cleaned

# --------------------------------------------------------------------------
# CRITICAL BUG 2 TESTS: Cross-Language Framing Comparison Generation
# --------------------------------------------------------------------------

def test_cross_language_framing_comparison():
    base_art = IngestedArticle(
        article_id="art_en",
        text=EN_NEWS_ARREST,
        metadata=ArticleMetadata(
            title="ED arrests Delhi Chief Minister Arvind Kejriwal",
            publisher="National Daily",
            word_count=120,
            sentence_count=4
        ),
        status=ExtractionStatus.FULL
    )

    matched_candidate = ArticleCandidate(
        candidate_id="cand_hi_1",
        title="शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार",
        url="https://example.com/hi-news",
        publisher="Hindi Khabar",
        language="hi",
        snippet="ईडी ने पूछताछ के बाद अरविंद केजरीवाल को गिरफ्तार किया।",
        discovery_provider="Google News RSS",
        discovery_query="Arvind Kejriwal गिरफ्तार",
        outcome=CandidateOutcome.VERIFIED_SAME_EVENT,
        retrieval_status=RetrievalStatus.FULL_TEXT_RETRIEVED,
        retrieved_text=HI_NEWS_ARREST
    )

    result = compare_cross_language_framing(base_art, "en", [matched_candidate])
    assert result is not None
    assert len(result.comparisons) > 0
    assert result.compared_candidates_count == 1

    first_diff = result.comparisons[0]
    assert first_diff.article_a_title == "ED arrests Delhi Chief Minister Arvind Kejriwal"
    assert first_diff.article_b_title == "शराब नीति मामले में अरविंद केजरीवाल गिरफ्तार"
    assert first_diff.what_differs
    assert first_diff.why_it_matters
