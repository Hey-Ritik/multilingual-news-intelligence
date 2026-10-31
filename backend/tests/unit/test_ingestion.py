import pytest
import fitz
from app.services.ingestion.text_ingest import ingest_pasted_text
from app.services.ingestion.pdf_ingest import ingest_pdf_bytes
from app.utils.ssrf_protector import is_ip_allowed, validate_url_safety
from app.schemas.article import ExtractionStatus

def test_ingest_pasted_text_valid():
    text = "The Supreme Court on Friday delivered a landmark judgment on environmental protection in New Delhi."
    article = ingest_pasted_text(text, title="Supreme Court Verdict")
    assert article.status == ExtractionStatus.FULL
    assert article.metadata.title == "Supreme Court Verdict"
    assert article.metadata.word_count > 10
    assert article.metadata.sentence_count >= 1
    assert "Supreme Court" in article.text

def test_ingest_pasted_text_empty_raises_error():
    with pytest.raises(ValueError, match="empty or solely whitespace"):
        ingest_pasted_text("   \n\t  ")

def test_ssrf_ip_blocking():
    # Loopback
    assert not is_ip_allowed("127.0.0.1")
    assert not is_ip_allowed("127.0.1.5")
    assert not is_ip_allowed("::1")

    # RFC1918 Private ranges
    assert not is_ip_allowed("10.0.0.1")
    assert not is_ip_allowed("172.16.0.1")
    assert not is_ip_allowed("192.168.1.100")

    # Link-local / Cloud metadata (AWS / GCP / Azure link-local metadata)
    assert not is_ip_allowed("169.254.169.254")

    # Public IP
    assert is_ip_allowed("8.8.8.8")
    assert is_ip_allowed("1.1.1.1")

def test_url_safety_validation():
    # Localhost explicitly blocked
    safe, err = validate_url_safety("http://localhost:8000/secret")
    assert not safe
    assert "localhost" in err.lower()

    # Invalid scheme blocked
    safe, err = validate_url_safety("ftp://example.com/file.txt")
    assert not safe
    assert "prohibited scheme" in err.lower()

    # File scheme blocked
    safe, err = validate_url_safety("file:///etc/passwd")
    assert not safe

def test_pdf_ingest_valid():
    # Create valid in-memory PDF using PyMuPDF
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Breaking News: Prime Minister launched national highway expansion.")
    pdf_bytes = doc.write()
    doc.close()

    article = ingest_pdf_bytes(pdf_bytes, filename="test.pdf")
    assert article.status == ExtractionStatus.FULL
    assert "Prime Minister launched" in article.text
    assert article.metadata.word_count > 5

def test_pdf_ingest_empty_bytes_raises():
    with pytest.raises(ValueError, match="empty"):
        ingest_pdf_bytes(b"")

def test_pdf_ingest_corrupted_bytes_raises():
    with pytest.raises(ValueError, match="Corrupt or invalid"):
        ingest_pdf_bytes(b"NOT A REAL PDF HEADER 123456789")

