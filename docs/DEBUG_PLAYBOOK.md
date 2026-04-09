# Debug Playbook

This runbook defines the required failure workflow: `reproduce -> classify -> patch -> verify -> prevent`.

## 1. Reproduce

- Capture scope (`create-app`, `load-apps`, `build-app`, `delete-app`, `source-validate`, `update-check`, `release`).
- Capture full visible error (`code`, `message`, `traceId`) from global/inline UI.
- Capture request payload and API endpoint.

## 2. Classify

- `network`: timeout, DNS, connectivity, upstream fetch errors.
- `validation`: request schema, URL, source type, missing required fields.
- `backend`: internal exception, persistence failure, adapter runtime failure.
- `unknown`: uncategorized failure requiring triage.

## 3. Patch

- Write failing test first when feasible.
- Patch the narrowest module responsible (UI scope, adapter, repository, route, pipeline step).
- Keep API error payload contract stable: `{ code, message, details?, traceId? }`.

## 4. Verify

- Run local checks:
  - `frontend`: lint + build + tests
  - `backend`: build + tests
  - `app-generator`: build
- Confirm UI now shows either success state or a higher-quality actionable error.

## 5. Prevent

- Add or update regression tests.
- Update `DAILY_LOGS.md` with root cause and prevention action.
- If failure was release-related, update `docs/RELEASE_CHECKLIST.md`.

## Triage severity

- P0: security/data loss/system unavailable
- P1: primary user flow blocked
- P2: degraded behavior with workaround
- P3: minor issue
