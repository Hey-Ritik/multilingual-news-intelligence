import pytest
import socket
from unittest.mock import patch, AsyncMock
import fitz
from app.services.ingestion.text_ingest import ingest_pasted_text
from app.services.ingestion.pdf_ingest import ingest_pdf_bytes
from app.utils.ssrf_protector import (
    is_ip_allowed,
    validate_url_safety,
    SSRFSecurityException,
    SSRFSafeNetworkBackend,
    safe_fetch_url,
)
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

# ==============================================================================
# SSRF REGRESSION TESTS
# ==============================================================================

def test_ssrf_regression_1_public_globally_routable_ipv4():
    """1. A public globally routable IPv4 address must be allowed."""
    assert is_ip_allowed("8.8.8.8")
    assert is_ip_allowed("1.1.1.1")
    assert is_ip_allowed("151.101.0.81")
    assert is_ip_allowed("93.184.216.34")

def test_ssrf_regression_2_public_ipv4_via_nat64():
    """2. A public IPv4 address represented through NAT64 (64:ff9b::/96) must be allowed."""
    # Dotted-decimal representation
    assert is_ip_allowed("64:ff9b::8.8.8.8")
    assert is_ip_allowed("64:ff9b::151.101.156.81")
    assert is_ip_allowed("64:ff9b::1.1.1.1")
    # Hexadecimal representation (151.101.156.81 -> 0x97.65.9c.51 -> 9765:9c51)
    assert is_ip_allowed("64:ff9b::9765:9c51")
    # 8.8.8.8 -> 0x08.08.08.08 -> 808:808
    assert is_ip_allowed("64:ff9b::808:808")

def test_ssrf_regression_3_nat64_embedding_private_ipv4():
    """3. NAT64 embedding a private/loopback/link-local/non-public IPv4 address must be rejected."""
    # RFC 1918 private ranges
    assert not is_ip_allowed("64:ff9b::10.0.0.1")
    assert not is_ip_allowed("64:ff9b::172.16.0.1")
    assert not is_ip_allowed("64:ff9b::192.168.1.1")
    # Loopback
    assert not is_ip_allowed("64:ff9b::127.0.0.1")
    assert not is_ip_allowed("64:ff9b::7f00:1")  # Hex for 127.0.0.1
    # Link-local / Cloud metadata
    assert not is_ip_allowed("64:ff9b::169.254.169.254")
    # Carrier-grade NAT (100.64.0.0/10)
    assert not is_ip_allowed("64:ff9b::100.64.0.1")
    # Unspecified and broadcast/reserved
    assert not is_ip_allowed("64:ff9b::0.0.0.0")
    assert not is_ip_allowed("64:ff9b::255.255.255.255")
    # Multicast
    assert not is_ip_allowed("64:ff9b::224.0.0.1")
    # Documentation ranges (RFC 5737 TEST-NET)
    assert not is_ip_allowed("64:ff9b::192.0.2.1")
    assert not is_ip_allowed("64:ff9b::198.51.100.1")
    assert not is_ip_allowed("64:ff9b::203.0.113.1")

def test_ssrf_regression_4_ipv4_mapped_ipv6():
    """4. IPv4-mapped IPv6 addresses (::ffff:0:0/96) must be validated via embedded IPv4."""
    # Public IPv4-mapped
    assert is_ip_allowed("::ffff:8.8.8.8")
    assert is_ip_allowed("::ffff:151.101.0.81")
    assert is_ip_allowed("::ffff:1.1.1.1")
    # Private / loopback / link-local IPv4-mapped
    assert not is_ip_allowed("::ffff:127.0.0.1")
    assert not is_ip_allowed("::ffff:10.0.0.1")
    assert not is_ip_allowed("::ffff:172.16.0.1")
    assert not is_ip_allowed("::ffff:192.168.1.1")
    assert not is_ip_allowed("::ffff:169.254.169.254")
    assert not is_ip_allowed("::ffff:0.0.0.0")
    assert not is_ip_allowed("::ffff:192.0.2.1")

def test_ssrf_regression_5_loopback_linklocal_private_ipv6():
    """5. Loopback, link-local, multicast, and private IPv6 addresses must be rejected."""
    # Loopback
    assert not is_ip_allowed("::1")
    # Link-local
    assert not is_ip_allowed("fe80::1")
    assert not is_ip_allowed("fe80::dead:beef:1")
    # Unique Local Address (ULA) private
    assert not is_ip_allowed("fc00::1")
    assert not is_ip_allowed("fd00::1")
    assert not is_ip_allowed("fd12:3456:789a::1")
    # Multicast
    assert not is_ip_allowed("ff02::1")
    assert not is_ip_allowed("ff01::1")
    # Unspecified
    assert not is_ip_allowed("::")
    # RFC 8215 Local-Use IPv4/IPv6 translation prefix (64:ff9b:1::/48)
    assert not is_ip_allowed("64:ff9b:1::192.168.1.1")
    # Standard public globally routable IPv6 must be allowed
    assert is_ip_allowed("2001:4860:4860::8888")
    assert is_ip_allowed("2606:4700:4700::1111")

def test_ssrf_regression_6_mixed_dns_results():
    """6. Mixed DNS results containing both safe and unsafe addresses must be rejected."""
    # Mock DNS returning a safe public IP alongside a private loopback
    with patch("socket.getaddrinfo") as mock_gai:
        mock_gai.return_value = [
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("8.8.8.8", 443)),
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 443)),
        ]
        safe, err = validate_url_safety("https://mixed-dns.example.com/news")
        assert not safe
        assert "prohibited private or link-local range" in err

    # Mock DNS returning a safe public IP alongside an unsafe NAT64 private IP
    with patch("socket.getaddrinfo") as mock_gai:
        mock_gai.return_value = [
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("151.101.0.81", 443)),
            (socket.AF_INET6, socket.SOCK_STREAM, 6, "", ("64:ff9b::10.0.0.1", 443)),
        ]
        safe, err = validate_url_safety("https://mixed-nat64.example.com/news")
        assert not safe
        assert "prohibited private or link-local range" in err

    # Mock DNS returning safe public IP alongside an unsafe cloud metadata link-local IP
    with patch("socket.getaddrinfo") as mock_gai:
        mock_gai.return_value = [
            (socket.AF_INET6, socket.SOCK_STREAM, 6, "", ("64:ff9b::9765:9c51", 443)),
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("169.254.169.254", 443)),
        ]
        safe, err = validate_url_safety("https://mixed-cloud.example.com/news")
        assert not safe
        assert "prohibited private or link-local range" in err

    # Mock DNS returning all safe IPs (public IPv4 and public NAT64 IPv6)
    with patch("socket.getaddrinfo") as mock_gai:
        mock_gai.return_value = [
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("151.101.156.81", 443)),
            (socket.AF_INET6, socket.SOCK_STREAM, 6, "", ("64:ff9b::9765:9c51", 443)),
        ]
        safe, err = validate_url_safety("https://safe-dualstack.example.com/news")
        assert safe
        assert err is None

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

@pytest.mark.asyncio
async def test_ssrf_dns_rebinding_connection_validation():
    """Verifies that SSRFSafeNetworkBackend intercepts connection time and blocks unsafe resolved IPs."""
    backend = SSRFSafeNetworkBackend()

    # Simulate getaddrinfo at connection time resolving to private IP
    with patch("asyncio.get_running_loop") as mock_loop:
        mock_event_loop = mock_loop.return_value
        mock_event_loop.getaddrinfo = AsyncMock(return_value=[
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 80))
        ])
        with pytest.raises(SSRFSecurityException, match="prohibited private"):
            await backend.connect_tcp("rebound.example.com", 80)

@pytest.mark.asyncio
async def test_ssrf_redirect_validation_blocks_private():
    """Verifies that redirect destinations are strictly validated against SSRF."""
    with patch("app.utils.ssrf_protector.validate_url_safety") as mock_validate:
        # First call for initial URL is safe, second call for redirect location is unsafe
        mock_validate.side_effect = [
            (True, None),
            (False, "Access to localhost is strictly prohibited.")
        ]
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = AsyncMock()
            mock_resp.status_code = 302
            mock_resp.headers = {"Location": "http://localhost:8000/admin"}
            mock_get.return_value = mock_resp

            with pytest.raises(SSRFSecurityException, match="Blocked Redirect"):
                await safe_fetch_url("https://example.com/login")

@pytest.mark.asyncio
async def test_ssrf_unix_socket_access_blocked():
    """Verifies that UNIX domain sockets cannot be opened via SSRFSafeNetworkBackend."""
    backend = SSRFSafeNetworkBackend()
    with pytest.raises(SSRFSecurityException, match="UNIX domain sockets"):
        await backend.connect_unix_socket("/var/run/docker.sock")

def test_pdf_ingest_valid():
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
