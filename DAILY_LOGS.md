# App Wrapper Store - Daily Logs

## Logging format

Each entry should stay concise and include:

- Date (UTC)
- Focus
- Outcomes
- Verification
- Next actions

---

## 2026-04-09

**Focus:** Baseline architecture and saferail rollout (G1-G4 foundations)

**Outcomes**

- Implemented frontend scoped/global error model and backend standardized error payload with trace IDs.
- Landed SQLite persistence for apps/builds/sources/logs and source adapter contract with GitHub baseline.
- Added source validation/attachment/update-check endpoints and build readiness/concurrency guardrails.
- Added CI + release dry-run workflows, Fastlane scaffolding, and core operational docs.
- Published research and policy automation artifacts (`R1/R2/R3`, Play policy checker).

**Verification**

- Frontend lint/build/test paths established and passing in CI workflow.
- Backend build/test paths established and passing in CI workflow.
- App-generator build + policy check path established.

**Next actions**

1. Replace scaffold adapters with real release parsers.
2. Expand regression coverage to end-to-end app lifecycle.

---

## 2026-04-14

**Focus:** Trust-model execution and multi-source adapter hardening (G5-T7/G5-T9)

**Outcomes**

- Added shared trust evaluator (`backend/src/services/artifact-verification.ts`) with normalized signals:
  - `installable`
  - `checksumPresent`
  - `sourceMetadataCoherent`
  - `policyCompatible`
- Extended adapter verification contract to include release + packaging context.
- Hardened update selection flow to skip blocked artifacts and continue deterministic fallback selection.
- Implemented production adapter paths:
  - GitHub: digest/integrity normalization + trust mapping.
  - GitLab: project/release parsing + artifact normalization.
  - F-Droid: `index-v1.json` ingestion + APK release normalization.
  - Custom: manifest-driven `releases[].artifacts[]` ingestion.
- Added adapter and update-service unit coverage:
  - `backend/src/test/update-service.test.ts`
  - `backend/src/test/gitlab-source-adapter.test.ts`
  - `backend/src/test/fdroid-source-adapter.test.ts`
  - `backend/src/test/custom-source-adapter.test.ts`
- Added QA planning docs:
  - `docs/TEST_SCENARIOS_AND_USER_JOURNEYS.md`
  - `docs/SOURCE_MAP.md`
- Updated architecture/readme/task tracker to reflect new source coverage and remaining risks.

**Verification**

- Backend: `npm test` (19 tests total) and `npm run build` passed.
- Frontend: `npm run lint`, `npm test`, and `npm run build` passed.
- Merged and pushed to `main` at commit `ac9ace5`.

**Next actions**

1. Add API integration assertions for update payload trust fields (`integrity`, `trustSignals`).
2. Harden parsing against malformed timestamps/checksums and mixed artifact sets.
3. Add E2E lifecycle coverage for scenario matrix gaps (`S7`, `S8`).

---

## 2026-04-14 (Q1 completion)

**Focus:** Lock update payload trust-field API contract

**Outcomes**

- Added backend integration coverage in `backend/src/test/api.integration.test.ts` for update payload trust fields.
- New API test now asserts:
  - `artifact.integrity`
  - `artifact.trustSignals`
  - expected `verificationStatus` on update response.
- Marked Q1 as completed in `TASK_TRACKER.md`.

**Verification**

- Backend build passed: `npm run build`.
- Backend tests passed: `npm test` (20 tests total).

**Next actions**

1. Harden adapter parsing for malformed timestamps/checksums and mixed artifacts (Q8).
2. Add CI-facing tests for wrapper-template validation environment expectations.

---

## 2026-04-14 (backend CI stabilization)

**Focus:** Eliminate intermittent backend CI sqlite readonly failures

**Outcomes**

- Root-cause class addressed: test suite no longer uses a shared fixed sqlite file path.
- Updated `backend/src/test/setup.ts` to allocate a unique per-run sqlite DB in OS temp directory.
- Added explicit pre/post cleanup for sqlite sidecar files (`.sqlite`, `-wal`, `-shm`) to avoid stale lock-state artifacts.
- Kept backend Vitest file-parallelism guard in place and aligned tracker sections to avoid duplicated queued/done task state.

**Verification**

- Backend suite passed repeatedly with fresh DB paths: 5 consecutive `npm test` runs in `backend`.
- No `SQLITE_READONLY` or related write/lock failures observed locally.

**Next actions**

1. Push stabilization patch to `main` and watch `CI / backend` for one full green cycle.
2. Continue with Q2 (artifact/log persistence) after CI confirms stability.

---

## 2026-04-24

**Focus:** Q3 frontend source/update workflow

**Outcomes**

- Added per-app source/update UI in `frontend/src/components/SourceUpdatePanel.tsx`.
- Users can now validate a source URL, attach the source to an app, run Android update checks, and inspect trust indicators (`verificationStatus`, `integrity`, `trustSignals`) directly from the app details surface.
- Extended frontend state in `frontend/src/store/appStore.ts` to retain attached sources, validation results, and latest update-check payloads by app.
- Expanded frontend API typing to cover validation results and artifact trust fields.
- Added component coverage in `frontend/src/components/SourceUpdatePanel.test.tsx`.

**Verification**

- Source-level review completed for the new frontend flow and test wiring.
- Automated frontend verification is currently blocked in this sandbox because local binaries for `eslint`, `vitest`, `tsc`, and `vite` are not available when running `npm run lint`, `npm run test`, and `npm run build`.

**Next actions**

1. Restore/install frontend dependencies so lint, test, and build can run.
2. Once frontend verification is green, continue with Q8 adapter edge-case hardening or Q5 end-to-end lifecycle coverage.

---

## 2026-04-24 (frontend verification follow-up)

**Focus:** Close the Q3 verification loop after pushing to `main`

**Outcomes**

- Installed frontend dependencies in `frontend/` so local tool binaries are available again.
- Fixed the new `SourceUpdatePanel` test assertion to avoid a false failure on duplicated visible metadata text.
- Confirmed the Q3 frontend work is now validated in this environment.

**Verification**

- Frontend lint passed: `npm run lint`
- Frontend tests passed: `npm run test` (5 files, 9 tests)
- Frontend build passed: `npm run build`
- Remaining output is limited to existing React Testing Library `act(...)` warnings in older component tests; they did not fail the suite.

**Next actions**

1. Continue with Q8 adapter edge-case hardening or Q5 end-to-end lifecycle coverage.

---

## 2026-04-24 (Q8 completion)

**Focus:** Adapter trust parsing hardening for malformed timestamps and checksums

**Outcomes**

- Added shared normalization helpers in `backend/src/utils/source-normalization.ts` for:
  - invalid/missing published timestamps
  - checksum and prefixed digest parsing
- Applied normalization across GitHub, GitLab, F-Droid, and custom source adapters.
- Hardened `backend/src/services/update-service.ts` so update selection re-sorts releases deterministically instead of trusting upstream adapter order.
- Added backend coverage for malformed digest strings, invalid timestamps, and deterministic candidate selection.

**Verification**

- Backend build passed: `npm run build`
- Backend tests passed: `npm run test` (6 files, 26 tests)

**Next actions**

1. Continue with Q5 end-to-end lifecycle coverage.

---

## 2026-04-24 (Q5 initial lifecycle smoke)

**Focus:** Land the first automated `app -> source -> update -> build -> wrapper validation` path

**Outcomes**

- Restored configurable build completion delay for test/runtime parity and set test delay to a deterministic low value.
- Added `backend/src/test/lifecycle.integration.test.ts` to cover:
  - app creation
  - source attachment
  - update check
  - build trigger and completion
  - build log retrieval
  - wrapper validation script execution
- Kept the existing build-concurrency guard test stable while enabling fast lifecycle completion in test runs.

**Verification**

- Backend build passed: `npm run build`
- Backend tests passed: `npm run test` (7 files, 27 tests)

**Next actions**

1. Expand Q5 from backend/wrapper smoke into browser/frontend-driven lifecycle coverage and failure paths.
