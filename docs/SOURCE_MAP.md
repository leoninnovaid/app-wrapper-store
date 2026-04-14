# Source Map

## Purpose

This map shows which source types are supported, how releases are ingested, and where trust signals come from.

## Source Adapter Matrix

| Source Type | Adapter | Validation Input | Release Ingestion | Trust Signal Inputs | Current Status |
|---|---|---|---|---|---|
| GitHub | `backend/src/adapters/github-source-adapter.ts` | Repository URL | GitHub Releases API assets | Asset digest/checksum + artifact/release coherence + distribution policy checks | Active |
| GitLab | `backend/src/adapters/gitlab-source-adapter.ts` | Project URL | GitLab Releases API asset links | Artifact/release coherence + distribution policy checks (checksum optional) | Active |
| F-Droid | `backend/src/adapters/fdroid-source-adapter.ts` | Repo base URL | `index-v1.json` package entries | `hash` field + artifact/release coherence + distribution policy checks | Active |
| Custom | `backend/src/adapters/custom-source-adapter.ts` | Manifest URL | Manifest `releases[].artifacts[]` | Manifest checksum/integrity + artifact/release coherence + distribution policy checks | Active |

## Shared Trust Evaluation

- Service: `backend/src/services/artifact-verification.ts`
- Status outcomes: `verified`, `unverified`, `blocked`
- Normalized signals:
  - `installable`
  - `checksumPresent`
  - `sourceMetadataCoherent`
  - `policyCompatible`

## Contract Surface

- Adapter contract: `backend/src/adapters/source-adapter.ts`
- Update selection + verification flow: `backend/src/services/update-service.ts`
- API endpoints:
  - `GET /api/apps/:id/updates`
  - `POST /api/apps/:id/updates/check`

## Next Hardening Targets

1. Add API integration assertions for `artifact.integrity` and `artifact.trustSignals`.
2. Expand malformed-source fixtures (invalid timestamps/checksums).
3. Add E2E lifecycle journey coverage for cross-source update checks.
