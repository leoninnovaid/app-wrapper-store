# R2 Trust Model Draft (Snapshot: 2026-04-09)

## Goal

Define deterministic artifact trust states for release candidates: `verified`, `unverified`, `blocked`.

## Trust signals

1. Artifact type is installable for platform (`apk`, `aab`, `ipa`).
2. Artifact integrity metadata exists (checksum or equivalent digest).
3. Source metadata consistency (release tag/version and artifact naming coherence).
4. Distribution intent compatibility (for Play, `aab` preferred).
5. Signing readiness available for release output.

## Proposed state mapping

### verified

All required checks pass:

- installable artifact type present
- integrity metadata present and parsable
- source metadata coherent
- release policy constraints satisfied for distribution target

### unverified

Installable artifact exists, but one or more non-blocking trust checks are missing:

- no checksum/digest in source metadata
- no signature metadata from source

### blocked

At least one blocking condition is true:

- no installable artifact for platform
- invalid or disallowed artifact type for distribution target
- required policy preconditions not met

## Concrete implementation tasks

1. Add per-source trust-signal extraction contract in adapter interface.
2. Extend adapter responses with normalized integrity fields.
3. Implement status calculator shared by all adapters.
4. Add unit tests for status mapping edge cases.
5. Add integration tests for API payload consistency.

## Test matrix

1. GitHub release with APK + checksum -> `verified`.
2. GitHub release with APK and no checksum -> `unverified`.
3. Play distribution with APK-only artifact -> `blocked`.
4. No installable artifact -> `blocked`.
5. Multiple artifacts with mixed quality -> best valid candidate chosen deterministically.

## Evidence sources (retrieved 2026-04-09)

- Android app signing flow and key handling:
- https://developer.android.com/studio/publish/app-signing
- Android App Bundle format and Play split generation:
- https://developer.android.com/guide/app-bundle/app-bundle-format
- Play target API and submission constraints:
- https://developer.android.com/google/play/requirements/target-sdk