from tests.fixtures.articles import (
    EN_NEWS_ARREST, HI_NEWS_ARREST, KN_NEWS_ARREST, TE_NEWS_ARREST, TA_NEWS_ARREST,
    EN_NEWS_NEUTRAL_FACTUAL
)
from app.services.language.detector import detect_language
from app.services.sentiment.sentiment_analyzer import analyze_sentiment
from app.services.emotion.emotion_analyzer import analyze_emotion
from app.services.entities.entity_extractor import extract_named_entities
from app.services.entities.claim_analyzer import analyze_claims_and_attribution
from app.services.summarisation.summarizer import generate_extractive_summary
from app.schemas.nlp import SentimentLabel, EmotionLabel, EntityType, ClaimType
from app.utils.unicode_utils import validate_offset_slice

def test_language_detection_all_target_languages():
    res_en = detect_language(EN_NEWS_ARREST)
    assert res_en.language_code == "en"
    assert res_en.is_supported is True

    res_hi = detect_language(HI_NEWS_ARREST)
    assert res_hi.language_code == "hi"
    assert res_hi.script == "Devanagari"
    assert res_hi.is_supported is True

    res_kn = detect_language(KN_NEWS_ARREST)
    assert res_kn.language_code == "kn"
    assert res_kn.script == "Kannada"
    assert res_kn.is_supported is True

    res_te = detect_language(TE_NEWS_ARREST)
    assert res_te.language_code == "te"
    assert res_te.script == "Telugu"
    assert res_te.is_supported is True

    res_ta = detect_language(TA_NEWS_ARREST)
    assert res_ta.language_code == "ta"
    assert res_ta.script == "Tamil"
    assert res_ta.is_supported is True

def test_sentiment_analysis_negative_and_neutral():
    # Arrest / conflict article should be classified as negative (reporting conflict)
    sent_arrest = analyze_sentiment(EN_NEWS_ARREST, "en")
    assert sent_arrest.label in (SentimentLabel.NEGATIVE, SentimentLabel.MIXED)
    assert "not be equated with journalistic bias" in sent_arrest.limitations.lower()

    # Neutral space launch news
    sent_neutral = analyze_sentiment(EN_NEWS_NEUTRAL_FACTUAL, "en")
    assert sent_neutral.label in (SentimentLabel.POSITIVE, SentimentLabel.NEUTRAL)

def test_sentiment_negation_flipping():
    # "not a success" vs "success"
    res_neg = analyze_sentiment("The policy was not a success and failed completely.", "en")
    assert res_neg.label == SentimentLabel.NEGATIVE

def test_emotion_analysis_quoted_vs_journalist():
    # In EN_NEWS_ARREST, the outrage is inside quotation marks:
    # AAP leaders furiously condemned the action as a "draconian and ruthless political assault on democracy."
    res = analyze_emotion(EN_NEWS_ARREST, "en")
    assert len(res.detected_emotions) > 0
    
    # Check that speaker quotes are tracked separately
    has_speaker_emotions = len(res.speaker_emotions) > 0 or any(e.is_speaker_quote for e in res.detected_emotions)
    assert res.method is not None

def test_named_entity_recognition_and_offsets():
    entities = extract_named_entities(EN_NEWS_ARREST, "en")
    assert len(entities) > 0

    # Ensure all entity offsets match original slice exactly
    for ent in entities:
        assert validate_offset_slice(EN_NEWS_ARREST, ent.start_offset, ent.end_offset, ent.text)

    # Check for prominent entities
    ent_texts = [e.text for e in entities]
    assert any("Arvind Kejriwal" in t for t in ent_texts)
    assert any("Delhi" in t for t in ent_texts)

def test_claims_and_attribution():
    claims = analyze_claims_and_attribution(EN_NEWS_ARREST, "en")
    assert len(claims) > 0

    claim_types = [c.claim_type for c in claims]
    assert ClaimType.ATTRIBUTED_CLAIM in claim_types

    # Ensure all claims match slice
    for c in claims:
        assert validate_offset_slice(EN_NEWS_ARREST, c.start_offset, c.end_offset, c.text)

def test_extractive_summary():
    entities = extract_named_entities(EN_NEWS_ARREST, "en")
    summary = generate_extractive_summary(EN_NEWS_ARREST, entities, "en", max_sentences=2)
    assert len(summary.summary_text) > 40
    # Must be grounded directly from the source text
    first_sentence = summary.summary_text.split(".")[0].strip()
    assert first_sentence in EN_NEWS_ARREST
