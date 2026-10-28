import ipaddress
import socket
import urllib.parse
from typing import Tuple, Optional
import httpx

class SSRFSecurityException(Exception):
    """Raised when a URL attempts to access private, local, or prohibited network destinations."""
    pass

def is_ip_allowed(ip_str: str) -> bool:
    """
    Validates whether an IP address is safe for outbound external requests.
    Rejects loopback, private RFC1918/RFC4193, link-local, multicast, and reserved addresses.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return False

    if ip.is_loopback:
        return False
    if ip.is_private:
        return False
    if ip.is_link_local:
        return False
    if ip.is_multicast:
        return False
    if ip.is_reserved:
        return False
    if ip.is_unspecified:
        return False

    return True

def validate_url_safety(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validates the scheme and resolves the hostname to check for SSRF.
    Returns (is_safe, error_message).
    """
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        return False, f"Invalid URL structure: {e}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Prohibited scheme: '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL lacks a valid hostname."

    # Prevent localhost explicitly
    if hostname.lower() in ("localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback"):
        return False, "Access to localhost is strictly prohibited."

    # Resolve hostname to IP addresses
    try:
        # socket.getaddrinfo returns list of (family, type, proto, canonname, sockaddr)
        addr_infos = socket.getaddrinfo(hostname, None)
        if not addr_infos:
            return False, f"Could not resolve hostname: {hostname}"

        for info in addr_infos:
            ip_str = info[4][0]
            if not is_ip_allowed(ip_str):
                return False, f"Resolved IP address '{ip_str}' is in a prohibited private or link-local range."
    except socket.gaierror as e:
        return False, f"DNS resolution failed for hostname '{hostname}': {e}"
    except Exception as e:
        return False, f"Safety check failed: {e}"

    return True, None

async def safe_fetch_url(
    url: str,
    timeout_seconds: float = 10.0,
    max_redirects: int = 3,
    max_response_bytes: int = 5 * 1024 * 1024
) -> Tuple[int, bytes, str, dict]:
    """
    Safely executes an HTTP GET request with SSRF verification on the initial URL
    and on every subsequent redirect location. Enforces timeouts and size bounds.
    Returns (status_code, content_bytes, final_url, headers).
    """
    current_url = url
    redirect_count = 0

    async with httpx.AsyncClient(follow_redirects=False, timeout=timeout_seconds) as client:
        while True:
            is_safe, err = validate_url_safety(current_url)
            if not is_safe:
                raise SSRFSecurityException(f"SSRF Protection Blocked Request to '{current_url}': {err}")

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MultilingualNewsIntelligence/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }

            try:
                response = await client.get(current_url, headers=headers)
            except httpx.TimeoutException:
                raise TimeoutError(f"Request to {current_url} timed out after {timeout_seconds}s.")
            except Exception as e:
                raise IOError(f"Network error while requesting {current_url}: {e}")

            # Check redirect status
            if response.status_code in (301, 302, 303, 307, 308):
                location = response.headers.get("Location")
                if not location:
                    return response.status_code, response.content, current_url, dict(response.headers)

                redirect_count += 1
                if redirect_count > max_redirects:
                    raise SSRFSecurityException(f"Exceeded maximum allowed redirects ({max_redirects}).")

                # Handle relative redirects
                current_url = urllib.parse.urljoin(current_url, location)
                continue

            # Check response size limit
            content = response.content
            if len(content) > max_response_bytes:
                raise ValueError(f"Response size ({len(content)} bytes) exceeds configured limit ({max_response_bytes} bytes).")

            return response.status_code, content, current_url, dict(response.headers)

