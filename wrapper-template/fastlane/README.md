# Fastlane Setup (Scaffold)

This folder contains release automation scaffolding aligned with the Android-first roadmap.

## Available lanes

- `fastlane android ci_dry_run` : validates local tooling in CI.
- `fastlane android release` : checks required signing env vars and marks release lane readiness.
- `fastlane ios scaffold` : placeholder lane for future iOS automation.

## Required env vars for Android release lane

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`

The lane currently validates configuration and is intentionally conservative. Full artifact signing/upload
is planned after the Android reliability milestone is complete.
