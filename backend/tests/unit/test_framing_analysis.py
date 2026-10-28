from tests.fixtures.articles import EN_NEWS_ARREST, HI_NEWS_ARREST
from app.services.framing.framing_analyzer import analyze_bias_and_framing
from app.services.entities.entity_extractor import extract_named_entities
from app.schemas.framing import FramingCategory
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

