# SecLuva — Municipal Infrastructure Issue Deduplicator

A multi-tenant web application — React frontend, Node/Express API, PostgreSQL + PostGIS database — that helps municipalities manage citizen-reported infrastructure problems (potholes, broken streetlights, fallen trees, water leaks, garbage piles) by automatically detecting when multiple reports describe the same physical incident, using geographic proximity and text similarity.

> **Engineering plan — Phase 1 & 2, with an architecture preview.** This document covers problem discovery, requirements, MVP scope, roadmap, and a lightweight architecture preview. Phase 3 (domain modeling) is the next piece of work — see [Recommended Next Task](#recommended-next-task).

**Project context:** academic capstone · **Timeline:** 16 weeks (one semester) · **Budget:** zero / near-zero · **Report language (MVP):** English only · **Stack:** PostgreSQL + PostGIS · Express · React · Node, modular monolith

Status tags used throughout: **[Confirmed]** · **[Recommended]** · **[Assumption]** · **[Open question]** · **[Future]**

---

## Contents

- [Phase 1 — Problem Discovery & Requirements](#phase-1--problem-discovery--requirements-analysis)
- [Phase 2 — Scope & Project Initiation](#phase-2--scope-definition--project-initiation)
- [Architecture Preview](#architecture-preview-full-phase-4-detail-deferred)
- [Recommended Next Task](#recommended-next-task)

---

## Phase 1 — Problem Discovery & Requirements Analysis

### 1.1 Problem Statement

Citizens reporting the same physical infrastructure problem — a pothole, a downed streetlight, a water leak — currently creates one independent record per report. A single pothole photographed by eight different commuters becomes eight tickets with no system-level awareness they describe the same hole. Municipal staff must manually recognize duplication by memory or by re-reading descriptions, which does not scale past a small town and does not transfer between shifts or staff turnover. The result is inflated backlog counts, wasted triage effort, and no reliable answer to the basic question a municipality needs to answer: *how many distinct problems do we actually have outstanding?*

SecLuva's job is narrow and specific: given a new citizen report, decide — automatically where confident, with a human in the loop where not — whether it describes a physical incident municipal staff are already tracking, or a new one.

### 1.2 Current Workflow and Its Limitations

- **Reporting channels are ad hoc.** Phone calls, walk-ins, social media mentions, paper forms — reports land in different places with no shared identifier.
- **Deduplication is manual and tribal.** A staff member recognizes "oh, that's the Station Road pothole again" only if they personally remember it — new or rotating staff can't.
- **No geographic or textual cross-check exists.** Two reports 10 meters apart, both saying "broken streetlight," are never automatically connected.
- **Backlog counts are misleading.** Report volume is mistaken for incident volume, distorting prioritization and public reporting of "issues resolved."
- **Citizens get no feedback loop.** A citizen who already reported an issue has no way to confirm "yes, this is being tracked" versus silently filing a redundant report.

### 1.3 Proposed Workflow with SecLuva

1. Citizen submits a report through a web form: category, description, optional photo, and a location pin.
2. SecLuva retrieves nearby open incidents in the same category and tenant, and scores each as a candidate match using distance and text similarity.
3. A confident match silently links the report to the existing incident; the citizen still gets a tracking code.
4. An ambiguous match is queued for a municipal staff member to confirm, reject, or redirect — never auto-decided when uncertain.
5. No plausible match creates a new consolidated incident.
6. Staff work from incidents, not raw reports — one card per real-world problem, with every original report preserved underneath it for context and evidence.

### 1.4 Stakeholders & User Roles

| Role | Who | Primary needs |
|---|---|---|
| **Citizen** | Resident reporting an issue; no account required | Fast, low-friction submission; a way to check status later |
| **Municipal staff / reviewer** | Front-line employee triaging reports | Trustworthy incident list, a review queue for uncertain matches, ability to correct mistakes |
| **Municipality admin** | Department lead for one tenant | Manage staff accounts and visibility, scoped strictly to their own municipality |
| **Platform super admin** | SecLuva operator | Onboard new municipalities, monitor platform health, no routine access to citizen content |
| **[Future]** Field crew / contractor | Assigned to physically resolve an incident | Work-order view, not required for MVP |

### 1.5 Functional Requirements

MVP requirements are the smallest set that proves the core loop — submit, deduplicate, triage, resolve — works end to end for one or more tenants. Everything else is deferred.

| ID | Requirement | Status |
|---|---|---|
| FR-01 | Citizen submits a report: category, description, optional photo, location (map pin or device GPS), no mandatory account | **[Confirmed]** MVP |
| FR-02 | System retrieves candidate existing incidents within a configurable radius, same tenant, same/compatible category | **[Confirmed]** MVP |
| FR-03 | System scores each candidate using distance + text similarity and derives a match decision | **[Confirmed]** MVP |
| FR-04 | High-confidence match auto-links the report to the existing incident | **[Confirmed]** MVP |
| FR-05 | Mid-confidence match is placed in a staff review queue, not auto-decided | **[Confirmed]** MVP |
| FR-06 | No sufficient match creates a new consolidated incident | **[Confirmed]** MVP |
| FR-07 | Staff view incident list/detail, filterable by status and category, with every linked original report visible | **[Confirmed]** MVP |
| FR-08 | Staff resolve the ambiguous-match queue: confirm, reject, or re-link to a different incident | **[Confirmed]** MVP |
| FR-09 | Staff update incident status through a defined lifecycle (submitted → acknowledged → in progress → resolved) | **[Confirmed]** MVP |
| FR-10 | Staff can undo/correct a wrong association without losing or editing the original report content | **[Confirmed]** MVP |
| FR-11 | Citizen looks up report/incident status via a tracking code, no login required | **[Confirmed]** MVP |
| FR-12 | Municipality admin manages staff accounts scoped strictly to their own tenant | **[Confirmed]** MVP |
| FR-13 | Every automatic or manual match decision is recorded with its score and signals (auditability) | **[Confirmed]** MVP |
| FR-14 | Citizen SMS/email notifications on status change | **[Future]** |
| FR-15 | Public map of open incidents | **[Future]** |
| FR-16 | Citizen "I see this too" confirmation on an existing incident | **[Future]** |
| FR-17 | Embedding-based semantic similarity, multilingual (Nepali) support | **[Future]** |
| FR-18 | Municipality performance analytics dashboard | **[Future]** |
| FR-19 | Native mobile app | **[Future]** |

### 1.6 Non-Functional Requirements

| Category | Requirement | Status |
|---|---|---|
| Tenant isolation | Every tenant-scoped query enforced server-side; zero cross-tenant data access, verified by automated tests | **[Confirmed]** |
| Auditability | Match decisions and status changes immutable and attributable (who/what/when/why) | **[Confirmed]** |
| Data integrity | Original citizen report content is never edited or deleted once submitted, even after merge/reclassification | **[Confirmed]** |
| Performance | Dedup scoring completes in <2s (p95) per submitted report | **[Recommended]** |
| Accuracy | Baseline matcher reaches ≥80% precision / ≥70% recall on a hand-labeled test set (≥120 report pairs) | **[Recommended target]** |
| Usability | Citizen submission form usable one-handed on a mobile browser in under a minute | **[Recommended]** |
| Scalability | Indexing strategy supports ≥5 tenants × ~500 reports each without redesign | **[Recommended]** |
| Availability | Single-instance deployment; no HA/uptime SLA required for an academic MVP | **[Assumption]** |
| Maintainability | Feature modules (reports, incidents, dedup, auth, tenants) independently testable within the monolith | **[Confirmed]** |

### 1.7 Business Rules & Constraints

- A **Citizen Report** is raw, immutable input. A **Consolidated Incident** is the derived, staff-facing entity representing one real-world problem. Reports reference an incident; they are never merged away or rewritten.
- Duplicate candidate search is always scoped to a single tenant — a report in Municipality A can never match an incident in Municipality B, regardless of geographic proximity across a shared border.
- An incident is created automatically only when no candidate scores above the lower decision threshold; this keeps incident creation unsupervised by default and low-risk.
- Only staff roles may manually re-link or unlink a report from an incident. Citizens cannot alter associations.
- Every match decision — automatic or manual — stores its evidence (distance, similarity score, category match, decision threshold used) so staff and auditors can see *why*, not just *what*.
- Incident status follows a defined forward-moving lifecycle; staff can correct a prior status entry but each transition is logged, not overwritten silently.
- **Program requirement:** per the department's project guidelines, core algorithmic modules must be the student's own implementation rather than a predefined library/API/plugin, except where genuinely unavoidable (web framework, database driver, cryptography, UI rendering). This rules out pre-built NLP/similarity libraries and pre-trained embedding models for the matching engine specifically — distance scoring (Haversine) and text similarity (TF‑IDF + cosine) are hand-implemented in `server/src/dedup/`. It does not apply to general infrastructure (Express, React, `pg`, bcrypt, JWT) or to reference *data* (e.g. the municipality list) — only to the algorithmic modules that are the project's actual contribution.

### 1.8 Assumptions to Validate

- **Location accuracy:** citizen-provided GPS/pin placement is accurate to roughly 20–50m — good enough for radius-based candidate retrieval without additional correction.
- **Single photo is sufficient** per report for MVP; no multi-photo gallery needed.
- **One fixed category taxonomy** (pothole, streetlight, fallen tree, water leak, garbage pile, + "other") covers the pilot scope; no per-municipality custom categories in MVP.
- **Anonymous reporting is acceptable** — no legal requirement to collect citizen PII to accept a report; a tracking code substitutes for an account.
- **Staff will actively work the review queue** — MVP has no SLA escalation or reminder system if ambiguous matches pile up unreviewed.

### 1.9 Open Questions

- Does your institution require a specific diagram notation for the written report (e.g. Chen-notation ERD, leveled DFDs)? This shapes how Phase 3's diagrams should be drawn.
- Should the capstone defense demo show ≥2 municipalities with isolated data live, or is a single tenant with the multi-tenant *architecture* proven (via tests/code) acceptable?
- Is photo evidence mandatory or optional on report submission?
- What duplicate-search radius should we start calibrating from — 50m and 100m are both defensible starting points and will be tuned empirically in Phase 6/10.
- The project now uses PostgreSQL + PostGIS instead of the originally-stated MongoDB — if there's an already-approved proposal document on file with your institution naming "MERN/MongoDB" specifically, confirm the substitution doesn't need re-approval before Phase 3 work proceeds.

---

## Phase 2 — Scope Definition & Project Initiation

### 2.1 Objectives & Success Criteria

| Objective | Measurable success criterion |
|---|---|
| Working end-to-end multi-tenant demo | Citizen submits → dedup runs → staff triages → incident resolves, across isolated tenant data, in a live or recorded demo |
| Baseline dedup engine is defensible | Precision ≥80%, recall ≥70% measured on a labeled test set, with results documented even if targets aren't fully hit |
| Tenant isolation is provably enforced | Automated test suite asserting zero cross-tenant reads/writes passes in CI |
| Delivered within the academic timeline | 16-week milestone roadmap (§2.7) met with documented scope trims where needed |

### 2.2 MVP Scope vs. Out of Scope

| In scope (MVP) | Out of scope (deferred) |
|---|---|
| Citizen report submission + tracking code | Citizen accounts, login, report history |
| Geo + text baseline dedup engine | Embedding/ML-based semantic matching |
| Staff review queue + manual correction | SLA timers, automated escalation/reminders |
| Incident status lifecycle | Field-crew/work-order assignment |
| Multi-tenant data isolation (server-enforced) | Per-tenant custom category taxonomies |
| English-only text processing | Nepali / multilingual NLP |
| Audit log of match & status decisions | Public-facing analytics dashboard |
| Local/free-tier file storage for photos | CDN-backed media pipeline, image moderation |

### 2.3 User Stories & Acceptance Criteria

| ID | Story | Acceptance criteria | Pri. |
|---|---|---|---|
| US-01 | As a citizen, I submit a report with category, description, optional photo, and location, without an account | Report persisted with tenantId + status=submitted; a tracking code is returned | P0 |
| US-02 | As a citizen, I check status via tracking code | Lookup by code returns current incident status, no login required | P0 |
| US-03 | As the system, I score candidate incidents on submission | Scoring completes near-real-time; score breakdown stored, not just the final verdict | P0 |
| US-04 | As the system, I auto-link a high-confidence match | Score ≥ auto-link threshold sets report.incidentId automatically; audit entry created | P0 |
| US-05 | As staff, I review ambiguous matches in a queue | Queue lists mid-range-score reports; action (confirm/reject/re-link) updates state + audit log | P0 |
| US-06 | As staff, I correct a wrong auto-association | Unlink is reversible; original report content is untouched; before/after logged | P0 |
| US-07 | As staff, I advance an incident's status | Transitions follow the defined state machine; history keeps timestamp + actor | P0 |
| US-08 | As an incident, I show every linked report | Incident detail view lists all linked reports with original text/photo/timestamp intact | P0 |
| US-09 | As a municipality admin, I manage my own staff accounts only | Admin API scoped to own tenantId; cross-tenant access attempts return 403/404 | P0 |
| US-10 | As a platform admin, I onboard a new municipality | Creates tenant + first admin user, isolated from existing tenants' data by default | P1 |

### 2.4 Risks & Mitigations

| Risk | Likelihood / Impact | Mitigation |
|---|---|---|
| Baseline text similarity too weak on short/vague descriptions ("pothole", "big hole") | Med / High | Weight distance + category alongside text; tune thresholds against a seeded test set; review queue as the safety net |
| Browser geolocation inaccurate or permission denied | Med / Med | Manual map-pin fallback; start with a wider radius and narrow once calibrated |
| 16-week timeline insufficient for the full spec | High / High | MVP trimmed per §2.2; defer admin polish and advanced NLP explicitly to "future work" in the written report |
| False-positive auto-merge hides a real distinct incident | Med / High | Keep auto-link threshold conservative by default, configurable; every decision logged for traceability |
| Free-tier hosting (DB/app) hits storage limits or cold-starts during a live demo | Low–Med / Med | Seed data deliberately; warm the deployment before defense; document the limitation and upgrade path |

### 2.5 Dependencies & Technical Uncertainties

- Choice of baseline similarity measure (TF-IDF + cosine vs. Dice/Jaccard token overlap) needs a short early spike before Phase 6 is finalized — it changes how thresholds get calibrated in Phase 10.
- Final free-tier hosting target (Render/Railway/Fly.io for the API, Vercel/Netlify for the frontend, Neon/Supabase for PostgreSQL+PostGIS) isn't locked yet — affects Phase 12 specifics only, not the architecture.
- Institution's required report/diagram format (open question, §1.9) could add documentation work not currently budgeted in the roadmap.

### 2.6 Prioritized Backlog (epic level)

| Pri. | Epic |
|---|---|
| P0 | Auth + tenant isolation foundation |
| P0 | Citizen report submission (API + form) |
| P0 | Geospatial + category candidate retrieval |
| P0 | Baseline text-similarity scoring |
| P0 | Auto-link / queue / new-incident decision logic |
| P0 | Staff duplicate review queue |
| P0 | Incident status lifecycle management |
| P0 | Audit logging across match + status decisions |
| P1 | Municipality / staff admin management |
| P1 | Citizen tracking-code lookup UI |
| P1 | Staff dashboard filtering/search |
| P2 | **[Future]** Notifications, public map, analytics, multilingual NLP, mobile app |

Granular, dependency-ordered task breakdowns (Phase 11 style, with definitions of done) will follow once Phase 3's domain model is locked — breaking tasks down before the entities are fixed risks rework.

### 2.7 Milestone Roadmap — 16 Weeks (dated)

Dates assume a start of **2026-10-20**. If Dashain/Tihar or any other break falls inside a week below, shift everything after it by however many days you lose — the dependency order matters more than the exact dates.

| Week | Dates | Focus | Concrete deliverable | Depends on |
|---|---|---|---|---|
| 1 | Oct 20–26, 2026 | Domain model + environment | ERD for Tenant/User/CitizenReport/Incident/Category/StatusHistory/Attachment/AuditLog locked; Postgres provisioned (Neon/Supabase) with PostGIS enabled; first migration creates `municipalities_master`, `municipalities`, `users` | — |
| 2 | Oct 27–Nov 2, 2026 | Auth + tenant foundation | `UserModel.js` implemented (create/find); bcrypt + JWT login; tenant-scoping middleware; `Login.jsx`/`Register.jsx` wired to real endpoints (replacing the placeholder pages) | Wk 1 |
| 3 | Nov 3–9, 2026 | Citizen report submission | `CitizenReportModel.js` implemented with a `geography(Point,4326)` column; submission API (category, description, photo via multer, location); citizen report form in React; tracking code generated on submit | Wk 2 |
| 4 | Nov 10–16, 2026 | Baseline dedup engine v1 | `Filtering.js` (own bounding-box + Haversine candidate retrieval) and `TextMatching.js` (own TF‑IDF + cosine similarity) implemented; combined score + auto-link/queue/new-incident decision; a ~20-pair hand-labeled sanity test | Wk 3 |
| 5 | Nov 17–23, 2026 | Incident + review queue backend | `ConsolidatedIncidentModel`, `StatusHistoryModel`, `AuditLogModel`; incident list/detail API; review-queue API; confirm/reject/re-link endpoints | Wk 4 |
| 6 | Nov 24–30, 2026 | Staff dashboard frontend | Staff-only incident list/detail pages, review queue UI, status-update UI | Wk 5 |
| 7–8 | Dec 1–14, 2026 | Admin, audit, core-loop polish | Municipality admin staff management (tenant-scoped); audit log viewer; citizen tracking-code lookup page; bug-fix pass on the full submit→dedup→triage→resolve loop | Wk 6 |
| 9–10 | Dec 15–28, 2026 | Testing | Unit tests on the dedup scoring function; API integration tests; automated tenant-isolation test suite; labeled test set expanded to 120+ pairs, precision/recall measured and thresholds tuned | Wk 7–8 |
| 11 | Dec 29, 2026–Jan 4, 2027 | Security hardening | Input validation audit, rate limiting, helmet/CORS review, Postgres RLS policies added, secrets/config review | Wk 9–10 |
| 12–13 | Jan 5–18, 2027 | Deployment | DB on Neon/Supabase, API on Render/Railway, frontend on Vercel/Netlify; municipality reference data seeded; smoke test in the deployed environment | Wk 11 |
| 14 | Jan 19–25, 2027 | Documentation & report | ERD/class/sequence/activity diagrams finalized for the written report; Chapter 3 content written; API docs | Wk 12–13 |
| 15 | Jan 26–Feb 1, 2027 | Buffer | Catch up on anything that slipped; UI polish | Wk 14 |
| 16 | Feb 2–8, 2027 | Defense prep | Demo rehearsal, Q&A prep, final bug sweep | Wk 15 |

**Week 1 checklist — the part you can start on right now:**
- [ ] Draw the ERD: `municipalities_master` (the full 293-list reference table), `municipalities` (actual onboarded tenants), `users`, `citizen_reports`, `consolidated_incidents`, `issue_categories`, `status_history`, `attachments`, `audit_log` — with their foreign keys.
- [ ] Create a free Postgres instance (Neon or Supabase). No PostGIS extension needed — plain numeric lat/lng columns are enough.
- [ ] Write the first migration file (`node-pg-migrate`) for just three tables: `municipalities_master`, `municipalities`, `users`.
- [ ] Add a `server/src/db.js` (a `pg` connection pool) and one test route that runs `SELECT NOW()` to confirm the server can actually reach the database.

---

## Architecture Preview (full Phase 4 detail deferred)

Enough to validate the stack and module boundaries now, without committing to folder structure or API contracts before the domain model (Phase 3) is locked.

### Why a Modular Monolith

**Recommended approach:** one Express application, organized into feature modules (reports, incidents, dedup, auth, tenants, audit), each with its own routes/controllers/services/models, sharing one deploy unit and one database connection.

**Why it fits:** a solo/small-team, zero-budget, 16-week academic build has no spare capacity for distributed-systems overhead — service discovery, inter-service auth, multiple deploy targets. A monolith with clean internal module boundaries gets the same organizational clarity without that tax, and can be split later if real deployment scale ever demanded it.

**Alternatives considered:** microservices (rejected — ops overhead and multi-service hosting cost aren't justified at this scale or budget); serverless functions per endpoint (rejected — cold starts work against the <2s dedup-scoring target, and local dev/testing is more awkward for a student team).

**Trade-off:** all modules share one deploy unit, so a defect in one can affect the others' uptime — mitigated by strong per-module test coverage (Phase 10) and keeping boundaries clean enough that extraction later stays cheap.

### Component Map

```
                 Frontend — React (Vite)
        ┌───────────────┬───────────────┬───────────────┐
        │  Citizen UI    │   Staff UI     │   Admin UI     │
        └───────────────┴───────────────┴───────────────┘
                              │
                 REST / JSON over HTTPS
                              ▼
   Express API — Auth MW → Tenant-scope MW → Rate limit / validation
                              │
                              ▼
            Feature modules (modular monolith)
   ┌─────────┬───────────┬────────────┬──────────────┬───────────┐
   │ Reports │ Incidents │Dedup Engine│Tenants/Admin │ Audit Log │
   └─────────┴───────────┴────────────┴──────────────┴───────────┘
                              │
                              ▼
   ┌─────────────────────────────────┐   ┌───────────────────────────┐
   │ PostgreSQL (Neon/Supabase)        │   │ File storage                │
   │ tenant_id scoping + RLS ·        │   │ local disk (multer) →       │
   │ lat/lng columns + hand-written   │   │ cloud, later                │
   │ Haversine distance               │   │                              │
   └─────────────────────────────────┘   └───────────────────────────┘
```

### Technology Stack & Justification

| Layer | Choice | Why | Status |
|---|---|---|---|
| Frontend | React + Vite | Spec-mandated; Vite gives fast dev iteration over CRA | **[Confirmed]** |
| Mapping | Leaflet + react-leaflet + OpenStreetMap tiles | Free, no API key, sufficient for pin-drop and display at this scale | **[Recommended]** |
| Backend | Node.js + Express | Spec-mandated; natural fit for a modular monolith | **[Confirmed]** |
| Database access | `pg` (node-postgres) — parameterized SQL in a repository/data-access layer per module | No ORM: direct control over every query, including PostGIS spatial SQL (`ST_DWithin`), with no geometry-type abstraction gap to work around | **[Confirmed]** |
| Migrations | `node-pg-migrate` (versioned SQL/JS migration files) | Schema versioning without pulling in an ORM's migration engine | **[Recommended]** |
| Auth | jsonwebtoken + bcrypt | Stateless JWT suits a single monolith without a session store; bcrypt for password hashing | **[Recommended]** |
| Validation | express-validator | Input validation at the API boundary (Phase 9 requirement) | **[Recommended]** |
| Hardening | helmet, cors, express-rate-limit | Baseline security posture out of the box | **[Recommended]** |
| File upload | multer → local disk | Zero cost for MVP; swappable for cloud object storage without touching the API shape | **[Recommended]** |
| Text similarity | Hand-written TF‑IDF + cosine similarity (`server/src/dedup/TextMatching.js`) | Own implementation per the program's no-predefined-APIs rule for core modules; TF‑IDF/cosine is simple enough to implement and explain from first principles in the report | **[Confirmed — program requirement]** |
| Geospatial | Plain `latitude`/`longitude` numeric columns + hand-written bounding-box pre-filter (SQL) + hand-written Haversine distance (`server/src/dedup/Filtering.js`) | Same reason: the matching algorithm is the project's core contribution, so distance calculation must be your own code, not a database extension function. A numeric bounding-box filter + exact Haversine in JS performs fine at this project's scale | **[Confirmed — program requirement]** |
| Logging | winston + morgan | App-level and HTTP-request logging | **[Recommended]** |
| Testing | Jest + Supertest, React Testing Library | Standard testing pair, covers API and component layers | **[Recommended]** |
| DB hosting | Neon or Supabase free tier (Postgres, PostGIS available) | Fits zero budget; Supabase also bundles free object storage if we later move photos off local disk | **[Recommended]** |
| App hosting | Render/Railway (API) + Vercel/Netlify (frontend) | Free tiers; final pick deferred to Phase 12 | **[Assumption]** |

**Postgres-specific notes:**
- PostGIS is **not used for MVP** — distance filtering runs on plain numeric lat/lng columns with a hand-written Haversine function instead, to satisfy the program's own-implementation requirement (see §1.7). PostGIS stays a reasonable *future* upgrade path only if report volume ever grows large enough that spatial indexing meaningfully outperforms a bounding-box pre-filter.
- Beyond app-level tenant-scoping middleware, PostgreSQL **Row-Level Security (RLS)** policies keyed on a session variable (e.g. `app.current_tenant_id`) are a strong, low-cost defense-in-depth layer for the zero-cross-tenant-leakage requirement in §1.6 — recommended for Phase 9, enforced at the database itself rather than relying solely on application code.
- The relational model (clear FK chains: Report → Incident → Tenant; Incident → StatusHistory; Report → Attachment) and ACID transactions fit this domain's "reassign a report to a different incident, log it atomically" operations more naturally than a document store would.
- No ORM is used. Each feature module (reports, incidents, dedup, tenants, audit) owns a small repository/data-access file with its own parameterized SQL — this also keeps the hand-written matching logic free of any ORM or spatial-extension abstraction, consistent with the program's own-implementation requirement.

---

## Recommended Next Task

**Phase 3 — Domain Modeling & Business Logic.** Lock the entity set (Tenant, User, CitizenReport, ConsolidatedIncident, IssueCategory, StatusHistory, Attachment, AuditLog), their relationships, and the state machine for report → incident association before touching Phase 4 folder structure, Phase 5 schemas, or Phase 6 scoring logic — all three depend directly on this model, and getting it wrong here is the most expensive place to get it wrong.
