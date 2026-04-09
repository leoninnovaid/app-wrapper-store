# Future Research Backlog

This backlog tracks research topics and their conversion into implementation tasks.

## Current status snapshot (2026-04-09)

- R1: In progress (scorecard draft published)
- R2: In progress (trust model draft published)
- R3: In progress (policy automation draft published)
- R4: Pending

Research artifacts:

- `docs/research/RESEARCH_EXECUTION_PLAN.md`
- `docs/research/R1_METHODS_SCORECARD_2026-04-09.md`
- `docs/research/R2_TRUST_MODEL_2026-04-09.md`
- `docs/research/R3_POLICY_AUTOMATION_2026-04-09.md`

Initial R3 prototype shipped:

- `policy/android-play-policy.json`
- `app-generator/scripts/check-play-policy.mjs`

## R1 - Production-grade website-to-APK strategies

### Objective
Compare production viability of WebView, TWA, Capacitor, and Cordova for this repo's use cases.

### Immediate concrete steps

1. Run one prototype build per strategy with identical sample site and acceptance checks.
2. Capture setup time, failure modes, and remediation effort.
3. Finalize default strategy by distribution target (local, Play).

### Deliverables

- Strategy scorecard with recommendation and fallback path.
- Migration notes between strategy types.
- Implementation tasks for chosen defaults.

## R2 - Artifact trust and verification

### Objective
Define minimum trust model for installable artifacts.

### Immediate concrete steps

1. Enumerate integrity signals available per source adapter type.
2. Implement status decision table for `verified/unverified/blocked`.
3. Convert decision table to test cases and backend implementation tasks.

### Deliverables

- Trust matrix by source type.
- Verification pipeline design and error taxonomy.
- UI copy guidelines for blocked states.

## R3 - Policy and release compliance automation

### Objective
Keep release pipeline aligned with Google Play requirements automatically.

### Immediate concrete steps

1. Create versioned policy config file for Android/Play constraints.
2. Implement CI policy checker with failing fixtures.
3. Wire checker into release workflow as a hard gate.

### Deliverables

- CI policy-check job design and implementation.
- Guardrail config format and update process.
- Release checklist synchronization.

## R4 - Open hardware + flexible software integration track

### Objective
Map open hardware principles into software architecture and contributor workflows.

### Immediate concrete steps

1. Define stable interface boundaries for adapters and builder modules.
2. Draft adapter certification checklist.
3. Design offline test fixtures for community contributors.

### Deliverables

- Interface stability policy.
- Adapter certification checklist.
- Community contribution matrix.

## Research cadence

- Daily: add findings and blockers to `DAILY_LOGS.md`.
- Weekly: review status in `TASK_TRACKER.md` and convert accepted research into implementation tasks.
- For each finalized research item: include source links and retrieval date.
