## Summary

- What changed:
- Why this change is needed:

## Validation

- [ ] `backend`: `npm run build` and `npm test`
- [ ] `frontend`: `npm run lint`, `npm run build`, `npm test`
- [ ] `app-generator`: `npm run build`
- [ ] Manual smoke checks (if UI/API behavior changed)

## Error and Guardrail Coverage

- [ ] Failure path tested (not only success path)
- [ ] API errors keep `{ code, message, details?, traceId? }`
- [ ] UI surfaces relevant failures (global or inline)
- [ ] Build guardrails unaffected or intentionally updated

## Docs and Tracking

- [ ] Updated docs for behavior/contract changes
- [ ] Updated `TASK_TRACKER.md` for new or completed work
- [ ] Added relevant entry to `DAILY_LOGS.md`

## Risk Notes

- Main risks:
- Rollback plan: