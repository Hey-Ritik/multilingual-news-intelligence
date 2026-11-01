import asyncio
import ipaddress
import socket
import urllib.parse
from typing import Tuple, Optional, List
import typing
import httpx
import httpcore

class SSRFSecurityException(Exception):
    """Raised when a URL attempts to access private, local, or prohibited network destinations."""
    pass

# Well-Known Prefix for IPv4-IPv6 translation (NAT64 / DNS64, RFC 6052)
NAT64_WELL_KNOWN_PREFIX = ipaddress.IPv6Network("64:ff9b::/96")

def is_ipv4_allowed(ip: ipaddress.IPv4Address) -> bool:
    """
    Validates that an IPv4 address is globally routable and public.
    Rejects loopback (127.0.0.0/8), private (RFC 1918, RFC 6598 CGNAT 100.64.0.0/10),
    link-local (169.254.0.0/16), multicast (224.0.0.0/4), reserved/broadcast (240.0.0.0/4),
    unspecified (0.0.0.0), and documentation/non-global ranges (RFC 5737: 192.0.2.0/24,
    198.51.100.0/24, 203.0.113.0/24, RFC 2544: 198.18.0.0/15).
    """
    if (
        ip.is_loopback
        or ip.is_private
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
        or not ip.is_global
    ):
        return False
    return True

def is_ip_allowed(ip_str: str) -> bool:
    """
    Validates whether an IP address is safe for outbound external requests.
    Supports IPv4, IPv6, IPv4-mapped IPv6 (::ffff:0:0/96), and NAT64 (64:ff9b::/96).
    For transition addresses (IPv4-mapped and NAT64), extracts the embedded IPv4
    and validates it using strict global-routability checks.
    Rejects loopback, private, link-local, multicast, reserved, and non-public destinations.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return False

    if isinstance(ip, ipaddress.IPv4Address):
        return is_ipv4_allowed(ip)

    if isinstance(ip, ipaddress.IPv6Address):
        # 1. IPv4-mapped IPv6 address (::ffff:0:0/96, RFC 4291)
        if ip.ipv4_mapped is not None:
            return is_ipv4_allowed(ip.ipv4_mapped)

        # 2. NAT64 Well-Known Prefix (64:ff9b::/96, RFC 6052)
        if ip in NAT64_WELL_KNOWN_PREFIX:
            embedded_ipv4 = ipaddress.IPv4Address(ip.packed[12:16])
            return is_ipv4_allowed(embedded_ipv4)

        # 3. Standard IPv6 addresses: reject non-global, private, loopback, link-local, multicast
        if (
            ip.is_loopback
            or ip.is_private
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
            or ip.is_site_local
            or not ip.is_global
        ):
            return False

        return True

    return False

def validate_url_safety(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validates the scheme and resolves the hostname to check for SSRF.
    Every resolved address is validated; rejects if ANY destination is unsafe.
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
        addr_infos = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
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

class SSRFSafeNetworkBackend(httpcore.AsyncNetworkBackend):
    """
    Custom network backend for httpcore that enforces SSRF defense and prevents DNS rebinding.
    At TCP connection time, resolves destination hostname, validates every resolved IP address,
    and connects directly to a validated safe IP while preserving TLS SNI and server certificate validation.
    """
    def __init__(self, base_backend: Optional[httpcore.AsyncNetworkBackend] = None):
        self._base_backend = base_backend or httpcore._backends.auto.AutoBackend()

    async def connect_tcp(
        self,
        host: str,
        port: int,
        timeout: float | None = None,
        local_address: str | None = None,
        socket_options: typing.Iterable[httpcore.SOCKET_OPTION] | None = None,
    ) -> httpcore.AsyncNetworkStream:
        loop = asyncio.get_running_loop()
        try:
            addr_infos = await loop.getaddrinfo(host, port, type=socket.SOCK_STREAM)
        except socket.gaierror as e:
            raise httpcore.ConnectError(f"DNS resolution failed for '{host}': {e}") from e

        if not addr_infos:
            raise httpcore.ConnectError(f"Could not resolve host '{host}'")

        safe_ips: List[str] = []
        for info in addr_infos:
            ip_str = info[4][0]
            if not is_ip_allowed(ip_str):
                raise SSRFSecurityException(
                    f"Destination IP '{ip_str}' for host '{host}' is in a prohibited private or non-public range."
                )
            if ip_str not in safe_ips:
                safe_ips.append(ip_str)

        # Prioritize direct IPv4 for broad compatibility if dual-stack, otherwise use IPv6
        safe_ips.sort(key=lambda ip: 0 if ("." in ip and not ip.startswith("64:ff9b::")) else 1)

        last_error = None
        for target_ip in safe_ips:
            try:
                return await self._base_backend.connect_tcp(
                    host=target_ip,
                    port=port,
                    timeout=timeout,
                    local_address=local_address,
                    socket_options=socket_options,
                )
            except (httpcore.ConnectError, httpcore.ConnectTimeout, OSError) as e:
                last_error = e
                continue

        if last_error:
            if isinstance(last_error, (httpcore.ConnectError, httpcore.ConnectTimeout)):
                raise last_error
            raise httpcore.ConnectError(
                f"Failed to connect to any resolved safe IP for host '{host}': {last_error}"
            ) from last_error

        raise httpcore.ConnectError(f"Could not connect to host '{host}'")

    async def connect_unix_socket(
        self,
        path: str,
        timeout: float | None = None,
        socket_options: typing.Iterable[httpcore.SOCKET_OPTION] | None = None,
    ) -> httpcore.AsyncNetworkStream:
        raise SSRFSecurityException("Access to UNIX domain sockets is prohibited.")

    async def sleep(self, seconds: float) -> None:
        await self._base_backend.sleep(seconds)

def create_ssrf_safe_transport() -> httpx.AsyncHTTPTransport:
    """Creates an AsyncHTTPTransport wired with SSRFSafeNetworkBackend to defeat DNS rebinding."""
    transport = httpx.AsyncHTTPTransport()
    transport._pool._network_backend = SSRFSafeNetworkBackend()
    return transport

async def safe_fetch_url(
    url: str,
    timeout_seconds: float = 10.0,
    max_redirects: int = 3,
    max_response_bytes: int = 5 * 1024 * 1024
) -> Tuple[int, bytes, str, dict]:
    """
    Safely executes an HTTP GET request with SSRF verification on the initial URL
    and on every subsequent redirect location. Enforces timeouts and size bounds.
    Defeats DNS rebinding by revalidating and connecting to a validated IP at connection time.
    Returns (status_code, content_bytes, final_url, headers).
    """
    current_url = url
    redirect_count = 0

    transport = create_ssrf_safe_transport()
    async with httpx.AsyncClient(transport=transport, follow_redirects=False, timeout=timeout_seconds) as client:
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
            except SSRFSecurityException:
                raise
            except httpx.TimeoutException:
                raise TimeoutError(f"Request to {current_url} timed out after {timeout_seconds}s.")
            except Exception as e:
                if isinstance(e, SSRFSecurityException) or isinstance(getattr(e, '__cause__', None), SSRFSecurityException):
                    raise SSRFSecurityException(str(e))
                raise IOError(f"Network error while requesting {current_url}: {e}")

            # Check redirect status
            if response.status_code in (301, 302, 303, 307, 308):
                location = response.headers.get("Location")
                if not location:
                    return response.status_code, response.content, current_url, dict(response.headers)

                redirect_count += 1
                if redirect_count > max_redirects:
                    raise SSRFSecurityException(f"Exceeded maximum allowed redirects ({max_redirects}).")

                # Handle relative redirects and validate redirect destination
                next_url = urllib.parse.urljoin(current_url, location)
                is_redirect_safe, redirect_err = validate_url_safety(next_url)
                if not is_redirect_safe:
                    raise SSRFSecurityException(f"SSRF Protection Blocked Redirect to '{next_url}': {redirect_err}")

                current_url = next_url
                continue

            # Check response size limit
            content = response.content
            if len(content) > max_response_bytes:
                raise ValueError(f"Response size ({len(content)} bytes) exceeds configured limit ({max_response_bytes} bytes).")

            return response.status_code, content, current_url, dict(response.headers)
