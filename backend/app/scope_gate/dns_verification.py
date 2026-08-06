"""
Domain-ownership verification for self-owned targets (FR-2.3).

Two supported methods, same idea as TLS cert issuance (ACME) or Google Search
Console verification:

  1. DNS TXT challenge — user creates a TXT record at
     `_blacklight-verify.<root_domain>` containing a token we generated.
  2. File challenge — user uploads a file to
     `https://<root_domain>/.well-known/blacklight-verify.txt` containing the token.

Either one proves control of the domain without needing any credentials. Nothing
in this module performs or assists any offensive action — it only confirms that
the person requesting a scan actually controls the thing they're asking us to scan.
"""
import secrets

import dns.asyncresolver
import dns.exception
import httpx

from app.core.config import settings


def generate_challenge_token() -> str:
    """Cryptographically random token the user must place in DNS or at the well-known path."""
    return secrets.token_urlsafe(32)


async def check_dns_txt(root_domain: str, expected_token: str) -> tuple[bool, str]:
    """
    Look up `_blacklight-verify.<root_domain>` TXT records and check whether one
    matches expected_token. Returns (verified, detail_message).
    """
    hostname = f"{settings.dns_txt_challenge_prefix}.{root_domain}"
    resolver = dns.asyncresolver.Resolver()
    resolver.timeout = 5
    resolver.lifetime = 5

    try:
        answers = await resolver.resolve(hostname, "TXT")
    except dns.resolver.NXDOMAIN:
        return False, f"No TXT record found at {hostname}"
    except dns.resolver.NoAnswer:
        return False, f"{hostname} exists but has no TXT records"
    except dns.exception.Timeout:
        return False, f"DNS lookup for {hostname} timed out"
    except Exception as exc:  # noqa: BLE001 — surface any resolver error as a failed check
        return False, f"DNS lookup failed: {exc}"

    for rdata in answers:
        # TXT records can be split into multiple quoted strings; join them.
        value = b"".join(rdata.strings).decode("utf-8", errors="ignore")
        if value.strip() == expected_token:
            return True, f"Matching TXT record found at {hostname}"

    return False, f"TXT record(s) found at {hostname}, but none matched the expected token"


async def check_file_challenge(root_domain: str, expected_token: str) -> tuple[bool, str]:
    """
    Fetch https://<root_domain>/.well-known/blacklight-verify.txt and check its
    contents against expected_token. Falls back to http:// only if https fails
    outright (some capstone-demo targets may not have TLS configured yet).
    """
    url_https = f"https://{root_domain}{settings.file_challenge_path}"
    url_http = f"http://{root_domain}{settings.file_challenge_path}"

    async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
        for url in (url_https, url_http):
            try:
                resp = await client.get(url)
            except httpx.RequestError as exc:
                last_error = str(exc)
                continue

            if resp.status_code != 200:
                last_error = f"{url} returned HTTP {resp.status_code}"
                continue

            if resp.text.strip() == expected_token:
                return True, f"Matching challenge file found at {url}"
            return False, f"Challenge file found at {url}, but contents did not match"

    return False, f"Could not reach challenge file: {last_error}"
