# Release Checklist

Use this checklist before promoting any release artifact.

## Mandatory gates

- [ ] CI workflow green (frontend/backend/app-generator)
- [ ] Frontend lint/build/tests passed
- [ ] Backend build/tests passed
- [ ] App generator build passed
- [ ] No open P0/P1 defects

## Android-first release checks

- [ ] Fastlane `android ci_dry_run` succeeded
- [ ] Signing variables validated
- [ ] Artifact metadata captured (version, checksum if available)
- [ ] Manual smoke test on Android completed

## Error transparency checks

- [ ] Critical API failures surface in global error banner
- [ ] Module failures surface in inline scoped error block
- [ ] Trace IDs shown for backend error responses where available

## Documentation updates

- [ ] `DAILY_LOGS.md` updated with release validation summary
- [ ] `TASK_TRACKER.md` statuses updated
- [ ] Any new failure mode documented in `docs/DEBUG_PLAYBOOK.md`
