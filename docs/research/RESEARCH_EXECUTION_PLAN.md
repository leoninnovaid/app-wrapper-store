# Research Execution Plan (Q2 2026)

This plan converts the research backlog into concrete execution tasks.

## Scope

- R1: Website-to-Android packaging strategy decision.
- R2: Artifact trust and verification model.
- R3: Policy and release compliance automation.

## Milestone Timeline

### Phase 1 (2026-04-09 to 2026-04-12)

1. Freeze evidence from official docs for R1, R2, R3.
2. Publish decision scorecard draft for strategy default and fallback.
3. Publish trust classification draft (`verified`, `unverified`, `blocked`).
4. Publish policy baseline draft for Play distribution rules.

Exit criteria:

- Evidence-backed docs committed in `docs/research/`.
- Task tracker updated with implementation-ready tasks.

### Phase 2 (2026-04-13 to 2026-04-18)

1. Run prototype build paths:
- WebView wrapper happy path
- TWA path with Digital Asset Links
- Capacitor path with target SDK alignment
2. Capture failure logs and reproducible steps.
3. Decide default strategy by distribution type.

Exit criteria:

- Prototype comparison table includes setup effort, failure modes, and remediation time.
- Default strategy recommendation approved and recorded.

### Phase 3 (2026-04-19 to 2026-04-24)

1. Convert trust model into API decision logic and tests.
2. Add CI policy job for target SDK, artifact type, and signing metadata checks.
3. Add release checklist updates to enforce the same policy gates.

Exit criteria:

- Policy checks run in CI and fail on non-compliance.
- Verification statuses are deterministic and tested.

## Work Packages

## WP-R1

- Goal: choose default packaging strategy by use case.
- Inputs: official docs + local prototype runs.
- Outputs:
- `R1_METHODS_SCORECARD_2026-04-09.md`
- strategy decision note in `META_PLAN.md`
- implementation tasks in `TASK_TRACKER.md`

## WP-R2

- Goal: standardize trust signals and status mapping.
- Inputs: source metadata capabilities and Android signing model.
- Outputs:
- `R2_TRUST_MODEL_2026-04-09.md`
- backend implementation tasks and tests list

## WP-R3

- Goal: automate Play policy compliance checks.
- Inputs: Play target API rules, artifact constraints, signing requirements.
- Outputs:
- `R3_POLICY_AUTOMATION_2026-04-09.md`
- CI job design and implementation checklist

## Reporting Cadence

- Daily: log findings and blockers in `DAILY_LOGS.md`.
- Weekly: update status in `TASK_TRACKER.md` and close completed work packages.
- Per research item: include source links and explicit date of retrieval.