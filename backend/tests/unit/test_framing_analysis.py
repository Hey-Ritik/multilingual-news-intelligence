import pytest
from tests.fixtures.articles import (
    EN_NEWS_ARREST,
    HI_NEWS_ARREST,
    KN_NEWS_ARREST,
    TE_NEWS_ARREST,
    TA_NEWS_ARREST,
    EN_NEWS_NEUTRAL_FACTUAL
)
from app.services.framing.framing_analyzer import analyze_bias_and_framing
from app.services.entities.entity_extractor import extract_named_entities
from app.schemas.framing import (
    FramingCategory,
    BiasVerdict,
    AttributionType,
    PortrayalDirection
)
from app.utils.unicode_utils import validate_offset_slice

def test_framing_loaded_words_and_exact_offsets():
    entities = extract_named_entities(EN_NEWS_ARREST, "en")
    result = analyze_bias_and_framing(EN_NEWS_ARREST, "en", entities)

    assert len(result.findings) > 0
    categories = [f.category for f in result.findings]

    # Verify loaded language was detected
    assert FramingCategory.LOADED_LANGUAGE in categories

    # Strict Unicode code-point offset validation on every finding
    for finding in result.findings:
        assert validate_offset_slice(
            EN_NEWS_ARREST, finding.start_offset, finding.end_offset, finding.exact_text
        ), f"Offset mismatch for finding: {finding.exact_text} at [{finding.start_offset}:{finding.end_offset}]"

        # Verify explainability fields
        assert finding.explanation
        assert finding.potential_effect
        assert finding.alternative_interpretation
        assert finding.evidence_strength in ("low", "medium", "high")
        assert finding.confidence_score > 0.0
        assert "uncalibrated" in finding.confidence_label

def test_framing_hindi_language():
    entities = extract_named_entities(HI_NEWS_ARREST, "hi")
    result = analyze_bias_and_framing(HI_NEWS_ARREST, "hi", entities)

    assert len(result.findings) > 0
    for finding in result.findings:
        assert validate_offset_slice(
            HI_NEWS_ARREST, finding.start_offset, finding.end_offset, finding.exact_text
        )

def test_framing_assessment_and_limitations():
    entities = extract_named_entities(EN_NEWS_ARREST, "en")
    result = analyze_bias_and_framing(EN_NEWS_ARREST, "en", entities)

    assert result.density_per_1000_tokens > 0
    assert "editorial bad faith" in result.unsupported_conclusions_note
    assert "investigative reporting" in result.unsupported_conclusions_note.lower()

# ---------------------------------------------------------------------------
# MAJOR UPGRADE TESTS: 3 Verdict States, Quotation De-nesting, Psychology
# ---------------------------------------------------------------------------

def test_verdict_potential_bias_detected_with_quotation_attribution():
    """Case 1: Political arrest article with loaded quotes ('draconian', 'ruthless')."""
    entities = extract_named_entities(EN_NEWS_ARREST, "en")
    result = analyze_bias_and_framing(EN_NEWS_ARREST, "en", entities)

    # 1. Prominent Verdict must be POTENTIAL BIAS DETECTED
    assert result.verdict == BiasVerdict.POTENTIAL_BIAS_DETECTED
    assert result.verdict_confidence >= 0.70
    assert "System confidence score (uncalibrated)" in result.verdict_confidence_label

    # 2. Quotation attribution de-nesting: "draconian and ruthless" is in quotes
    draconian_finding = next((f for f in result.findings if "draconian" in f.exact_text.lower()), None)
    assert draconian_finding is not None
    assert draconian_finding.attribution == AttributionType.QUOTED_SPEAKER
    assert "quoted" in draconian_finding.attribution_details.lower()

    # 3. Entity Impact: AAP and Kejriwal or Government portrayed
    assert len(result.entity_impacts) > 0
    assert any(e.direction in (PortrayalDirection.NEGATIVE, PortrayalDirection.MIXED) for e in result.entity_impacts)

    # 4. Psychological Framing: Threat framing or Moral Foundations extracted
    assert len(result.psychological_framings) > 0
    first_psy = result.psychological_framings[0]
    assert first_psy.framework_name
    assert "does not establish psychological diagnosis" in first_psy.analytical_caveat

def test_verdict_no_clear_bias_detected_neutral_factual():
    """Case 2: ISRO meteorological satellite news article must return NO CLEAR BIAS DETECTED."""
    entities = extract_named_entities(EN_NEWS_NEUTRAL_FACTUAL, "en")
    result = analyze_bias_and_framing(EN_NEWS_NEUTRAL_FACTUAL, "en", entities)

    assert result.verdict == BiasVerdict.NO_CLEAR_BIAS_DETECTED
    assert result.verdict_confidence >= 0.65
    assert "System confidence score (uncalibrated)" in result.verdict_confidence_label
    assert "predominantly neutral" in result.article_level_assessment.lower() or "no clear bias" in result.verdict_summary.lower()

    # Neutrality checks must be populated and show NO_BIAS_INDICATORS_FOUND
    assert len(result.neutrality_checks) >= 4
    assert any(c.status == "NO_BIAS_INDICATORS_FOUND" for c in result.neutrality_checks)
    assert len(result.what_was_examined) >= 4
    assert "absence of detected indicators does not guarantee absolute neutrality" in [l.lower() for l in result.system_limitations][1]

def test_verdict_insufficient_evidence():
    """Case 3: Text that is too brief (< 30 words) must return INSUFFICIENT EVIDENCE."""
    short_text = "Delhi Police arrested one individual yesterday."
    entities = extract_named_entities(short_text, "en")
    result = analyze_bias_and_framing(short_text, "en", entities)

    assert result.verdict == BiasVerdict.INSUFFICIENT_EVIDENCE
    assert result.verdict_confidence == 0.90
    assert "insufficient" in result.verdict_summary.lower()
    assert len(result.findings) == 0
    assert result.neutrality_checks[0].status == "NOT_ASSESSABLE"

def test_multilingual_dravidian_languages_framing():
    """Case 4: Verified detection in Kannada, Telugu, and Tamil."""
    # Kannada
    kn_entities = extract_named_entities(KN_NEWS_ARREST, "kn")
    kn_res = analyze_bias_and_framing(KN_NEWS_ARREST, "kn", kn_entities)
    assert kn_res.verdict == BiasVerdict.POTENTIAL_BIAS_DETECTED
    assert any("ಸರ್ವಾಧಿಕಾರಿ" in f.exact_text for f in kn_res.findings)

    # Telugu
    te_entities = extract_named_entities(TE_NEWS_ARREST, "te")
    te_res = analyze_bias_and_framing(TE_NEWS_ARREST, "te", te_entities)
    assert te_res.verdict == BiasVerdict.POTENTIAL_BIAS_DETECTED
    assert any("నిరంకుశ" in f.exact_text for f in te_res.findings)

    # Tamil
    ta_entities = extract_named_entities(TA_NEWS_ARREST, "ta")
    ta_res = analyze_bias_and_framing(TA_NEWS_ARREST, "ta", ta_entities)
    assert ta_res.verdict == BiasVerdict.POTENTIAL_BIAS_DETECTED
    assert any("சர்வாதிகார" in f.exact_text for f in ta_res.findings)
