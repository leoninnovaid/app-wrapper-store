# App Wrapper Store

Open-source platform to create Android-first app wrappers from websites with transparent errors, modular source adapters, and reproducible build workflows.

## Current Status

- Core app CRUD and build orchestration are implemented.
- Frontend ships global + inline UI error handling.
- Backend ships standardized API errors with trace IDs.
- Build readiness guardrails block unsafe or incomplete Android build requests.
- CI and release dry-run workflows are active.

## Repository Overview

```text
app-wrapper-store/
|-- backend/           # Express API, SQLite persistence, adapter + update services
|-- frontend/          # React/Tailwind store UI
|-- app-generator/     # Build queue helper service
|-- wrapper-template/  # React Native/Expo wrapper template + Fastlane scaffolding
|-- docs/              # Architecture, runbooks, guardrails, research notes
|-- policy/            # Versioned Android/Play policy guardrail definitions
|-- .github/           # CI workflows and issue templates
|-- META_PLAN.md
|-- TASK_TRACKER.md
|-- DAILY_LOGS.md
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend health: `http://localhost:3000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 3. App Generator (optional)

```bash
cd app-generator
npm install
npm run dev
```

## Validation Commands

### Backend

```bash
cd backend
npm run build
npm test
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
npm test
```

### App Generator

```bash
cd app-generator
npm run build
npm run policy:check
```

## Implemented Guardrails

- Standardized API error payload: `{ code, message, details?, traceId? }`.
- UI error visibility: global banner + scoped inline errors with retry.
- Build readiness gate: block Android builds when critical prerequisites are missing.
- Build concurrency gate: prevent multiple simultaneous builds for the same app.
- Input guardrails: bounded payload size and string length checks on key fields.

See [docs/SAFERAILS.md](docs/SAFERAILS.md) for details.

## Core Flows

1. Create app configuration in frontend.
2. Optional source validation and attachment.
3. Trigger build (`POST /api/apps/:id/build`).
4. Backend enforces readiness + concurrency guardrails.
5. Build status and logs are available via API.

## Key Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Android Packaging Blueprint](docs/ANDROID_PACKAGING_BLUEPRINT.md)
- [Saferails](docs/SAFERAILS.md)
- [Future Research Backlog](docs/FUTURE_RESEARCH_BACKLOG.md)
- [Research Execution Plan](docs/research/RESEARCH_EXECUTION_PLAN.md)
- [Debug Playbook](docs/DEBUG_PLAYBOOK.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [Contributing](docs/CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).
