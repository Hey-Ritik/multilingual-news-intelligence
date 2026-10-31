import re
from typing import List
from app.schemas.nlp import SummaryResult, NamedEntity, EntityType
from app.utils.unicode_utils import split_into_sentences_with_offsets

def generate_extractive_summary(
    text: str,
    entities: List[NamedEntity],
    language_code: str,
    max_sentences: int = 3
) -> SummaryResult:
    """
    Generates a faithful, extractive summary strictly derived from the input text.
    Selects the most information-dense sentences containing key actors, actions, and locations.
    Never hallucinates ungrounded facts.
    """
    sentences = split_into_sentences_with_offsets(text)
    if not sentences:
        return SummaryResult(
            summary_text="No text available to summarize.",
            method="Extractive salience scoring",
            key_actors=[],
            key_actions=[],
            limitations="Input text was empty."
        )

    # Score sentences based on:
    # 1. Lead sentence boost (first 2 sentences carry standard journalistic 5Ws)
    # 2. Named entity density
    # 3. Informative length
    scored_sentences = []
    actor_names = [e.text for e in entities if e.label == EntityType.PERSON or e.label == EntityType.ORGANIZATION]

    for idx, s_info in enumerate(sentences):
        s_text = s_info["text"]
        score = 0.0

        # Position score
        if idx == 0:
            score += 4.0
        elif idx == 1:
            score += 2.5
        elif idx == 2:
            score += 1.0

        # Entity overlap
        for actor in actor_names:
            if actor in s_text:
                score += 1.5

        # Punctuation / Length penalty
        words = re.findall(r'\S+', s_text)
        if len(words) < 6:
            score -= 2.0
        elif 10 <= len(words) <= 35:
            score += 1.0

        scored_sentences.append((score, idx, s_text))

    # Pick top sentences while preserving original document order
    scored_sentences.sort(key=lambda x: x[0], reverse=True)
    selected_indices = sorted([item[1] for item in scored_sentences[:max_sentences]])
    summary_sentences = [sentences[i]["text"] for i in selected_indices]

    summary_text = " ".join(summary_sentences)

    limitations = (
        "This is a strictly extractive summary composed of top-salience original sentences. "
        "It preserves direct statements without external syntheses or ungrounded claims."
    )

    return SummaryResult(
        summary_text=summary_text,
        method="Extractive position-and-entity salience weighting",
        key_actors=list(dict.fromkeys(actor_names))[:5],
        key_actions=[],
        limitations=limitations
    )

