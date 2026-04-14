# Test Scenarios and User Journeys

## Scope

This document defines repeatable user journeys and test scenarios for the App Wrapper Store across:

- App management
- Source onboarding
- Update trust evaluation
- Build orchestration
- Error handling and guardrails

## Environment assumptions

- Backend and frontend dependencies are installed.
- Backend is reachable at `http://localhost:3000`.
- Frontend is reachable at `http://localhost:5173` in local dev.
- Test data may be created and removed freely.

## User Journeys

### J1. Create app and verify persistence

**Goal:** A user can create an app and see it listed.

**Steps:**

1. Open frontend and submit create-app form with valid `name`, `description`, and `url`.
2. Refresh app list.

**Expected results:**

- API returns `201`.
- Created app appears in list view.
- No global error banner is shown.

### J2. Validate and attach a source

**Goal:** A user can validate a source and attach it to an app.

**Steps:**

1. Call `POST /api/sources/validate` with a supported source URL.
2. Attach source via `POST /api/apps/:id/sources`.

**Expected results:**

- Validation response includes `sourceType`, `sourceUrl`, and `releaseCount`.
- Attach response returns `201` with persisted source payload.

### J3. Update check with no source configured

**Goal:** The system returns deterministic blocked status when no source exists.

**Steps:**

1. Create app with no source.
2. Call `GET /api/apps/:id/updates?platform=android`.

**Expected results:**

- Response status is `200`.
- Payload has `status: "blocked"` and clear `reason`.

### J4. Update check with trust evaluation (GitHub/GitLab/F-Droid/Custom)

**Goal:** Candidate artifacts are scored as `verified`/`unverified`/`blocked`.

**Steps:**

1. Attach source with releases containing installable artifacts.
2. Call update-check endpoint.
3. Repeat with:
   - checksum present + coherent artifact naming
   - missing checksum
   - Play distribution with APK-only artifact

**Expected results:**

- Verified case returns `verificationStatus: "verified"`.
- Missing checksum returns `verificationStatus: "unverified"` with reason.
- Play + APK-only returns blocked reason for policy incompatibility.

### J5. Build readiness guardrail

**Goal:** Build is blocked when readiness requirements are missing.

**Steps:**

1. Configure app packaging with missing readiness flags.
2. Call `POST /api/apps/:id/build`.

**Expected results:**

- Response is `400` with `code: "APK_READINESS_FAILED"`.
- `details.missingRequirements` contains actionable checklist items.

### J6. Build concurrency guardrail

**Goal:** Only one active build per app is allowed.

**Steps:**

1. Trigger first build.
2. Trigger second build immediately for same app.

**Expected results:**

- First build returns `201`.
- Second build returns `409` with `code: "CONFLICT"`.

### J7. Frontend error UX

**Goal:** API errors are visible and actionable in UI.

**Steps:**

1. Force a validation error from create-app flow.
2. Force an update-check or build failure.

**Expected results:**

- Scoped errors render inline in the relevant form/module.
- Global errors render in `GlobalErrorBanner` where applicable.
- Retry action clears and re-attempts correctly.

### J8. End-to-end app lifecycle

**Goal:** User can complete the core app lifecycle.

**Steps:**

1. Create app.
2. Attach source.
3. Run update check.
4. Trigger build.
5. View build logs/status.

**Expected results:**

- Each step returns deterministic API payloads.
- No silent failures; all failures include code/message/traceId.

## Scenario Matrix

| Scenario ID | Area | Type | Automated | Notes |
|---|---|---|---|---|
| S1 | App CRUD validation | Integration | Yes | Covered by backend API integration tests |
| S2 | Source URL validation | Integration | Yes | Includes invalid URL contract checks |
| S3 | Update trust states | Unit | Yes | `update-service` + adapter tests |
| S4 | Build readiness blocking | Integration | Yes | `APK_READINESS_FAILED` contract |
| S5 | Build concurrency | Integration | Yes | `CONFLICT` contract |
| S6 | Frontend error rendering | Unit | Yes | Store + error components |
| S7 | Cross-source update payload shape | Integration | No (next) | Add API payload assertions for trust fields |
| S8 | Full UI end-to-end lifecycle | E2E | No (next) | Candidate for Playwright/Cypress |

## Recommended next additions

1. Add API integration assertions for artifact `integrity` and `trustSignals` fields.
2. Add malformed source fixtures (invalid timestamps/checksums) for adapter hardening.
3. Add browser E2E coverage for J8 lifecycle.
