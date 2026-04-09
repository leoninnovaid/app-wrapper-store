# Future Research Backlog

Research and implementation backlog for next milestones.

## R1 - Production-grade website-to-APK strategies

### Objective
Compare real production viability of WebView, TWA, Capacitor, and Cordova for this repo's use cases.

### Questions

1. Which strategy gives the best reliability for dynamic websites with login/session flows?
2. Which strategy has the lowest long-term maintenance burden?
3. Which strategy supports Play-compliant release automation most cleanly?

### Deliverables

- Strategy scorecard (security, DX, release reliability, policy risk)
- Recommended default strategy + fallback strategy
- Migration path between strategies

### Primary references

- TWA: https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/
- Capacitor Android: https://capacitorjs.com/docs/android
- Cordova Android: https://cordova.apache.org/docs/en/latest/guide/platforms/android/
- Android WebView reference: https://developer.android.com/reference/android/webkit/WebView

## R2 - Artifact trust and verification

### Objective
Define minimum trust model for installable artifacts.

### Questions

1. Which checksum/signature signals are available from each source type?
2. How to classify `verified` vs `unverified` vs `blocked` consistently?
3. Which verifications are mandatory before release status is green?

### Deliverables

- Trust matrix by source type
- Verification pipeline design
- Failure taxonomy + UI copy for blocked states

### Primary references

- Android app signing: https://developer.android.com/studio/publish/app-signing
- Android App Bundle format: https://developer.android.com/guide/app-bundle/app-bundle-format

## R3 - Policy and release compliance automation

### Objective
Keep release pipeline aligned with Google Play requirements automatically.

### Questions

1. How to encode target API guardrails as CI checks?
2. Which metadata should be validated pre-release (SDK, signing, artifact type)?
3. How to keep policy checks current without brittle manual updates?

### Deliverables

- CI policy-check job design
- Guardrail config format for policy values
- Release gate checklist integration

### Primary references

- Play target API requirements: https://developer.android.com/google/play/requirements/target-sdk
- Play Console policy guidance: https://support.google.com/googleplay/android-developer

## R4 - Open hardware + flexible software integration track

### Objective
Map open hardware principles into the software architecture and operational model.

### Questions

1. How to keep modules replaceable without service fragmentation?
2. Which interfaces must remain stable for community-built adapters/builders?
3. How to design test fixtures so contributors can validate modules offline?

### Deliverables

- Interface stability policy
- Adapter certification checklist
- Community contribution matrix

## Research cadence

- Weekly: triage backlog priorities and update status.
- Per completed research item: add summary to `DAILY_LOGS.md` and convert outcomes into concrete tasks in `TASK_TRACKER.md`.