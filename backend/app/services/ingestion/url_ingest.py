import uuid
from bs4 import BeautifulSoup
import re
from app.schemas.article import IngestedArticle, ArticleMetadata, ExtractionStatus
from app.utils.ssrf_protector import safe_fetch_url, SSRFSecurityException
from app.utils.unicode_utils import count_words_and_tokens, split_into_sentences_with_offsets
from app.config import settings

async def ingest_url_article(url: str) -> IngestedArticle:
    """
    Safely retrieves and parses an article from an HTTP/HTTPS URL with strict SSRF defense.
    Extracts article metadata (title, publisher, date) and body content.
    Distinguishes FULL, PARTIAL, and FAILED extractions.
    """
    notes = []
    try:
        status_code, content_bytes, final_url, headers = await safe_fetch_url(
            url=url,
            timeout_seconds=settings.REQUEST_TIMEOUT_SECONDS,
            max_redirects=settings.MAX_REDIRECTS,
            max_response_bytes=settings.MAX_RESPONSE_BYTES
        )
    except SSRFSecurityException as e:
        raise ValueError(f"Security Policy Blocked URL: {e}")
    except Exception as e:
        raise IOError(f"Failed to fetch remote article: {e}")

    if status_code >= 400:
        raise IOError(f"Remote server responded with error HTTP status {status_code}.")

    # Decode HTML
    encoding = "utf-8"
    content_type = headers.get("content-type", "")
    match_charset = re.search(r'charset=([\w-]+)', content_type, re.IGNORECASE)
    if match_charset:
        encoding = match_charset.group(1)

    try:
        html = content_bytes.decode(encoding, errors="replace")
    except Exception:
        html = content_bytes.decode("utf-8", errors="replace")

    soup = BeautifulSoup(html, "html.parser")

    # Extract metadata from OpenGraph and meta tags
    title = None
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    elif soup.title and soup.title.string:
        title = soup.title.string.strip()

    publisher = None
    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        publisher = og_site["content"].strip()

    publish_date = None
    date_meta = soup.find("meta", property="article:published_time") or soup.find("meta", attrs={"name": "pubdate"})
    if date_meta and date_meta.get("content"):
        publish_date = date_meta["content"].strip()

    # Remove non-content elements
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside", "form"]):
        tag.decompose()

    # Look for candidate article containers
    article_tag = soup.find("article") or soup.find("div", class_=re.compile(r'(article-body|story-body|post-content|entry-content)', re.I))
    paragraphs = []
    if article_tag:
        for p in article_tag.find_all("p"):
            text = p.get_text().strip()
            if len(text) > 25:
                paragraphs.append(text)
    
    if not paragraphs:
        # Fallback to general paragraph collection
        for p in soup.find_all("p"):
            text = p.get_text().strip()
            # Filter out boilerplate short phrases or cookie notices
            if len(text) > 35 and not re.search(r'(cookie|subscribe|all rights reserved|terms of service)', text, re.I):
                paragraphs.append(text)

    body_text = "\n\n".join(paragraphs).strip()
    
    extraction_status = ExtractionStatus.FULL
    if not body_text:
        extraction_status = ExtractionStatus.FAILED
        notes.append("No readable article paragraphs could be extracted from page HTML structure.")
        body_text = title if title else "Extraction failed to find text."
    elif len(body_text) < 150:
        extraction_status = ExtractionStatus.PARTIAL
        notes.append("Extracted content is unusually short; likely a partial snippet or teaser.")

    word_count, _ = count_words_and_tokens(body_text)
    sentences = split_into_sentences_with_offsets(body_text)

    metadata = ArticleMetadata(
        title=title or "Untitled News Article",
        publisher=publisher or "Online Publisher",
        publish_date=publish_date,
        url=final_url,
        author=None,
        word_count=word_count,
        char_count=len(body_text),
        sentence_count=len(sentences)
    )

    return IngestedArticle(
        article_id=f"art_{uuid.uuid4().hex[:12]}",
        text=body_text,
        metadata=metadata,
        status=extraction_status,
        extraction_notes=notes
    )

