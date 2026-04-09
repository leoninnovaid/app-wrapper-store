# Architecture

## System Overview

App Wrapper Store is a modular monolith with three runtime surfaces:

1. Frontend Store (React)
2. Backend API (Express + SQLite)
3. Wrapper/Build tooling (app-generator + wrapper-template)

The backend is intentionally monolithic but split by clear contracts:

- API routes and middleware
- persistence repository
- source adapters
- update/build readiness services

## Runtime Components

### Frontend (`/frontend`)

Responsibilities:

- Create and manage app definitions
- Surface all backend errors in UI (global + inline)
- Trigger and inspect build lifecycle
- Collect packaging/readiness configuration

Key modules:

- `src/store/appStore.ts`: app + error state
- `src/components/GlobalErrorBanner.tsx`
- `src/components/InlineError.tsx`
- `src/components/CreateAppForm.tsx`

### Backend (`/backend`)

Responsibilities:

- App CRUD APIs
- Source validation and source attachment APIs
- Build orchestration and build log APIs
- Update-check pipeline through adapters
- Error normalization and trace IDs

Key modules:

- `src/index.ts`: route composition and error middleware
- `src/repositories/sqlite-store-repository.ts`: persistence adapter
- `src/services/build-readiness.ts`: APK build preflight guardrails
- `src/services/update-service.ts`: source update logic
- `src/adapters/*`: source-specific integrations

### Build Tooling

- `app-generator`: worker-side helper for build queue actions.
- `wrapper-template`: React Native/Expo wrapper base with Fastlane scaffolding.

## Data Model (Current)

Persisted entities:

- `apps`
- `builds`
- `build_logs`
- `app_sources`

Storage backend:

- SQLite (`backend/data/*.sqlite`)
- Repository pattern isolates DB access for future PostgreSQL migration.

## API Conventions

### Error Contract

Every handled API error returns:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "...",
  "details": {},
  "traceId": "..."
}
```

### Build Guardrail Contract

Android build endpoint (`POST /api/apps/:id/build`) applies:

1. Concurrency guard (no parallel active build per app)
2. Readiness guard (packaging prerequisites)

Failures are explicit and machine-readable (`CONFLICT`, `APK_READINESS_FAILED`).

## Quality Gates

CI workflow (`.github/workflows/ci.yml`) enforces:

- Frontend: lint + build + test
- Backend: build + test
- App generator: build

Release dry-run (`.github/workflows/release.yml`) enforces:

- Fastlane Android dry-run lane invocation on tags/manual dispatch.

## Near-Term Architecture Priorities

1. Replace scaffolded adapters (F-Droid/GitLab/custom) with production parsers.
2. Persist artifact metadata and storage URLs for real download lifecycle.
3. Add end-to-end flow tests across app -> source -> update -> build.
4. Introduce signed artifact verification and stricter release gates.