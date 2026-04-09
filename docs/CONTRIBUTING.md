# Contributing

Thanks for contributing to App Wrapper Store.

## Development Prerequisites

- Node.js 20+
- Git
- Optional for mobile template work: Android Studio / Xcode / Expo tooling

## Local Setup

```bash
git clone https://github.com/leoninnovaid/app-wrapper-store.git
cd app-wrapper-store
```

Install dependencies per module:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../app-generator && npm install
cd ../wrapper-template && npm install
```

## Run Services

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

### App Generator (optional)

```bash
cd app-generator
npm run dev
```

## Required Checks Before PR

### Frontend

```bash
cd frontend
npm run lint
npm run build
npm test
```

### Backend

```bash
cd backend
npm run build
npm test
```

### App Generator

```bash
cd app-generator
npm run build
```

## Branch and Commit Format

- Branch naming recommendation: `feature/...`, `fix/...`, `chore/...`
- Use conventional commits when possible:

```text
feat(scope): short summary
fix(scope): short summary
docs(scope): short summary
```

## Pull Request Expectations

Each PR should include:

1. What changed
2. Why this change is needed
3. Testing evidence (commands + results)
4. Risk notes and rollback considerations
5. Documentation updates (if behavior changed)

Use the PR checklist in `.github/pull_request_template.md`.

## Guardrails for Contributors

- Do not add new features without error-state UX handling.
- Keep API errors standardized with `code/message/traceId`.
- Avoid introducing parallel build race conditions.
- Keep source adapters isolated by interface contract.
- Update `TASK_TRACKER.md` and `DAILY_LOGS.md` for non-trivial changes.

## Security and Reliability Notes

- Never commit secrets or signing keys.
- Prefer deterministic tests over flaky timing-dependent flows.
- Add tests for both success and failure paths.

## Where to Start

Good first areas:

- adapter implementation gaps
- build log and artifact lifecycle
- frontend source/update screens
- end-to-end regression coverage