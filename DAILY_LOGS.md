# App Wrapper Store - Daily Logs v3

## Log template (required)

- Date (UTC)
- Focus area
- Changes completed
- Failures observed
- Root cause
- Fix applied
- Verification evidence
- Prevention action
- Next actions

---

## 2026-04-09

**Focus:** Masterplan v3 implementation baseline (G1/G2/G3/G4 foundations)

### Completed changes

- Implemented frontend error architecture with typed `UiError` model.
- Added global error banner and inline scoped error components with retry.
- Removed alert-based error reporting and replaced with UI-visible failure flow.
- Standardized backend error responses to `{ code, message, details?, traceId? }`.
- Added request trace IDs via middleware and structured JSON logging.
- Added SQLite-backed persistence layer for apps, builds, sources, and build logs.
- Added source adapter contract and GitHub adapter implementation.
- Added scaffold adapters for F-Droid, GitLab, and custom sources.
- Added source validation, source attach, and update-check endpoints.
- Added backend integration tests and frontend unit/component tests.
- Added CI workflow, release dry-run workflow, and Fastlane scaffolding.
- Added debug playbook, source matrix, release checklist, and issue templates.

### Failures observed

- Missing frontend/ backend directories during parallel file writes (race condition).
- File lock while editing backend entrypoint during active process.
- Node-engine warnings on initially installed package versions.

### Root causes

- Parallel tool calls attempted writes before directory creation completed.
- Process retained handle on edited file.
- Package versions auto-resolved to ranges with stricter Node requirements.

### Fixes applied

- Switched to ordered directory creation and sequential writes for dependent files.
- Stopped active node watcher processes before rewriting locked files.
- Pinned compatible package versions (`vitest@0.34.6`, `jsdom@22.1.0`, `sqlite3@5.1.7`).

### Verification evidence

- Local checks expected and executed after implementation:
  - Frontend: lint, build, test
  - Backend: build, test
  - App generator: build
- CI workflows committed to run equivalent checks on PR/main.

### Prevention actions

- Added deterministic CI checks for all modules.
- Added debug/release runbooks and issue template requiring trace IDs.
- Added explicit release checklist and DoD criteria in tracker docs.

### Next actions

1. Implement production-grade F-Droid/GitLab adapters.
2. Add source/update frontend screens.
3. Expand regression tests to full end-to-end flows.
4. Integrate signed artifact publishing in release lane.

---

## 2026-04-09 (Alignment + Saferails pass)

**Focus:** Remove repo/documentation misalignment and implement missing guardrails.

### Completed changes

- Rewrote `README.md`, `docs/ARCHITECTURE.md`, and `docs/CONTRIBUTING.md` to match real module layout and commands.
- Added PR checklist template at `.github/pull_request_template.md`.
- Added `docs/SAFERAILS.md` with runtime, CI, and process guardrail definitions.
- Added `docs/FUTURE_RESEARCH_BACKLOG.md` to convert research themes into scoped work.
- Added backend request-size and string-length guardrails.
- Added backend build concurrency guard to block overlapping builds per app.
- Extended backend integration tests for new guardrail behaviors.

### Failures observed

- Documentation drift (outdated setup commands, stale architecture claims, encoding artifacts).
- Build endpoint allowed concurrent build requests for the same app.
- API accepted unbounded string payload lengths for key fields.

### Root causes

- Earlier rapid implementation cycles prioritized feature delivery over doc consistency.
- No explicit concurrency gate in build trigger route.
- Validation logic checked presence/type but not size constraints.

### Fixes applied

- Introduced docs refresh and contributor template guardrails.
- Added `getActiveBuildForApp()` repository query + `CONFLICT` response path.
- Added `express.json({ limit: '256kb' })` and bounded field validation for app/source inputs.

### Verification evidence

- Backend: `npm run build` and `npm test` pass with new tests.
- Frontend: `npm run lint`, `npm run build`, `npm test` pass.
- App generator: `npm run build` pass.
- Manual API debug confirms blocked overlapping builds and detailed readiness errors.

### Prevention actions

- Added dedicated saferail documentation and PR checklist.
- Added task tracker items for ongoing adapter hardening and policy checks.
- Established research backlog cadence to reduce future architecture drift.

### Next actions

1. Execute R1/R2 research backlog into concrete adapter and verification implementation tasks.
2. Add CI policy checks for target SDK and release artifact type.
3. Add e2e tests for failure visibility across create/source/update/build flow.

---

## 2026-04-09 (Research execution continuation)

**Focus:** Convert research backlog into concrete implementation-ready steps.

### Completed changes

- Created `docs/research/RESEARCH_EXECUTION_PLAN.md` with phased execution and exit criteria.
- Created `docs/research/R1_METHODS_SCORECARD_2026-04-09.md` with preliminary method scoring and recommendation.
- Created `docs/research/R2_TRUST_MODEL_2026-04-09.md` with deterministic status mapping and test matrix.
- Created `docs/research/R3_POLICY_AUTOMATION_2026-04-09.md` with CI gate design and acceptance criteria.
- Updated `docs/FUTURE_RESEARCH_BACKLOG.md` with status snapshot and immediate next steps.
- Updated `TASK_TRACKER.md` and `META_PLAN.md` to tie research outputs to execution tasks.
- Added initial policy automation prototype:
- `policy/android-play-policy.json`
- `app-generator/scripts/check-play-policy.mjs`
- CI invocation via `npm run policy:check` in app-generator job.

### Failures observed

- None in code/runtime during this research pass.

### Root cause

- Not applicable.

### Fixes applied

- Not applicable.

### Verification evidence

- Sources gathered from official docs for Android, Chrome TWA, Capacitor, and Cordova.
- Retrieved and recorded source evidence on 2026-04-09 in each research artifact.
- Policy checker passes locally with sample metadata fixture.

### Prevention actions

- Added explicit research artifacts and cadence to avoid topic-only backlog drift.
- Added implementation-oriented acceptance criteria in research docs.

### Next actions

1. Start prototype runs for WebView/TWA/Capacitor/Cordova under shared acceptance checks.
2. Extend policy checker with failing fixtures and add assertion tests.
3. Convert R2 trust matrix directly into backend adapter code tasks.

## 2026-04-14 - R2 trust normalization slice

### Work completed

- Added `backend/src/services/artifact-verification.ts` to calculate shared trust signals and deterministic verification states.
- Extended the source adapter contract so verification now receives release metadata plus packaging/distribution context.
- Updated the GitHub adapter to normalize digest metadata into `integrity`, derive trust signals, and block APK-only artifacts for Play-targeted apps.
- Added `backend/src/test/update-service.test.ts` for verified, unverified, and policy-blocked update selection scenarios.
- Updated `TASK_TRACKER.md` so Q8 now reflects the remaining non-GitHub adapter work.

### Failures observed

- None in this pass.

### Root cause

- Not applicable.

### Fixes applied

- Installed backend dependencies and executed focused backend tests + build in this worktree.

### Verification evidence

- Manual diff review confirms update checks now pass app packaging context into adapter verification.
- New unit tests encode the R2 matrix for verified checksum, missing checksum, and Play-policy incompatibility.
- `npm test -- src/test/update-service.test.ts src/test/gitlab-source-adapter.test.ts` passed (7 tests).
- `npm run build` passed for backend.

### Prevention actions

- Centralized trust-state calculation in one service to avoid adapter-specific drift in verification rules.

### Next actions

1. Implement real trust-signal extraction and release parsing for F-Droid/custom adapters.
2. Add API integration coverage asserting the update payload exposes the new trust fields.
3. Decide whether custom adapter should consume signed manifest files or direct artifact endpoints first.

## 2026-04-14 - GitLab adapter execution slice

### Work completed

- Added `backend/src/adapters/gitlab-source-adapter.ts` with project validation, metadata fetch, release parsing, artifact normalization, and trust verification via shared evaluator.
- Wired GitLab into `backend/src/services/source-registry.ts`, replacing the scaffold placeholder for `gitlab`.
- Updated `backend/src/adapters/fdroid-source-adapter.ts` to use shared verification logic instead of always returning blocked.
- Added `backend/src/test/gitlab-source-adapter.test.ts` covering URL normalization, release artifact mapping, and Play-policy blocking.

### Failures observed

- None.

### Root cause

- Not applicable.

### Fixes applied

- Implemented first non-GitHub production adapter path and connected it to shared trust-state policy.

### Verification evidence

- `npm test -- src/test/update-service.test.ts src/test/gitlab-source-adapter.test.ts` succeeded.
- `npm run build` succeeded in `backend`.

### Prevention actions

- Added adapter-focused tests to reduce regression risk when expanding F-Droid/custom support.

### Next actions

1. Implement F-Droid release ingestion + trust-signal extraction.
2. Define and implement custom-source release contract (manifest vs direct artifacts).
3. Add API integration tests that assert `integrity` and `trustSignals` fields in update payloads.

## 2026-04-14 - F-Droid and custom adapter execution slice

### Work completed

- Replaced `backend/src/adapters/fdroid-source-adapter.ts` scaffold behavior with real index parsing from `index-v1.json` and normalized APK release mapping.
- Added `backend/src/adapters/custom-source-adapter.ts` with manifest-driven release ingestion (`releases[].artifacts[]`) and trust-signal-compatible artifact normalization.
- Wired custom adapter into `backend/src/services/source-registry.ts` and improved source type inference in `backend/src/index.ts` to auto-detect GitLab URLs.
- Added `backend/src/test/fdroid-source-adapter.test.ts` and `backend/src/test/custom-source-adapter.test.ts` to verify parsing and normalization behavior.

### Failures observed

- None.

### Root cause

- Not applicable.

### Fixes applied

- Implemented baseline non-GitHub/non-GitLab ingestion paths to remove remaining scaffold-only trust flow for F-Droid/custom.

### Verification evidence

- `npm test -- src/test/update-service.test.ts src/test/gitlab-source-adapter.test.ts src/test/fdroid-source-adapter.test.ts src/test/custom-source-adapter.test.ts` passed (11 tests).
- `npm run build` passed in `backend`.

### Prevention actions

- Added dedicated adapter tests so future parser hardening can be done without regressing trust-state mapping behavior.

### Next actions

1. Add API integration tests asserting `integrity` and `trustSignals` are present on update payload artifacts.
2. Harden adapter parsing for malformed timestamps/checksums and mixed artifact sets.
3. Add CI task coverage for the expanded adapter trust test set.

## 2026-04-14 - Test scenarios and user journeys baseline

### Work completed

- Added `docs/TEST_SCENARIOS_AND_USER_JOURNEYS.md` with 8 core journeys (app create, source onboarding, update trust, build guardrails, frontend error UX, and full lifecycle).
- Added scenario matrix mapping each scenario to automation status (`Yes`/`No next`) and test level (unit/integration/e2e).
- Linked the new document from `README.md` in Key Documentation.

### Failures observed

- None.

### Root cause

- Not applicable.

### Fixes applied

- Converted implicit QA expectations into explicit reusable journeys and acceptance outcomes.

### Verification evidence

- Backend validation completed: `npm test` and `npm run build` passed in `backend`.
- Frontend validation completed: `npm run lint`, `npm test`, and `npm run build` passed in `frontend`.

### Prevention actions

- Scenario coverage map now highlights unautomated but critical flows (`S7`, `S8`) to prevent test blind spots.

### Next actions

1. Implement API integration tests for update payload trust fields.
2. Introduce browser E2E for full lifecycle journey (J8).
3. Add malformed source fixtures for parser hardening.
