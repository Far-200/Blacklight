# Blacklight — Frontend

The Blacklight application interface: target intake, the authorization gate, scan
monitoring, findings exploration, reports, and proposed fixes.

Blacklight is an authorized defensive-security assessment platform. Authorization
and scope verification are core product features here, not fine print — the
authorization gate is a first-class screen with its own route, and the interface
provides no way around it.

> **Reveal what attackers would find before they do.**

---

## What this currently implements

| Screen                  | Route                          | Data source                    |
| ----------------------- | ------------------------------ | ------------------------------ |
| Dashboard               | `/dashboard`                   | Mock                           |
| New assessment (intake) | `/targets/new`                 | Mock                           |
| Authorization gate      | `/targets/:targetId/authorize` | Real endpoints, mocked targets |
| Scans index             | `/scans`                       | Mock                           |
| Scan progress           | `/scans/:scanId`               | Mock (polled)                  |
| Findings                | `/scans/:scanId/findings`      | Mock                           |
| Report                  | `/scans/:scanId/report`        | Mock                           |
| Proposed fixes          | `/scans/:scanId/fixes`         | Mock                           |
| Reports index           | `/reports`                     | Mock                           |
| Settings                | `/settings`                    | Placeholder, nothing persists  |
| Not found               | `*`                            | —                              |

`GET /health` is the **only** endpoint called for real on every run — the
connection indicator reports the true state of the orchestrator regardless of
whether screen data is coming from fixtures.

**Not built:** authentication, real uploads, scanner execution, WebSockets, PDF
or JSON export, scan cancellation, settings persistence. Each is visibly marked
unavailable in the interface rather than silently inert.

---

## Stack

| Concern       | Choice                                          |
| ------------- | ----------------------------------------------- |
| Framework     | React 19 + TypeScript (strict)                  |
| Build         | Vite 8                                          |
| Styling       | Tailwind CSS v4 via `@tailwindcss/vite`         |
| Routing       | React Router 8                                  |
| Server state  | TanStack Query 5                                |
| Forms         | React Hook Form + Zod 4 + `@hookform/resolvers` |
| Icons         | Lucide React                                    |
| Class merging | `clsx` + `tailwind-merge`                       |
| HTTP          | Browser `fetch`, through one typed client       |

No component framework, no charting library, no animation library, no state
manager, no code editor. Every dependency listed is used.

---

## Installation

Requires Node 20.19+ or 22.12+.

```bash
cd frontend
npm install
cp .env.example .env
```

## Environment variables

| Variable            | Default | Meaning                                                          |
| ------------------- | ------- | ---------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | Prefix applied to every request. Vite proxies it in development.  |
| `VITE_USE_MOCKS`    | `true`  | When true, endpoints that do not exist resolve from `src/mocks/`. |

Both are read in exactly one place, `src/config/env.ts`. Nothing else touches
`import.meta.env`.

## Development server

```bash
npm run dev          # http://127.0.0.1:5173
```

Requests to `/api/*` are proxied to `http://127.0.0.1:8000` with the `/api`
prefix stripped, so the frontend calls `/api/health` and FastAPI receives
`/health`.

## Mock mode

```env
VITE_USE_MOCKS=true
```

The default. The whole application is navigable with no backend running. Every
screen without a real endpoint renders fixture data from `src/mocks/`, and a
`MOCK DATA` chip stays visible in the top bar throughout.

## Real API mode

```env
VITE_USE_MOCKS=false
```

Start the orchestrator first (`docker compose up` from the repository root). In
this mode, any screen whose endpoint does not exist throws
`NotImplementedOnBackendError` and renders an error panel naming the missing
endpoint. That is deliberate: the alternative is a screen that looks like it is
talking to a server while showing invented data.

Because there is no way to create a `Target` yet, the authorization gate cannot
be exercised end-to-end against the real backend. See `API_GAPS.md`.

## Build, lint, preview

```bash
npm run build        # tsc -b && vite build
npm run lint         # eslint .
npm run preview      # serve the production build
```

---

## Folder structure

```
frontend/
  src/
    api/            client.ts, contracts.ts, one module per resource
    app/            App.tsx, providers.tsx, router.tsx
    components/
      layout/       AppShell, Sidebar, TopBar, MobileNav, PageHeader, Wordmark
      ui/           Button, Panel, badges, Field, CodeEvidence, ConfirmDialog…
    config/         env.ts — the only reader of import.meta.env
    features/
      authorization/  the scope gate (self-owned + bug-bounty flows)
      dashboard/      overview and severity distribution
      findings/       list, filters, detail
      fixes/          diff review
      notfound/
      reports/        report viewer and index
      scans/          progress, modules, activity, state timeline
      settings/
      targets/        intake wizard and its schema
    hooks/          useBackendHealth, useCopyToClipboard, useElapsed, useNow
    mocks/          fixtures — imported only by src/api/, never by components
    styles/         index.css — all design tokens live here
    types/          domain.ts (backend enums), findings.ts (temporary models)
    utils/          cn, format, severity
```

### Conventions worth keeping

- **`src/api/` is the only place that calls the network.** Components never
  `fetch`.
- **`src/mocks/` is imported only by `src/api/`** — one seam to cut when real
  endpoints land.
- **Backend enum strings live only in `src/types/domain.ts`**, copied verbatim
  from the SQLAlchemy models. Nothing else hard-codes them.
- **Design tokens live only in `src/styles/index.css`.** Components use the
  generated utilities, not raw hex values.
- **Severity colours are reserved for severity**, and severity is never
  communicated by colour alone — every badge carries a distinct icon shape and a
  text label.
- **Monospace is for identifiers, code, tokens and logs.** Never for prose.

---

## Current backend limitations

Transcribed from the backend as it stands. The frontend is built around these,
not in denial of them.

- No endpoint creates a `Target`. Models exist; routes do not.
- No endpoint creates or lists a `ScanJob`.
- No findings, report, or fix APIs.
- No live scan progress. This app **polls** through TanStack Query, and the
  polling interval is a function of scan state so finished scans stop
  requesting. WebSockets are deliberately not used.
- No authentication or RBAC. `user_id` is a query parameter on the scope-gate
  routes; the frontend sends a fixed development UUID from `DEV_USER_ID` in
  `src/config/env.ts` — the one thing to delete when auth arrives.
- The scanner sandbox is not connected. The module pipeline on the scan screen
  is planned work, not a description of anything that runs.
- No file or repository upload. The ZIP drop zone is visibly marked UI-only.

Missing endpoints are proposed in [`API_GAPS.md`](./API_GAPS.md). Those are
frontend proposals, not agreed contracts.

## A note on the findings model

`src/types/findings.ts` defines `FindingViewModel`, `ProposedFixViewModel` and
`ReportViewModel`. **None of these is the agreed findings schema.** They are
temporary shapes so the findings, report and fix screens could be designed and
reviewed. When the shared schema is agreed, that file gets deleted and its
imports re-pointed — it should not be quietly widened to absorb the real one.

## Brand assets

`public/blacklight_favicon.png` and `public/blacklight_logo.png` are the supplied
artwork and are unmodified. The in-app wordmark
(`components/layout/Wordmark.tsx`) redraws the aperture and its diagonal beam as
inline SVG so it inherits the interface's own ultraviolet — the raster lockup is
dark-on-light and would not sit on these surfaces.
