# Source Adapter Matrix

This document defines source modularity and current implementation status.

## Adapter contract

Each adapter implements:

- `validate(sourceUrl)`
- `fetchMetadata(sourceUrl)`
- `listReleases(sourceUrl)`
- `pickInstallableArtifact(releases, platform)`
- `verifyArtifact(artifact)`

## Source status

| Source | Status | Notes |
|---|---|---|
| GitHub | Implemented | Repository validation + release asset parsing + artifact selection |
| F-Droid | Scaffolded | Validation and metadata scaffold, release parsing pending |
| GitLab | Scaffolded | Placeholder adapter, implementation pending |
| Custom | Scaffolded | Placeholder adapter, implementation pending |

## Artifact prioritization

- Android: `apk` first, then `aab`
- iOS: `ipa`
- Unsupported types are marked `blocked` for installation

## Verification states

- `verified`: checksum metadata available
- `unverified`: no checksum metadata available
- `blocked`: artifact cannot be installed or verified by current rules
