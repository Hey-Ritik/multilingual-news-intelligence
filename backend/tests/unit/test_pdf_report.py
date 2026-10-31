import datetime
from tests.fixtures.articles import EN_NEWS_ARREST
from app.schemas.article import IngestedArticle, ArticleMetadata, ExtractionStatus
from app.schemas.language import LanguageDetectionResult
from app.schemas.nlp import SentimentResult, SentimentLabel, EmotionResult, EmotionLabel, SummaryResult
from app.schemas.framing import FramingAnalysisResult, FramingEvidence, FramingCategory
from app.schemas.event import EventProfile
from app.schemas.discovery import ArticleCandidate, CandidateOutcome, RetrievalStatus
from app.schemas.comparison import CrossLanguageComparisonResult, FramingDifference
from app.schemas.report import FullAnalysisReport, StatisticalReport
from app.services.reporting.pdf_generator import generate_pdf_report

def test_generate_pdf_report_validity():
    article = IngestedArticle(
        article_id="art_test_123",
        text=EN_NEWS_ARREST,
        metadata=ArticleMetadata(
            title="ED Arrests Arvind Kejriwal in Delhi Excise Case",
            publisher="Daily Chronicle",
            word_count=125,
            char_count=len(EN_NEWS_ARREST),
            sentence_count=4
        ),
        status=ExtractionStatus.FULL
    )

    lang = LanguageDetectionResult(
        language_code="en",
        language_name="English",
        confidence=0.99,
        script="Latin",
        is_supported=True
    )

    sentiment = SentimentResult(
        label=SentimentLabel.NEGATIVE,
        score=-0.45,
        positive_score=0.10,
        negative_score=0.65,
        neutral_score=0.25,
        method="Rule-based valence mapping",
        limitations="Negative tone reflects conflict reporting, not political bias."
    )

    emotion = EmotionResult(
        primary_emotion=EmotionLabel.ANGER,
        method="Quotation-aware emotion lexicon",
        limitations="Quoted anger is strictly attributed to sources."
    )

    summary = SummaryResult(
        summary_text="The Enforcement Directorate arrested Delhi Chief Minister Arvind Kejriwal.",
        method="Extractive salience",
        limitations="Extractive summary."
    )

    framing = FramingAnalysisResult(
        findings=[
            FramingEvidence(
                finding_id="f1",
                category=FramingCategory.LOADED_LANGUAGE,
                label="Loaded Adjective",
                exact_text="draconian",
                start_offset=10,
                end_offset=19,
                explanation="Pejorative characterization.",
                potential_effect="Colors reader interpretation negatively.",
                evidence_strength="high",
                alternative_interpretation="Quoted statement from party leader."
            )
        ],
        category_counts={"LOADED_LANGUAGE": 1},
        density_per_1000_tokens=8.0,
        article_level_assessment="Observable linguistic framing in loaded language.",
        unsupported_conclusions_note="Does not establish political intent.",
        methodology="Unicode offset analysis."
    )

    event_profile = EventProfile(
        headline="ED Arrests Arvind Kejriwal",
        event_description="Arrest of Chief Minister Arvind Kejriwal",
        principal_actors=["Arvind Kejriwal"],
        principal_organizations=["Enforcement Directorate"],
        main_action="arrested / detained",
        location="Delhi",
        context="Arrest followed questioning.",
        original_language="en"
    )

    stats = StatisticalReport(
        word_count=125,
        char_count=len(EN_NEWS_ARREST),
        sentence_count=4,
        evidence_density_per_1000_tokens=8.0,
        sentiment_score=-0.45,
        primary_emotion="ANGER",
        entity_count_by_type={"PERSON": 1, "ORGANIZATION": 1},
        claim_count_by_type={"ATTRIBUTED_CLAIM": 2},
        framing_indicators_by_category={"LOADED_LANGUAGE": 1},
        discovery_candidates_total=1,
        verified_same_event_count=1,
        likely_same_event_count=0,
        language_breakdown={"hi": 1}
    )

    report = FullAnalysisReport(
        report_id="rep_test_123",
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        article=article,
        language=lang,
        summary=summary,
        sentiment=sentiment,
        emotion=emotion,
        entities=[],
        claims=[],
        framing=framing,
        event_profile=event_profile,
        generated_queries=[],
        candidates=[],
        comparison=None,
        statistics=stats,
        methodology_summary="Grounded linguistic analysis.",
        limitations=["Standard academic analysis."]
    )

    pdf_bytes = generate_pdf_report(report)
    assert pdf_bytes is not None
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 2000  # Multi-page or detailed PDF is > 2KB

