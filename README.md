# Blacklight — Phase 0 Scaffold

Phase 0 (Weeks 1–3) deliverables, per the SRS and Development Plan:

- [x] FastAPI backend, Postgres + Redis wired up (`docker-compose.yml`)
- [x] Domain-ownership verification flow — DNS TXT and file-based challenge (FR-2.3)
- [x] Bug-bounty scope checklist — structured manual entry (FR-2.2, per SRS v2.0)
- [x] Scope/authorization gate as a hard state-machine precondition (Section 3.2, FR-2.6)
- [x] Restricted test-class opt-in (credential stuffing / brute force / volumetric) (FR-2.5)
- [x] Audit-log schema + single write path (FR-2.4, FR-10.1)
- [ ] Findings schema v1 — next, shared with AI/LLM Lead
- [ ] Monorepo CI skeleton

## Layout

```
backend/app/
  core/           config, async DB session
  models/         Target, AuthorizationRecord, DomainChallenge, AuditLogEntry, ScanJob
  scope_gate/     dns_verification.py (DNS TXT / file-challenge checks)
                  service.py          (the actual gate — state machine + audit trail)
  routers/        scope_gate.py       (API surface)
  schemas/        scope_gate.py       (Pydantic request/response models)
  audit/          logger.py           (single audit-log write path)
```

## Running locally

```bash
cp backend/.env.example backend/.env   # edit if needed
docker compose up --build
```

Backend comes up on `http://localhost:8000`. Interactive docs at `/docs`.

## How the gate actually works

1. **Self-owned target**: create a `Target` with `ownership_mode=self_owned` and a
   `root_domain`. Call `POST /scope-gate/challenges` to get a token, publish it via
   DNS TXT or the well-known file path, then call `POST /scope-gate/challenges/verify`.
   A passing check writes an `AuthorizationRecord` with `status=passing`.

2. **Bug bounty target**: create a `Target` with `ownership_mode=bug_bounty`. Call
   `POST /scope-gate/bounty-checklist` with the in-scope/out-of-scope assets and
   disallowed test classes from the program's published policy.

3. **Every scan-executing module** (recon, web/API scanner, MCP harness — Phase 1/2
   work) must call `service.authorize_scan_start()` directly (or hit
   `POST /scope-gate/scan-start`) before touching the Kali sandbox. This function:
   - re-derives the target and re-checks for a live, unexpired `AuthorizationRecord`
     server-side — it never trusts a caller-supplied "already authorized" flag
   - blocks restricted test classes (credential stuffing, brute force, volumetric)
     unless explicitly listed in `allowed_test_classes`
   - writes to the audit log either way, allowed or blocked

No other code path is permitted to set a `ScanJob`'s state to `RUNNING`/`QUEUED`.
When the sandbox worker picks up a job in Phase 1, it should assert the job is
already `QUEUED` (meaning the gate already passed) rather than re-implementing
any part of this check itself.

## What's deliberately NOT here yet

- Auth/RBAC middleware (`user_id` is currently passed as a query param for testing —
  swap for real session/JWT auth before this touches anything real)
- Alembic migrations (using `create_all` for local dev only)
- The Kali sandbox container itself (Phase 1)
- Anything that performs an actual scan — this phase only gates access to that

## Testing the gate

```bash
# 1. Create a target (self-owned) via a DB insert or a future /targets endpoint
# 2. Request a challenge
curl -X POST localhost:8000/scope-gate/challenges \
  -H "Content-Type: application/json" \
  -d '{"target_id": "<uuid>", "method": "dns_txt"}'

# 3. Publish the returned token as a TXT record, then verify
curl -X POST "localhost:8000/scope-gate/challenges/verify?user_id=<uuid>" \
  -H "Content-Type: application/json" \
  -d '{"challenge_id": "<uuid>"}'

# 4. Try to start a scan job — will only succeed if step 3 passed
curl -X POST "localhost:8000/scope-gate/scan-start?user_id=<uuid>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "<uuid>", "requested_test_classes": []}'
```
