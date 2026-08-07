import type { FindingViewModel } from "@/types/findings";

import { hoursAgo, minutesAgo } from "./support";

/**
 * Mock findings. No findings API exists on the backend and no scanner sandbox
 * is connected, so nothing here was produced by a real tool run. Evidence
 * strings are illustrative and redacted — they are not working payloads.
 * See frontend/API_GAPS.md.
 */

const AURORA_STOREFRONT: FindingViewModel[] = [
  {
    id: "f-0001",
    title: "Database credentials committed to version control",
    severity: "critical",
    confidence: 0.97,
    status: "open",
    source: "gitleaks",
    asset: "github.com/aurora-labs/storefront",
    filePath: "config/database.yml",
    lineStart: 12,
    lineEnd: 14,
    evidence:
      'production:\n  adapter: postgresql\n  username: aurora_app\n  password: "AK****************9f"   # value redacted by Blacklight',
    description:
      "A PostgreSQL password is stored in plaintext in a tracked configuration file. The value is present in the repository history as well as the working tree, so removing it from HEAD alone will not revoke exposure.",
    impact:
      "Anyone with read access to the repository — including anyone who obtains a clone, fork, or CI artefact — can read the production database password. If the database is reachable from outside the deployment network, this is direct data access.",
    remediation:
      "Rotate the credential first, then move it to an environment variable or secret manager and load it at boot. Purge the value from git history with a history-rewriting tool, and force-push after coordinating with the team.",
    cwe: "CWE-798",
    cvss: 9.1,
    detectedAt: hoursAgo(5),
    duplicateCount: 3,
    fixId: "fix-0001",
  },
  {
    id: "f-0002",
    title: "SQL query built by string concatenation in order lookup",
    severity: "high",
    confidence: 0.88,
    status: "open",
    source: "Semgrep",
    asset: "https://shop.aurora-labs.dev",
    filePath: "app/services/order_lookup.py",
    lineStart: 44,
    lineEnd: 47,
    evidence:
      'query = "SELECT * FROM orders WHERE reference = \'" + reference + "\'"\ncursor.execute(query)',
    description:
      "The `reference` value arrives from a request parameter and is interpolated directly into a SQL statement. No parameter binding or escaping is applied on this path.",
    impact:
      "An attacker who controls the reference parameter can alter the structure of the query. Depending on database permissions, that may allow reading rows belonging to other customers.",
    remediation:
      "Use a parameterised query — pass `reference` as a bound parameter rather than concatenating it. Audit the surrounding module for the same pattern; string-built SQL rarely appears only once.",
    cwe: "CWE-89",
    cvss: 8.2,
    detectedAt: hoursAgo(5),
    duplicateCount: 2,
    fixId: "fix-0002",
  },
  {
    id: "f-0003",
    title: "Session cookie missing Secure and SameSite attributes",
    severity: "high",
    confidence: 0.94,
    status: "reviewing",
    source: "OWASP ZAP",
    asset: "https://shop.aurora-labs.dev",
    evidence: "Set-Cookie: session=<redacted>; Path=/; HttpOnly",
    description:
      "The session cookie is issued with HttpOnly but without Secure or SameSite. The application is served over HTTPS, so the missing Secure flag is not required by the transport but does permit the cookie to be sent over a downgraded connection.",
    impact:
      "Without SameSite, the session cookie is attached to cross-site requests, which widens the surface for cross-site request forgery on state-changing endpoints.",
    remediation:
      "Set `Secure`, and `SameSite=Lax` (or `Strict` where the flow allows it) on the session cookie. Confirm no third-party embed depends on cross-site cookie delivery before choosing Strict.",
    cwe: "CWE-1275",
    cvss: 7.1,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
    fixId: "fix-0003",
  },
  {
    id: "f-0004",
    title: "Dependency with known vulnerability: pillow 9.0.1",
    severity: "high",
    confidence: 0.99,
    status: "open",
    source: "Dependency analysis",
    asset: "github.com/aurora-labs/storefront",
    filePath: "requirements.txt",
    lineStart: 23,
    lineEnd: 23,
    evidence: "pillow==9.0.1   # advisory affects < 9.0.1 through 10.0.0 range",
    description:
      "The pinned image-processing library version is covered by published advisories affecting image decoding paths. The application passes user-uploaded images to this library during product-image processing.",
    impact:
      "Malformed image uploads reach a decoder with known memory-safety issues. Worst case is process compromise on the image-processing worker.",
    remediation:
      "Upgrade to the latest patch release and re-run the test suite around image upload. Add the dependency scan to CI so this is caught at merge time rather than at assessment time.",
    cwe: "CWE-1395",
    cvss: 7.5,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
  },
  {
    id: "f-0005",
    title: "Stack traces returned to the client on unhandled errors",
    severity: "medium",
    confidence: 0.85,
    status: "open",
    source: "OWASP ZAP",
    asset: "https://shop.aurora-labs.dev/api/checkout",
    evidence:
      'HTTP/1.1 500 Internal Server Error\n{"error":"psycopg2.errors.UndefinedColumn: column \\"discount_v2\\" does not exist\\n  File \\"/srv/app/checkout.py\\", line 118..."}',
    description:
      "An unhandled exception on the checkout endpoint returns the full traceback in the response body, including source file paths, the ORM in use, and internal column names.",
    impact:
      "Discloses internal structure that shortens the reconnaissance step for anyone probing the application. Not directly exploitable on its own.",
    remediation:
      "Return a generic error body in production and log the traceback server-side with a correlation ID the user can quote to support. Confirm the debug flag is off in the production configuration.",
    cwe: "CWE-209",
    cvss: 5.3,
    detectedAt: hoursAgo(5),
    duplicateCount: 4,
  },
  {
    id: "f-0006",
    title: "Content-Security-Policy header not set",
    severity: "medium",
    confidence: 0.99,
    status: "open",
    source: "OWASP ZAP",
    asset: "https://shop.aurora-labs.dev",
    evidence: "No Content-Security-Policy or Content-Security-Policy-Report-Only header present on any of 14 sampled responses.",
    description:
      "The application does not send a Content-Security-Policy. Inline scripts are used on the product and checkout pages, so a policy will need a nonce or hash strategy rather than a blanket script-src.",
    impact:
      "Removes a layer of defence against injected script. Does not create an injection vulnerability by itself, but raises the impact of any that exist.",
    remediation:
      "Start with Content-Security-Policy-Report-Only and a report endpoint, review violations for a release cycle, then enforce. Prefer nonces over 'unsafe-inline'.",
    cwe: "CWE-693",
    cvss: 5.1,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
  },
  {
    id: "f-0007",
    title: "Password reset token remains valid after use",
    severity: "medium",
    confidence: 0.72,
    status: "reviewing",
    source: "Semgrep",
    asset: "https://shop.aurora-labs.dev/auth/reset",
    filePath: "app/auth/reset.py",
    lineStart: 61,
    lineEnd: 78,
    evidence:
      "token = PasswordResetToken.get(token_id)\nif token.expires_at > now():\n    user.set_password(new_password)\n    # token is never marked consumed",
    description:
      "The reset handler validates expiry but never invalidates the token after a successful password change, so the token stays usable until its natural expiry.",
    impact:
      "If a reset link is exposed after use — through a shared inbox, browser history, or a referrer leak — it can be replayed to set the password again within the validity window.",
    remediation:
      "Mark the token consumed inside the same transaction as the password update, and reject already-consumed tokens. Invalidate outstanding sessions on password change.",
    cwe: "CWE-640",
    cvss: 5.9,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
  },
  {
    id: "f-0008",
    title: "TLS configuration permits TLS 1.0 and 1.1",
    severity: "medium",
    confidence: 0.96,
    status: "accepted_risk",
    source: "testssl.sh",
    asset: "shop.aurora-labs.dev:443",
    evidence:
      "TLS 1.0    offered\nTLS 1.1    offered\nTLS 1.2    offered\nTLS 1.3    offered",
    description:
      "The endpoint still negotiates TLS 1.0 and 1.1. Both are deprecated and are no longer supported by current browsers.",
    impact:
      "Legacy protocol versions carry known weaknesses. Practical exploitation needs a network position, and modern clients will not negotiate these versions.",
    remediation:
      "Disable TLS 1.0 and 1.1 at the load balancer. Check access logs for legacy client user-agents first if any integration partner is on old tooling.",
    cwe: "CWE-327",
    cvss: 4.3,
    detectedAt: hoursAgo(5),
    duplicateCount: 2,
  },
  {
    id: "f-0009",
    title: "Directory listing enabled on static asset path",
    severity: "low",
    confidence: 0.91,
    status: "open",
    source: "Nuclei",
    asset: "https://shop.aurora-labs.dev/uploads/",
    evidence: "GET /uploads/ -> 200, response body contains an autoindex listing of 214 entries",
    description:
      "The web server returns an index listing for the uploads path rather than a 403 or 404.",
    impact:
      "Enumerates uploaded filenames, which may include customer-supplied documents that were assumed to be unlisted.",
    remediation:
      "Disable autoindex for this location and serve uploads through an authenticated handler that checks ownership before streaming the file.",
    cwe: "CWE-548",
    cvss: 3.7,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
  },
  {
    id: "f-0010",
    title: "Server version disclosed in response headers",
    severity: "low",
    confidence: 0.99,
    status: "resolved",
    source: "Nuclei",
    asset: "https://shop.aurora-labs.dev",
    evidence: "Server: nginx/1.18.0 (Ubuntu)\nX-Powered-By: gunicorn/20.1.0",
    description:
      "Response headers disclose the exact web server and application server versions.",
    impact:
      "Lets someone match the deployment against published advisories without probing. Minor on its own.",
    remediation:
      "Set `server_tokens off` in nginx and strip X-Powered-By at the proxy layer.",
    cwe: "CWE-200",
    cvss: 3.1,
    detectedAt: hoursAgo(5),
    duplicateCount: 3,
  },
  {
    id: "f-0011",
    title: "Verbose robots.txt exposes administrative paths",
    severity: "low",
    confidence: 0.8,
    status: "open",
    source: "Passive recon",
    asset: "https://shop.aurora-labs.dev/robots.txt",
    evidence: "Disallow: /internal-admin/\nDisallow: /ops/metrics\nDisallow: /backup-2023/",
    description:
      "robots.txt enumerates paths the team clearly considers sensitive. Disallow entries are advisory to crawlers and are not an access control.",
    impact:
      "Gives a reader a curated list of paths worth trying. Whether any of them are actually reachable is a separate question this scan did not answer.",
    remediation:
      "Remove sensitive paths from robots.txt and enforce access control on them directly. Use a meta noindex tag on pages that must stay out of search results.",
    cwe: "CWE-200",
    cvss: 2.6,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
  },
  {
    id: "f-0012",
    title: "Sourcemaps published alongside production bundles",
    severity: "info",
    confidence: 0.88,
    status: "open",
    source: "Passive recon",
    asset: "https://shop.aurora-labs.dev/assets/",
    evidence: "GET /assets/index-8f2c1a.js.map -> 200 application/json",
    description:
      "Production JavaScript bundles ship with their sourcemaps, so the original module structure and comments are recoverable.",
    impact:
      "Makes reading the client-side code straightforward. No secret material was found in the maps sampled during this scan.",
    remediation:
      "Either stop emitting sourcemaps in the production build, or upload them to your error-tracking service and block the .map path at the CDN.",
    cwe: "CWE-540",
    cvss: 0,
    detectedAt: hoursAgo(5),
    duplicateCount: 1,
  },
];

const PAYMENTS_API: FindingViewModel[] = [
  {
    id: "f-0101",
    title: "JWT accepted with 'none' algorithm on internal service route",
    severity: "high",
    confidence: 0.79,
    status: "open",
    source: "jwt_tool",
    asset: "https://api.aurora-labs.dev/internal/settlement",
    evidence:
      'Request with header {"alg":"none","typ":"JWT"} and unsigned payload -> HTTP 200',
    description:
      "One internal route accepts a token whose header declares no signing algorithm. The public routes reject the same token, so the check appears to be missing on this handler rather than globally.",
    impact:
      "A caller who can reach this route can present a self-constructed token. The route is not exposed at the edge, so reachability depends on network position inside the deployment.",
    remediation:
      "Pin the accepted algorithm list at the verifier and reject `none` explicitly. Route all handlers through the same verification middleware rather than per-handler checks.",
    cwe: "CWE-347",
    cvss: 7.4,
    detectedAt: minutesAgo(9),
    duplicateCount: 1,
  },
  {
    id: "f-0102",
    title: "API key present in a committed .env.sample file",
    severity: "medium",
    confidence: 0.64,
    status: "reviewing",
    source: "gitleaks",
    asset: "github.com/aurora-labs/payments-api",
    filePath: ".env.sample",
    lineStart: 7,
    lineEnd: 7,
    evidence: "STRIPE_TEST_KEY=sk_test_****************  # value redacted by Blacklight",
    description:
      "A key-shaped string is committed in the sample environment file. The prefix suggests a test-mode key rather than a live one, which is why confidence is moderate.",
    impact:
      "If the key is live rather than test-mode, it grants API access under the account. Verify before deciding severity.",
    remediation:
      "Confirm whether the key is live. Replace the value in .env.sample with a placeholder, and rotate the key if it was ever real.",
    cwe: "CWE-798",
    cvss: 5.5,
    detectedAt: minutesAgo(9),
    duplicateCount: 1,
  },
  {
    id: "f-0103",
    title: "Rate limiting absent on token endpoint",
    severity: "medium",
    confidence: 0.7,
    status: "open",
    source: "Configuration analysis",
    asset: "https://api.aurora-labs.dev/oauth/token",
    evidence:
      "No rate-limit directive matched this location in the reviewed nginx configuration. No X-RateLimit-* headers observed on sampled responses.",
    description:
      "The token endpoint has no request throttling in the reviewed configuration. Blacklight did not send high-volume traffic to confirm this — the finding is from configuration review only.",
    impact:
      "Removes a control that would otherwise slow down automated credential testing against the endpoint.",
    remediation:
      "Add a per-IP and per-account rate limit at the proxy, with a lower threshold for failed attempts than successful ones.",
    cwe: "CWE-307",
    cvss: 5.3,
    detectedAt: minutesAgo(6),
    duplicateCount: 1,
  },
  {
    id: "f-0104",
    title: "Deprecated API version still served",
    severity: "low",
    confidence: 0.92,
    status: "open",
    source: "Passive recon",
    asset: "https://api.aurora-labs.dev/v1/",
    evidence: "GET /v1/health -> 200, documented as removed in the v2 migration note",
    description:
      "The v1 API surface is still reachable despite documentation stating it was retired.",
    impact:
      "Older handlers may not carry the validation added in v2. Whether they do was not assessed.",
    remediation:
      "Return 410 for v1 routes once client telemetry confirms no live callers remain.",
    cwe: "CWE-1104",
    cvss: 3.1,
    detectedAt: minutesAgo(5),
    duplicateCount: 1,
  },
];

const HELIOS_PARTIAL: FindingViewModel[] = [
  {
    id: "f-0201",
    title: "Mixed content on the checkout page",
    severity: "medium",
    confidence: 0.86,
    status: "open",
    source: "OWASP ZAP",
    asset: "https://www.helios-demo.example/checkout",
    evidence: "3 subresources requested over http:// from an https:// document",
    description:
      "The checkout page loads three assets over plain HTTP. Browsers block or upgrade most of these, but the references remain in the markup.",
    impact:
      "Assets served without transport security can be modified in transit by anyone with a network position.",
    remediation:
      "Serve all subresources over HTTPS and add upgrade-insecure-requests to the content security policy.",
    cwe: "CWE-311",
    cvss: 4.8,
    detectedAt: minutesAgo(1440),
    duplicateCount: 1,
  },
];

/** Findings keyed by scan id. Scans with no entry have produced none yet. */
export const mockFindingsByScan: Record<string, FindingViewModel[]> = {
  "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a01": AURORA_STOREFRONT,
  "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a02": PAYMENTS_API,
  "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a05": HELIOS_PARTIAL,
};

/** Distinct detecting tools present across the whole mock dataset. */
export const mockFindingSources: string[] = Array.from(
  new Set(
    Object.values(mockFindingsByScan)
      .flat()
      .map((finding) => finding.source),
  ),
).sort();
