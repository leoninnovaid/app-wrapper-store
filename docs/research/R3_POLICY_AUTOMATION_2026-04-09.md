# R3 Policy Automation Plan (Snapshot: 2026-04-09)

## Goal

Encode Android/Play policy requirements as machine-checkable CI gates to prevent non-compliant releases.

## Current policy baseline

1. For new apps and app updates in Google Play, target Android 15 (API 35) or higher (effective 2025-08-31).
2. For Play distribution, upload path should use Android App Bundles (`.aab`).
3. Release builds must use controlled signing flow and protected keys.

## Proposed guardrail architecture

1. Policy config file (versioned in repo):
- `policy/android-play-policy.json`
2. Policy checker script:
- reads policy config and project metadata
- outputs pass/fail with actionable errors
3. CI job:
- runs policy checker before release lanes
- blocks release workflow on policy failure

## Policy checks to implement

1. `targetSdkVersion >= requiredTargetSdk`
2. If `distribution == play-store`, require `preferredArtifact == aab`
3. Require signing metadata references for release profile
4. Verify that readiness checklist fields for release are true

## Concrete steps

1. Add policy config schema and initial values.
2. Implement checker script in `app-generator` or dedicated tooling folder.
3. Integrate checker into `.github/workflows/ci.yml` and `release.yml`.
4. Add failing and passing fixtures for checker tests.
5. Update `docs/RELEASE_CHECKLIST.md` to mirror checker logic.

Initial implementation completed:

- policy config: `policy/android-play-policy.json`
- checker script: `app-generator/scripts/check-play-policy.mjs`
- local command: `cd app-generator && npm run policy:check`
- CI hook: `.github/workflows/ci.yml` (`app-generator` job)

## Acceptance criteria

1. CI fails with clear messages when policy is violated.
2. Local command reproduces the same pass/fail results as CI.
3. Release workflow does not run artifact lane if policy gate fails.

## Evidence sources (retrieved 2026-04-09)

- Play target API requirement:
- https://developer.android.com/google/play/requirements/target-sdk
- Android App Bundle format and Play generation flow:
- https://developer.android.com/guide/app-bundle/app-bundle-format
- Android signing guidance:
- https://developer.android.com/studio/publish/app-signing
- Capacitor target SDK and release guidance:
- https://capacitorjs.com/docs/android/setting-target-sdk
- https://capacitorjs.com/docs/android/deploying-to-google-play
