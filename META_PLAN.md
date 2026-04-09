# App Wrapper Store - Meta Plan v3

## Vision

Open, modular, Android-first app wrapper platform with flexible source adapters, transparent failure reporting, and reproducible delivery pipelines.

## Product principles

- Open architecture: adapter-based source integrations, no source lock-in.
- Monolith-first modularity: keep one deployable backend, isolate modules by contract.
- Reliability over feature sprawl: Android release confidence is the first objective.
- Error transparency: every critical failure must be visible in UI and traceable in logs.
- Test-gated delivery: PR merge and release require explicit check gates.

## Locked decisions

1. Android reliability is the primary milestone.
2. CI/CD standard: GitHub Actions + Fastlane.
3. Persistence strategy: SQLite-first with repository abstraction for later PostgreSQL migration.
4. Error UX standard: global banner + inline module error with retry.

## Milestones

### G1 (2026-04-09 to 2026-04-15) - Error transparency and planning refactor

- Implement `UiError` model and scoped/global error architecture in frontend.
- Replace alert/console-only failures with actionable UI error blocks.
- Standardize backend error payload contract: `{ code, message, details?, traceId? }`.
- Add tests for error store and error components.

Acceptance gates:

- Every API failure is visible in UI (global and scoped).
- Backend returns `traceId` on error responses.
- Frontend lint/build/test and backend build/test are green.

### G2 (2026-04-16 to 2026-04-22) - Modular source adapters

- Introduce source adapter interface and source matrix.
- Ship GitHub adapter implementation.
- Scaffold F-Droid/GitLab/custom adapters with explicit status and reasons.
- Add source validation and app-source attachment endpoints.

Acceptance gates:

- Source URL can be validated and attached to an app.
- Release metadata can be normalized from GitHub source.

### G3 (2026-04-23 to 2026-04-29) - Update trust and artifact selection

- Add update check endpoints and deterministic artifact selection.
- Add verification states (`verified`, `unverified`, `blocked`).
- Return blocked reasons for non-installable release states.

Acceptance gates:

- Update-check result is deterministic and includes explicit reason for blocked state.
- Android artifact prioritization is stable (`apk` -> `aab`).

### G4 (2026-04-30 to 2026-05-06) - Delivery pipeline

- Add CI workflow for frontend/backend/app-generator.
- Add Fastlane scaffolding with Android release lane and iOS scaffold lane.
- Add release checklist and dry-run workflow.

Acceptance gates:

- CI passes on PR and main.
- Fastlane dry run executes in release workflow.

### G5 (2026-05-07 to 2026-05-14) - Stabilization and operations

- Add debug playbook and bug-report template.
- Enforce root-cause + prevention logging workflow.
- Prioritize regression coverage for core flows.

Acceptance gates:

- No open P0/P1 defects for release candidate.
- Release checklist and daily logs are updated for each stabilization cycle.

### Alignment and Saferail Sprint (2026-04-09 to 2026-04-12) - Repo consistency and risk reduction

- Refresh core docs (`README`, `ARCHITECTURE`, `CONTRIBUTING`) to match actual code and commands.
- Add contributor/process guardrails via PR template and dedicated saferail guide.
- Introduce API-level guardrails for oversized payloads and field-length validation.
- Introduce build concurrency protection to prevent overlapping build states.
- Publish future research backlog to turn open questions into scoped implementation tasks.

Acceptance gates:

- Core docs are accurate, readable, and free from encoding artifacts.
- Build trigger returns deterministic `CONFLICT` for overlapping app builds.
- Input guardrails reject over-limit payload fields with validation errors.
- Research backlog and task tracker are synchronized with next implementation steps.

## Public interface commitments

- `ErrorScope`: `global | create-app | load-apps | build-app | delete-app | source-validate | update-check | release`
- `UiError`: `{ id, scope, code, message, details?, traceId?, retryable, createdAt, category }`
- Frontend store actions: `pushError`, `clearError`, `clearScope`, `clearAllErrors`
- Source adapter contract: `validate`, `fetchMetadata`, `listReleases`, `pickInstallableArtifact`, `verifyArtifact`
- Backend API error format: `{ code, message, details?, traceId? }`

## KPI targets

- API p95 response: < 300 ms for app CRUD
- Build trigger success: > 99%
- Visible-error compliance: 100% for critical failures
- CI pass rate on main: > 95%
- P0/P1 aging: 0 open defects at release checkpoint

## Operating cadence

- Daily: triage errors, update daily log, close blockers.
- Weekly: review milestone gates, regression status, and release-readiness.
- Per release: run checklist in `docs/RELEASE_CHECKLIST.md`.
