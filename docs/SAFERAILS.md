# Saferails

This document defines technical and process guardrails used to keep the repository stable, secure, and maintainable.

## Runtime Guardrails (Implemented)

### API and input safety

- JSON body size limit (`256kb`) on backend requests.
- String length limits for critical fields:
  - `name`: max 120
  - `description`: max 2000
  - `url` and `sourceUrl`: max 2048
  - `currentVersion`: max 64
- URL format checks for app URL, icon URL, and source URL.

### Build safety

- Concurrency guard blocks parallel builds per app.
- Readiness guard blocks Android builds if critical prerequisites are missing.
- Build failures and blocked states return structured details for UI rendering.

### Error transparency

- Backend errors include `traceId`.
- Frontend displays:
  - Global error banner
  - Scoped inline errors with retry
- Inline component can render backend-provided requirement lists.

## CI Guardrails (Implemented)

- Frontend must pass lint + build + tests.
- Backend must pass build + tests.
- App generator must pass build.
- Release dry-run invokes Fastlane lane.

## Process Guardrails (Required)

1. Every functional change includes tests for at least one failure path.
2. Every production-impacting change updates relevant docs.
3. No release flow change without checklist update (`docs/RELEASE_CHECKLIST.md`).
4. Root cause + prevention must be logged in `DAILY_LOGS.md` for significant defects.

## Guardrails Planned Next

1. Add URL allowlist policy for WebView navigation domains.
2. Add adapter-level timeout/retry policy with per-source circuit-breaking.
3. Add artifact checksum/signature verification enforcement before release status becomes ready.
4. Add e2e smoke tests that assert UI-visible errors for all core failures.
5. Add dependency/license scanning workflow in CI.

## References

- Android security best practices: https://developer.android.com/privacy-and-security/security-best-practices
- Android app signing: https://developer.android.com/studio/publish/app-signing
- Google Play target API requirements: https://developer.android.com/google/play/requirements/target-sdk
- TWA integration guide: https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/