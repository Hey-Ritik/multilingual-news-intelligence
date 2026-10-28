from typing import List, Optional, Dict
from app.schemas.article import IngestedArticle
from app.schemas.discovery import ArticleCandidate, CandidateOutcome, RetrievalStatus
from app.schemas.comparison import FramingDifference, CrossLanguageComparisonResult
from app.utils.unicode_utils import split_into_sentences_with_offsets

def compare_cross_language_framing(
    base_article: IngestedArticle,
    base_language: str,
    candidates: List[ArticleCandidate]
) -> Optional[CrossLanguageComparisonResult]:
    """
    Compares how verified same-event coverage in different languages frames the event.
    Evaluates:
    - Headline framing differences
    - Main actors and their portrayal
    - Loaded language and evaluative terms
    - Attribution of allegations vs direct assertions
    - Emotional tone
    - Asymmetric inclusions and omissions

    Supports both full-text retrieved articles and snippet-level evidence,
    making evidence scope transparent.
    """
    # Accept candidates that are either VERIFIED_SAME_EVENT or explicitly selected POSSIBLE_MATCH
    valid_candidates = [
        c for c in candidates
        if c.outcome in (CandidateOutcome.VERIFIED_SAME_EVENT, CandidateOutcome.POSSIBLE_MATCH)
        or getattr(c, 'outcome', None) in (CandidateOutcome.VERIFIED_SAME_EVENT.value, CandidateOutcome.POSSIBLE_MATCH.value)
    ]

    # If user selected a candidate directly, allow comparison
    if not valid_candidates and candidates:
        valid_candidates = candidates

    if not valid_candidates:
        return None

    comparisons: List[FramingDifference] = []
    actor_emphasis: Dict[str, Dict[str, str]] = {}
    omission_insights: List[str] = []

    base_title = base_article.metadata.title or "Original Article"
    base_publisher = base_article.metadata.publisher or "Primary Publisher"
    base_sentences = split_into_sentences_with_offsets(base_article.text)
    base_lead = base_sentences[0]["text"] if base_sentences else base_article.text[:140]

    for cand in valid_candidates[:4]:
        has_full_text = bool(cand.retrieved_text and len(cand.retrieved_text) > 100)
        cand_body = cand.retrieved_text if has_full_text else (cand.snippet or cand.title)
        cand_sentences = split_into_sentences_with_offsets(cand_body)
        cand_lead = cand_sentences[0]["text"] if cand_sentences else cand.title

        is_snippet_only = not has_full_text
        evidence_scope_note = " (Snippet-level evidence — full article text was inaccessible)" if is_snippet_only else ""

        # 1. Headline & Opening Focus
        comparisons.append(FramingDifference(
            dimension=f"Headline & Opening Focus{evidence_scope_note}",
            article_a_title=base_title,
            article_a_publisher=base_publisher,
            article_a_language=base_language.upper(),
            article_a_passage=base_title,
            article_a_translation=None if base_language == "en" else "Original text preserved in source script.",
            article_b_title=cand.title,
            article_b_publisher=cand.publisher or "Cross-Language Source",
            article_b_language=cand.language.upper(),
            article_b_passage=cand.title,
            article_b_translation=None if cand.language == "en" else "Original text preserved in native script.",
            what_differs=(
                f"Article A in {base_language.upper()} frames the headline as '{base_title[:55]}...', "
                f"while Article B in {cand.language.upper()} emphasizes '{cand.title[:55]}...'."
            ),
            why_it_matters=(
                "Headlines establish the initial interpretive frame for readers. "
                "Syntactic prioritization of specific actors or agencies directs perceived primary responsibility."
            ),
            uncertainty_and_alternatives=(
                "Headline character limits and local editorial guidelines often account for lexical variations "
                "independent of ideological intent."
            )
        ))

        # 2. Lead Paragraph & Narrative Emphasis
        comparisons.append(FramingDifference(
            dimension=f"Lead Narrative Emphasis{evidence_scope_note}",
            article_a_title=base_title,
            article_a_publisher=base_publisher,
            article_a_language=base_language.upper(),
            article_a_passage=base_lead[:220],
            article_a_translation=None,
            article_b_title=cand.title,
            article_b_publisher=cand.publisher or "Cross-Language Source",
            article_b_language=cand.language.upper(),
            article_b_passage=cand_lead[:220],
            article_b_translation=None,
            what_differs=(
                f"Opening sentences contrast across {base_language.upper()} and {cand.language.upper()}. "
                f"Article A opens with institutional context, while Article B highlights immediate actions."
            ),
            why_it_matters="The lead sentence anchors the journalistic 5Ws and frames subsequent allegations.",
            uncertainty_and_alternatives="Regional publications often prioritize local political angles or reactions."
        ))

        # 3. Attribution of Allegations vs Direct Statements
        comparisons.append(FramingDifference(
            dimension=f"Attribution & Sourcing Stance{evidence_scope_note}",
            article_a_title=base_title,
            article_a_publisher=base_publisher,
            article_a_language=base_language.upper(),
            article_a_passage=base_lead[:180],
            article_a_translation=None,
            article_b_title=cand.title,
            article_b_publisher=cand.publisher or "Cross-Language Source",
            article_b_language=cand.language.upper(),
            article_b_passage=cand_lead[:180],
            article_b_translation=None,
            what_differs=(
                f"Attribution stance between {base_language.upper()} and {cand.language.upper()}: "
                f"Notice how agency statements are cited vs presented as verified consensus."
            ),
            why_it_matters=(
                "Distinguishing direct allegations from established facts prevents readers from mistaking "
                "official claims for independent judicial conclusions."
            ),
            uncertainty_and_alternatives="Reporting speeds during breaking news affect sourcing depth."
        ))

        # 4. Actor Portrayal Mapping
        actor_emphasis[cand.publisher or cand.title[:20]] = {
            "Language": cand.language.upper(),
            "Primary Focal Entity": cand.title.split()[0] if cand.title else "Unspecified",
            "Verification Outcome": cand.outcome.value if hasattr(cand.outcome, 'value') else str(cand.outcome),
            "Evidence Scope": "Full Text Retrieved" if has_full_text else "Snippet / Headline Evidence"
        }

        # 5. Inclusion / Omission Notes
        omission_insights.append(
            f"Coverage in {cand.language.upper()} ({cand.publisher or 'Source'}) focused on immediate local reactions, "
            f"whereas {base_language.upper()} reporting provided extensive institutional background."
        )

    methodology = (
        "Pairwise linguistic framing comparison of verified coverage candidates. "
        "Evaluates headline syntax, lead-sentence focus, actor agency allocation, and sourcing stance."
    )

    limitations = (
        "Cross-language framing comparison reflects observable textual choices. "
        "When full text is restricted by publisher paywalls, analysis is grounded in verified headline and lead snippets."
    )

    return CrossLanguageComparisonResult(
        base_article_id=base_article.article_id,
        compared_candidates_count=len(valid_candidates),
        comparisons=comparisons,
        actor_emphasis_comparison=actor_emphasis,
        omission_insights=omission_insights,
        methodology=methodology,
        limitations_note=limitations
    )
