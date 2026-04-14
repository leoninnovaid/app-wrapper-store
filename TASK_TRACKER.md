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

## Definition of done (global)

1. Feature code merged with tests and docs.
2. Error paths produce UI-visible and traceable outputs.
3. CI checks pass on pull request.
4. Daily logs updated with root cause + prevention for any failure encountered.
