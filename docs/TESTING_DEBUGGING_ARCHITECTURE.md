# Testing & Debugging Architecture

This document defines the architecture for testing and debugging wrapped apps across the App Wrapper Store stack. It is intended to complement the high-level system overview in [docs/ARCHITECTURE.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/ARCHITECTURE.md) and the operator workflow in [docs/WRAPPER_TESTING_FRAMEWORK.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/WRAPPER_TESTING_FRAMEWORK.md).

## Purpose

The testing/debugging architecture exists to answer four questions consistently:

1. What should be validated before a wrapped app is built?
2. Where do runtime diagnostics come from when a wrapped app fails?
3. Which layer owns each type of failure?
4. How do we move from manual debugging to automated regression coverage?

## Architecture Overview

The architecture is split into four layers:

1. Store and orchestration layer
2. Build-readiness policy layer
3. Wrapper runtime diagnostics layer
4. Platform execution layer

```text
frontend -> backend -> app-generator -> wrapper-template -> android/ios/web test surface
               |             |                |
               |             |                -> runtime diagnostics + in-app debug UI
               |             -> build command execution
               -> readiness gates + API/build logs
```

## Layer 1: Store And Orchestration

This layer owns app definitions, build triggers, and operator-visible build state.

Primary files:

- [frontend/src/store/appStore.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/store/appStore.ts)
- [frontend/src/components/CreateAppForm.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/components/CreateAppForm.tsx)
- [frontend/src/services/api.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/services/api.ts)
- [backend/src/index.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/index.ts)

Responsibilities:

- collect wrapper configuration from the store UI
- send build and validation requests through the backend
- surface standardized failures with actionable error metadata
- expose build lifecycle state to operators

Failure ownership:

- malformed user input belongs here first
- missing backend data contracts become backend integration issues
- missing test evidence is a workflow issue, not a runtime wrapper issue

## Layer 2: Build-Readiness Policy

This layer decides whether a wrapper should be allowed to build.

Primary files:

- [backend/src/services/build-readiness.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/services/build-readiness.ts)
- [policy/android-play-policy.json](C:/Users/Leon/Documents/GitHub/app-wrapper-store/policy/android-play-policy.json)
- [app-generator/scripts/check-play-policy.mjs](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator/scripts/check-play-policy.mjs)

Responsibilities:

- evaluate packaging requirements before Android builds start
- prevent invalid or unsafe build requests from entering the build queue
- keep policy checks reproducible and versioned

Current architecture status:

- Android readiness logic is implemented in the backend service
- policy validation exists in the generator tooling
- iOS-specific readiness policy is not yet modeled as deeply as Android

Testing implication:

- failures found here should be caught before any wrapper runtime debugging is needed
- these checks should remain deterministic and fast enough for CI

## Layer 3: Wrapper Runtime Diagnostics

This is the core of the app-level debugging architecture. It lives inside the generated wrapper itself.

Primary files:

- [wrapper-template/app/index.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/app/index.tsx)
- [wrapper-template/lib/wrapper-config.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/lib/wrapper-config.ts)
- [wrapper-template/lib/wrapper-diagnostics.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/lib/wrapper-diagnostics.ts)
- [wrapper-template/components/DebugPanel.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/components/DebugPanel.tsx)

Responsibilities:

- capture WebView lifecycle events
- capture HTTP-level failures and native WebView errors
- bridge JavaScript-side failures back into the native wrapper
- render an in-app diagnostics timeline for quick triage

Signal flow:

1. [wrapper-template/app/index.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/app/index.tsx) starts and configures the `WebView`.
2. The injected bridge from [wrapper-template/lib/wrapper-diagnostics.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/lib/wrapper-diagnostics.ts) listens for:
   - DOM ready
   - window load
   - uncaught browser errors
   - unhandled promise rejections
   - forwarded `console.log` / `console.warn` / `console.error`
3. Bridge events are parsed into normalized diagnostic events.
4. The event buffer is rendered by [wrapper-template/components/DebugPanel.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/components/DebugPanel.tsx).

Why this matters:

- the wrapper can explain failures even when a full native debugger is not attached
- Android, iOS, and web parity checks can be compared against the same event model
- future remote telemetry can reuse this same normalized event shape

## Layer 4: Platform Execution

This layer is where validation actually runs on Android, iOS, and web.

Primary files:

- [wrapper-template/scripts/validate-wrapper.mjs](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/scripts/validate-wrapper.mjs)
- [wrapper-template/package.json](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/package.json)
- [wrapper-template/fastlane/Fastfile](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/fastlane/Fastfile)
- [.github/workflows/ci.yml](C:/Users/Leon/Documents/GitHub/app-wrapper-store/.github/workflows/ci.yml)

Responsibilities:

- validate wrapper env/config completeness
- provide platform-specific local debug entrypoints
- run minimum repo-level CI coverage for the wrapper template
- prepare future device/simulator automation hooks

Execution model:

- `npm run validate` checks required wrapper configuration
- `npm run debug:android` combines validation with Android launch intent
- `npm run debug:ios` combines validation with iOS launch intent
- `npm run debug:web` combines validation with browser parity checks

Current limitation:

- repo CI validates configuration presence, but does not yet run automated emulator/simulator smoke flows

## Responsibility Map

Use this ownership map when triaging failures:

- Build blocked before queue start:
  - check [backend/src/services/build-readiness.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/services/build-readiness.ts)
- Build command execution fails:
  - check [app-generator/src/index.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator/src/index.ts)
- App loads but runtime behavior is broken:
  - check [wrapper-template/app/index.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/app/index.tsx)
  - then inspect [wrapper-template/components/DebugPanel.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/components/DebugPanel.tsx)
- Store UI shows poor or missing error feedback:
  - check [frontend/src/components/GlobalErrorBanner.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/components/GlobalErrorBanner.tsx)
  - check [frontend/src/components/InlineError.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/components/InlineError.tsx)

## Current Gaps

The architecture is now defined, but these pieces are still missing:

1. Persisted wrapper diagnostic sessions in backend storage
2. Automated Android emulator smoke tests using the Android QA workflow
3. Automated iOS simulator smoke tests using the iOS debugger workflow
4. Structured end-to-end tests from app creation through wrapper validation
5. Remote artifact or telemetry correlation between build IDs and runtime debug sessions

## Next Implementation Path

Recommended order:

1. Add backend endpoints for uploading wrapper diagnostic sessions
2. Extend [app-generator/src/index.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator/src/index.ts) to tag builds with test-session metadata
3. Add Android emulator QA scripts against the generated wrapper template
4. Add iOS simulator QA scripts against the generated wrapper template
5. Promote the wrapper diagnostics event model into a reusable regression-report format
