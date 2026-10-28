import fitz  # PyMuPDF
import uuid
import os
from app.schemas.article import IngestedArticle, ArticleMetadata, ExtractionStatus
from app.utils.unicode_utils import count_words_and_tokens, split_into_sentences_with_offsets
from app.config import settings

def ingest_pdf_bytes(pdf_bytes: bytes, filename: str = "uploaded_document.pdf") -> IngestedArticle:
    """
    Ingests and parses selectable text from a PDF document using PyMuPDF.
    Detects scanned or image-only PDFs, encrypted documents, and corrupt streams.
    """
    if not pdf_bytes:
        raise ValueError("Uploaded PDF file is completely empty (0 bytes).")

    if len(pdf_bytes) > settings.MAX_PDF_SIZE_BYTES:
        raise ValueError(
            f"PDF file size ({len(pdf_bytes)} bytes) exceeds maximum limit "
            f"({settings.MAX_PDF_SIZE_BYTES} bytes)."
        )

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Corrupt or invalid PDF file: {e}")

    if doc.is_encrypted:
        raise ValueError("The provided PDF is password-encrypted and cannot be processed.")

    if doc.page_count == 0:
        raise ValueError("The provided PDF contains no pages.")

    page_texts = []
    total_images = 0

    for page_idx in range(doc.page_count):
        page = doc.load_page(page_idx)
        text = page.get_text("text").strip()
        page_texts.append(text)
        total_images += len(page.get_images())

    full_text = "\n\n".join([pt for pt in page_texts if pt]).strip()
    notes = [f"Processed {doc.page_count} PDF pages."]

    status = ExtractionStatus.FULL
    # Detect scanned / image-only PDFs
    if len(full_text) < 40 and total_images > 0:
        status = ExtractionStatus.FAILED
        explanation = (
            f"PDF contains {total_images} image(s) across {doc.page_count} page(s) with minimal or no selectable text "
            f"({len(full_text)} characters found). This document appears to be a scanned document; Optical Character "
            f"Recognition (OCR) would be required to extract its contents."
        )
        notes.append(explanation)
        raise ValueError(explanation)

    if not full_text:
        status = ExtractionStatus.FAILED
        explanation = "No selectable text could be extracted from any page of the PDF document."
        notes.append(explanation)
        raise ValueError(explanation)

    # Extract title from doc metadata if available or first meaningful line
    doc_meta = doc.metadata or {}
    title = doc_meta.get("title")
    if not title or len(title.strip()) == 0:
        first_line = full_text.splitlines()[0].strip()
        title = first_line[:120] if first_line else os.path.splitext(filename)[0]

    author = doc_meta.get("author") or None
    creation_date = doc_meta.get("creationDate") or None

    word_count, _ = count_words_and_tokens(full_text)
    sentences = split_into_sentences_with_offsets(full_text)

    metadata = ArticleMetadata(
        title=title,
        publisher="PDF Document",
        publish_date=creation_date,
        url=None,
        author=author,
        word_count=word_count,
        char_count=len(full_text),
        sentence_count=len(sentences)
    )

    return IngestedArticle(
        article_id=f"art_{uuid.uuid4().hex[:12]}",
        text=full_text,
        metadata=metadata,
        status=status,
        extraction_notes=notes
    )

