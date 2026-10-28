import uuid
from app.schemas.article import IngestedArticle, ArticleMetadata, ExtractionStatus
from app.utils.unicode_utils import count_words_and_tokens, split_into_sentences_with_offsets
from app.config import settings

def ingest_pasted_text(text: str, title: str = None) -> IngestedArticle:
    """
    Ingests, validates, and standardizes pasted article text.
    Preserves Unicode code points and original text accurately.
    """
    if not text or not text.strip():
        raise ValueError("Article text cannot be empty or solely whitespace.")

    clean_text = text.strip()
    if len(clean_text) > settings.MAX_TEXT_LENGTH_CHARS:
        raise ValueError(
            f"Article text length ({len(clean_text)} characters) exceeds maximum "
            f"allowed limit ({settings.MAX_TEXT_LENGTH_CHARS} characters)."
        )

    # Derive title if not explicitly provided
    if not title:
        first_line = clean_text.splitlines()[0].strip()
        title = first_line[:120] if len(first_line) > 0 else "Pasted News Article"

    word_count, _ = count_words_and_tokens(clean_text)
    sentences = split_into_sentences_with_offsets(clean_text)

    metadata = ArticleMetadata(
        title=title,
        publisher="Direct Input",
        publish_date=None,
        url=None,
        author=None,
        word_count=word_count,
        char_count=len(clean_text),
        sentence_count=len(sentences)
    )

    return IngestedArticle(
        article_id=f"art_{uuid.uuid4().hex[:12]}",
        text=clean_text,
        metadata=metadata,
        status=ExtractionStatus.FULL,
        extraction_notes=["Direct user text paste accepted."]
    )

