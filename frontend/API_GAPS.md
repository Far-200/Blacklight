# API gaps

Endpoints the frontend needs that the backend does not implement yet.

**Everything below is a frontend proposal.** None of it is an agreed contract,
and none of it exists on the orchestrator. Paths, field names and shapes are
starting points for the API-contract discussion, not decisions. Where a shape
touches something the backend already models, it follows the existing model's
field names so the eventual serializer is a short hop.

Implemented endpoints — `GET /health` and the four `/scope-gate/*` routes — are
typed accurately in `src/api/contracts.ts` §1 and are not repeated here.

---

## 1. Create a target

**Purpose** — Register a target so it can be authorized and then assessed. This
is the entry point for the entire workflow; without it nothing else in the
product is reachable, including the scope-gate endpoints that already exist.

**Proposed** — `POST /targets?user_id=<uuid>`

**Request**

```json
{
  "name": "Aurora Storefront",
  "target_type": "web",
  "ownership_mode": "self_owned",
  "identifier": "https://shop.aurora-labs.dev",
  "root_domain": "aurora-labs.dev",
  "bounty_program": null,
  "repository_url": "https://github.com/aurora-labs/storefront",
  "notes": "Staging deployment."
}
```

`name`, `repository_url` and `notes` are not on the `Target` model today and
would need columns. Everything else maps directly.

**Response** — the target as in §2.

**Screen** — `/targets/new`.

**Notes** — A newly created target must never come back authorized.
`authorization_status` should be `pending` or null on creation, and the scope
gate remains the only thing that can change it.

---

## 2. Get and list targets

**Purpose** — Load a target on the authorization gate; list targets when
starting a new assessment against something already registered.

**Proposed** — `GET /targets?user_id=<uuid>` and `GET /targets/{target_id}`

**Response**

```json
{
  "id": "uuid",
  "name": "Aurora Storefront",
  "target_type": "web",
  "ownership_mode": "self_owned",
  "identifier": "https://shop.aurora-labs.dev",
  "root_domain": "aurora-labs.dev",
  "bounty_program": null,
  "repository_url": "https://github.com/aurora-labs/storefront",
  "notes": null,
  "created_at": "ISO-8601",
  "authorization_status": "passing"
}
```

**Screen** — `/targets/:targetId/authorize`, `/targets/new`.

**Notes** — `authorization_status` is denormalised from the latest live
`AuthorizationRecord` purely so the gate can render a state without a second
request. If that denormalisation is unwelcome, a separate
`GET /targets/{id}/authorization` returning the record itself works just as well
for this screen.

---

## 3. Create a scan job

**Purpose** — Create the `ScanJob` that `POST /scope-gate/scan-start` already
expects to be handed. Today the gate endpoint cannot be called through the UI at
all, because nothing can produce a `job_id`.

**Proposed** — `POST /scans?user_id=<uuid>`

**Request**

```json
{
  "target_id": "uuid",
  "requested_test_classes": ["static_analysis", "secret_detection"]
}
```

**Response** — the scan as in §5, with `state: "created"` or
`"awaiting_authorization"`.

**Screen** — `/targets/new` (after authorization), `/scans/:scanId`.

**Notes** — This should create the job **only**. Moving it to `queued` stays the
exclusive job of `service.authorize_scan_start()`. The frontend expects a
two-call flow: create the job, then request scan start.

---

## 4. List scans

**Purpose** — Populate the dashboard's recent assessments and the scans index.

**Proposed** — `GET /scans?user_id=<uuid>&target_id=<uuid>&state=<state>`

**Response** — an array of the object in §5, ideally without the `modules` and
`activity` arrays to keep the list response small.

**Screen** — `/dashboard`, `/scans`, `/reports`.

---

## 5. Scan status

**Purpose** — Drive the scan progress screen. The frontend **polls** this; there
is no WebSocket expectation.

**Proposed** — `GET /scans/{scan_id}`

**Response**

```json
{
  "id": "uuid",
  "target_id": "uuid",
  "target_name": "Aurora Storefront",
  "target_identifier": "https://shop.aurora-labs.dev",
  "target_type": "web",
  "state": "running",
  "authorization_status": "passing",
  "authorization_method": "dns_txt",
  "created_at": "ISO-8601",
  "started_at": "ISO-8601 or null",
  "finished_at": "ISO-8601 or null",
  "progress": 56,
  "modules": [
    {
      "key": "static",
      "label": "Static analysis",
      "state": "running",
      "progress": 62,
      "detail": "Semgrep, rule 132 of 214"
    }
  ],
  "activity": [
    { "id": "uuid", "at": "ISO-8601", "level": "info", "message": "..." }
  ],
  "finding_counts": { "critical": 1, "high": 3, "medium": 4, "low": 3, "info": 1 },
  "failure_reason": "string or null"
}
```

`module.state` is one of `pending`, `running`, `completed`, `skipped`, `failed`.
`activity[].level` is one of `info`, `warn`, `error`.

**Screen** — `/scans/:scanId`.

**Notes** — `failure_reason` should carry the gate's own reason verbatim when
`state` is `rejected`, since that string is what the user needs in order to fix
the situation. An `ETag` or `updated_at` would let the frontend poll cheaply.

---

## 6. Cancel a scan

**Purpose** — Stop a running assessment. Currently rendered as a confirmation
dialog that explicitly says cancellation is not implemented.

**Proposed** — `POST /scans/{scan_id}/cancel?user_id=<uuid>`

**Response** — the scan as in §5, moved to a terminal state.

**Screen** — `/scans/:scanId`.

**Notes** — Needs a `cancelled` value in `ScanJobState`; the frontend does not
currently have one and would add it to `src/types/domain.ts`. Worth an audit-log
action too.

---

## 7. Findings

**Purpose** — The findings exploration screen. This is the largest gap: there is
no findings API, no normalization output, and **no agreed findings schema**.

**Proposed** — `GET /scans/{scan_id}/findings`

**Response** — an array shaped like `FindingViewModel` in
`src/types/findings.ts`:

```json
{
  "id": "string",
  "title": "string",
  "severity": "critical | high | medium | low | info",
  "confidence": 0.97,
  "status": "open | reviewing | resolved | accepted_risk",
  "source": "gitleaks",
  "asset": "github.com/aurora-labs/storefront",
  "file_path": "config/database.yml",
  "line_start": 12,
  "line_end": 14,
  "evidence": "string",
  "description": "string",
  "impact": "string",
  "remediation": "string",
  "cwe": "CWE-798",
  "cvss": 9.1,
  "detected_at": "ISO-8601",
  "duplicate_count": 3,
  "fix_id": "string or null"
}
```

Also useful: `PATCH /scans/{scan_id}/findings/{finding_id}` accepting `{ status }`,
so triage decisions persist.

**Screen** — `/scans/:scanId/findings`, and the counts on `/dashboard`.

**Notes** — Treat the shape above as a **conversation starter, not a proposal to
adopt**. It is the minimum the current UI reads. Two things worth deciding
early, because the UI already leans on both: `confidence` is presented as the
detecting tool's confidence and never as a probability of exploitability, and
`duplicate_count` is the number of raw scanner results collapsed into the
finding.

---

## 8. Reports

**Purpose** — The report screen, plus export.

**Proposed** — `GET /scans/{scan_id}/report`, with
`GET /scans/{scan_id}/report/export?format=pdf|json` for export.

**Response** — shaped like `ReportViewModel` in `src/types/findings.ts`:
executive summary, overall risk, scope, methodology, severity counts,
prioritized finding ids, limitations, authorization statement.

**Screen** — `/scans/:scanId/report`, `/reports`.

**Notes** — The `authorization_statement` should be generated from the actual
`AuthorizationRecord` and audit entries rather than written by a model, since it
is the part of the report that makes a claim about what was permitted. Export
should stream a file; the frontend has placeholder buttons wired for it.

---

## 9. Proposed fixes

**Purpose** — The fix review screen.

**Proposed** — `GET /scans/{scan_id}/fixes` and
`PATCH /scans/{scan_id}/fixes/{fix_id}` accepting `{ "reviewed": true }`.

**Response** — shaped like `ProposedFixViewModel`: finding reference, file path,
summary, rationale, confidence, unified diff, and a `reviewed` flag.

**Screen** — `/scans/:scanId/fixes`.

**Notes** — The frontend renders diffs from pre-split hunks. Sending a raw
unified diff string instead is fine — parsing moves to the client and the
`DiffViewer` component absorbs it. Whatever the transport, the UI will keep
stating that patches are unvalidated drafts requiring human review.

---

## 10. File and repository upload

**Purpose** — The ZIP drop zone on the intake form, and eventually APK upload.

**Proposed** — `POST /targets/{target_id}/source` as `multipart/form-data`,
returning a storage reference to put in `Target.identifier` for APK targets.

**Screen** — `/targets/new`.

**Notes** — Currently a visibly disabled drop zone labelled "Upload API not
implemented". Size limits, accepted types and virus scanning are all undecided.

---

## 11. Authentication

**Purpose** — Replace `user_id` as a query parameter.

**Proposed** — Session or bearer token, with the user resolved by middleware.
`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.

**Screen** — All of them; the sidebar's user menu is an inert placeholder today.

**Notes** — When this lands, delete `DEV_USER_ID` from `src/config/env.ts` and
the `userId` parameters from `src/api/scopeGateApi.ts`, and attach credentials in
`src/api/client.ts`. Those are the only three places to touch. RBAC-gated views
are not built and will need the role vocabulary decided first.

---

## 12. Dashboard summary

**Purpose** — Headline counts without fetching every scan and finding.

**Proposed** — `GET /dashboard/summary?user_id=<uuid>`

**Response**

```json
{
  "total_scans": 5,
  "active_scans": 2,
  "critical_findings": 1,
  "resolved_findings": 1,
  "severity_counts": { "critical": 1, "high": 4, "medium": 7, "low": 4, "info": 1 },
  "recent_scan_ids": ["uuid"]
}
```

**Screen** — `/dashboard`.

**Notes** — Lowest priority of anything here. The dashboard could compute all of
this from §4 and §7; this endpoint only becomes worthwhile once there are enough
scans that fetching them all is wasteful.
