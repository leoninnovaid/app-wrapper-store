# App Wrapper Store - Task Tracker v3

## Active milestone board

| ID | Goal | Task | Status | Priority | Owner | Dependency | Acceptance |
|---|---|---|---|---|---|---|---|
| G1-T1 | G1 | Frontend `UiError` architecture (global + scoped) | Done | High | Core | None | Store actions and scopes implemented |
| G1-T2 | G1 | Replace alerts with inline + global UI errors | Done | High | Core | G1-T1 | No `alert()` usage in frontend |
| G1-T3 | G1 | Standard backend error contract + trace ID | Done | High | Core | None | Error payload includes `code/message/traceId` |
| G1-T4 | G1 | Frontend error tests (store/components) | Done | High | Core | G1-T1 | Tests pass in CI/local |
| G1-T5 | G1 | Backend integration tests for contract | Done | High | Core | G1-T3 | Validation + not-found contract covered |
| G2-T1 | G2 | Source adapter interface + registry | Done | High | Core | None | Adapter contract committed |
| G2-T2 | G2 | GitHub adapter implementation | Done | High | Core | G2-T1 | Releases normalized from GitHub |
| G2-T3 | G2 | F-Droid/GitLab/custom scaffolds | Done | Medium | Core | G2-T1 | Scaffold adapters return explicit reason |
| G2-T4 | G2 | Source validation + attach endpoints | Done | High | Core | G2-T2 | Source can be validated and linked to app |
| G3-T1 | G3 | Update-check service and endpoints | Done | High | Core | G2-T2 | Deterministic update-check payload |
| G3-T2 | G3 | Artifact trust states in update payload | Done | High | Core | G3-T1 | `verified/unverified/blocked` enforced |
| G4-T1 | G4 | GitHub Actions CI workflow | Done | High | Core | G1-T4, G1-T5 | CI runs frontend/backend/generator checks |
| G4-T2 | G4 | Release dry-run workflow | Done | Medium | Core | G4-T3 | Tag/workflow_dispatch runs dry-run job |
| G4-T3 | G4 | Fastlane Android + iOS scaffold lanes | Done | Medium | Core | None | Lanes committed with docs |
| G5-T1 | G5 | Debug playbook and release checklist docs | Done | High | Core | None | Runbooks available in `docs/` |
| G5-T2 | G5 | Bug report template with trace capture | Done | Medium | Core | G1-T3 | Template requests trace ID and repro data |
| G5-T3 | G5 | Expand regression coverage for core flows | In Progress | High | Core | G1-T4, G1-T5 | Additional integration/e2e tests planned |
| G5-T4 | G5 | Repo alignment pass (README/architecture/contributing refresh) | Done | High | Core | None | Docs match actual modules and commands |
| G5-T5 | G5 | Build concurrency and input guardrails | Done | High | Core | G1-T3 | `CONFLICT` on overlapping builds + field-size validation |
| G5-T6 | G5 | Publish saferail and research backlog docs | Done | Medium | Core | G5-T4 | `docs/SAFERAILS.md` + `docs/FUTURE_RESEARCH_BACKLOG.md` committed |
| G5-T7 | G5 | Adapter hardening and verification research execution | In Progress | High | Core | G5-T6 | GitHub/GitLab/F-Droid/custom trust extraction baseline landed; integration hardening remains |
| G5-T8 | G5 | Publish concrete R1-R3 research artifacts | Done | High | Core | G5-T7 | `docs/research/*` includes scorecard, trust model, policy plan |
| G5-T9 | G5 | Convert research outputs into code tickets and CI tasks | In Progress | High | Core | G5-T8 | Tracker includes adapter trust tests; API payload and CI gates remain |
| G5-T10 | G5 | Add initial Play policy checker prototype | Done | High | Core | G5-T8 | Versioned policy file + runnable checker + CI command |

## Next queued tasks

| Queue | Task | Why it matters |
|---|---|---|
| Q1 | Add API integration tests for trust fields (`integrity`, `trustSignals`) | Required to lock update payload contract |
| Q2 | Persist build artifacts and logs for download lifecycle | Required for release operations |
| Q3 | Add source/update UI screens in frontend | Required for full user flow of G2/G3 |
| Q4 | Integrate signed Android artifact publishing | Required for production release |
| Q5 | Add e2e test suite for app -> source -> update -> build | Required for RC confidence |
| Q6 | Add CI policy check for target SDK and artifact type consistency | Prevent release-policy drift |
| Q7 | Prototype-run matrix for WebView/TWA/Capacitor/Cordova | Needed to finalize default packaging policy |
| Q8 | Harden adapter trust parsing for edge cases (missing timestamps, malformed checksums) | Needed for deterministic behavior on messy real-world feeds |
| Q9 | Automate scenarios S7/S8 from test journey matrix | Required to close remaining high-risk coverage gaps |

## Completion triggers and solution roadmap

### In-progress tasks

| ID | Finish trigger | Planned solution |
|---|---|---|
| G5-T3 | Done when app creation, source validation, update-check, build trigger, and wrapper validation each have automated regression coverage with CI evidence. | Add backend flow tests in [backend/src/test](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/test), add wrapper-template validation checks in [wrapper-template/scripts/validate-wrapper.mjs](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/scripts/validate-wrapper.mjs), then add cross-surface smoke coverage guided by [docs/TESTING_DEBUGGING_ARCHITECTURE.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/TESTING_DEBUGGING_ARCHITECTURE.md). |
| G5-T7 | Done when R1/R2 research outputs are turned into implemented adapter-hardening tasks with verification logic and tracked acceptance tests. | Use [docs/research/R1_METHODS_SCORECARD_2026-04-09.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/research/R1_METHODS_SCORECARD_2026-04-09.md) and [docs/research/R2_TRUST_MODEL_2026-04-09.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/research/R2_TRUST_MODEL_2026-04-09.md) to harden adapter parsing, artifact selection, and trust mapping in [backend/src/adapters](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/adapters) and [backend/src/services/update-service.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/services/update-service.ts). |
| G5-T9 | Done when research-derived engineering tasks are visible in the tracker, linked to code areas, and enforced by CI or automated tests where applicable. | Convert research into concrete queue items and milestone tasks, then wire enforcement into [.github/workflows/ci.yml](C:/Users/Leon/Documents/GitHub/app-wrapper-store/.github/workflows/ci.yml), [app-generator/scripts/check-play-policy.mjs](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator/scripts/check-play-policy.mjs), and backend/frontend test suites. |

### Queued tasks

| ID | Finish trigger | Planned solution |
|---|---|---|
| Q1 | Done when F-Droid and GitLab adapters return normalized release metadata from real upstream responses instead of scaffolded placeholders. | Replace scaffold logic in [backend/src/adapters/fdroid-source-adapter.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/adapters/fdroid-source-adapter.ts) and add a GitLab adapter implementation aligned to [backend/src/adapters/github-source-adapter.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/adapters/github-source-adapter.ts), with fixtures and parser tests. |
| Q2 | Done when build artifacts and build logs can be persisted, queried, and tied to a build record for later download or audit. | Extend [backend/src/repositories/sqlite-store-repository.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/repositories/sqlite-store-repository.ts) and the build flow in [backend/src/index.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/index.ts), then persist generator output from [app-generator/src/index.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator/src/index.ts). |
| Q3 | Done when users can validate sources, attach them to apps, run update checks, and inspect trust state directly from the frontend. | Add screens/components on top of [frontend/src/store/appStore.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/store/appStore.ts) and [frontend/src/services/api.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/services/api.ts), reusing the existing error UX in [frontend/src/components/GlobalErrorBanner.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/components/GlobalErrorBanner.tsx) and [frontend/src/components/InlineError.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend/src/components/InlineError.tsx). |
| Q4 | Done when Android release artifacts are signed through a reproducible lane and release prerequisites are enforced before publishing. | Extend [wrapper-template/fastlane/Fastfile](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/fastlane/Fastfile) from scaffold mode into a real signing/publish lane, then connect readiness checks from [backend/src/services/build-readiness.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/services/build-readiness.ts). |
| Q5 | Done when the full `app -> source -> update -> build -> wrapper validation` path has automated end-to-end coverage with failure assertions. | Build an e2e suite spanning [frontend](C:/Users/Leon/Documents/GitHub/app-wrapper-store/frontend), [backend](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend), [app-generator](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator), and [wrapper-template](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template), using the staged testing model in [docs/TESTING_DEBUGGING_ARCHITECTURE.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/TESTING_DEBUGGING_ARCHITECTURE.md). |
| Q6 | Done when CI fails on target SDK drift or invalid Android artifact type combinations before release work starts. | Expand [policy/android-play-policy.json](C:/Users/Leon/Documents/GitHub/app-wrapper-store/policy/android-play-policy.json) and [app-generator/scripts/check-play-policy.mjs](C:/Users/Leon/Documents/GitHub/app-wrapper-store/app-generator/scripts/check-play-policy.mjs), then enforce the check in [.github/workflows/ci.yml](C:/Users/Leon/Documents/GitHub/app-wrapper-store/.github/workflows/ci.yml). |
| Q7 | Done when the packaging matrix has comparable prototype evidence for WebView, TWA, Capacitor, and Cordova under shared acceptance checks. | Create a controlled prototype run matrix from the packaging policy work, evaluate each mode under the readiness criteria in [backend/src/services/build-readiness.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/services/build-readiness.ts), and record outcomes in `docs/research/`. |
| Q8 | Done when trust signals from adapters are normalized into deterministic `verified`, `unverified`, or `blocked` outcomes with tests. | Implement trust extraction in adapter modules under [backend/src/adapters](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/adapters) and centralize mapping logic in [backend/src/services/update-service.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/backend/src/services/update-service.ts) based on [docs/research/R2_TRUST_MODEL_2026-04-09.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/research/R2_TRUST_MODEL_2026-04-09.md). |

## Newly introduced roadmap stream

| ID | Task | Status | Finish trigger | Planned solution |
|---|---|---|---|---|
| G5-T11 | Operationalize wrapper testing and debugging architecture | In Progress | Done when wrapper diagnostics, validation flow, and architecture docs are reflected in tracker tasks and enforced by CI/test work. | Build on [docs/TESTING_DEBUGGING_ARCHITECTURE.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/TESTING_DEBUGGING_ARCHITECTURE.md), [docs/WRAPPER_TESTING_FRAMEWORK.md](C:/Users/Leon/Documents/GitHub/app-wrapper-store/docs/WRAPPER_TESTING_FRAMEWORK.md), and the runtime hooks in [wrapper-template/app/index.tsx](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/app/index.tsx). |
| G5-T12 | Persist wrapper diagnostic sessions and correlate them to builds | Planned | Done when wrapper debug sessions can be uploaded, stored, and traced back to a specific build or app record. | Add backend endpoints/storage, then have the wrapper diagnostics layer emit structured sessions derived from [wrapper-template/lib/wrapper-diagnostics.ts](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/lib/wrapper-diagnostics.ts). |
| G5-T13 | Add Android and iOS automated wrapper smoke runs | Planned | Done when emulator/simulator smoke checks run against generated wrappers and surface pass/fail evidence in CI or repeatable local tooling. | Use the Android QA and iOS debugger workflows to automate checks around [wrapper-template/scripts/validate-wrapper.mjs](C:/Users/Leon/Documents/GitHub/app-wrapper-store/wrapper-template/scripts/validate-wrapper.mjs) and the wrapper debug panel. |

## Definition of done (global)

1. Feature code merged with tests and docs.
2. Error paths produce UI-visible and traceable outputs.
3. CI checks pass on pull request.
4. Daily logs updated with root cause + prevention for any failure encountered.
