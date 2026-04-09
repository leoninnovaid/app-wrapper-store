# Android Packaging Blueprint

## Goal
Implement proven website-to-Android packaging strategies directly in the App Wrapper Store UI and enforce pre-build checks so APK/AAB outputs are actually installable, updatable, and policy-compliant.

## Supported strategies in the website

1. WebView Wrapper
- Fastest path to a runnable APK shell.
- Good for internal distribution and controlled domains.

2. Trusted Web Activity (TWA)
- Full-screen browser surface for a verified web app.
- Best for PWA-first distribution via Google Play.

3. Capacitor Android
- Hybrid shell with plugin ecosystem and Android Studio workflow.
- Good when moderate native capabilities are needed.

4. Apache Cordova
- Mature wrapper flow and plugin compatibility.
- Useful for legacy ecosystems.

## What must happen for APK/AAB to function properly

### Always required (Android build baseline)
- Website runs over HTTPS.
- Release signing key/keystore is configured.

### Required for Google Play distribution
- Preferred artifact should be `.aab`.
- Target SDK must match current Play requirement (API 35+ as of 2026-03-30 update).

### Additional required checks for TWA
- Valid web manifest.
- Digital Asset Links verified between app and website.

### Strongly recommended (non-blocking warning)
- Production-ready service worker for robust caching/offline behavior.

## Implementation in this repo

### Frontend
- Added packaging strategy guide cards in the website UI.
- Added strategy/distribution/artifact + readiness inputs in `Create New App` form.
- Added live readiness evaluation with blocking and recommended items.
- Added app-card readiness summary.

### Backend
- Added build preflight evaluator.
- `/api/apps/:id/build` now blocks Android builds with `APK_READINESS_FAILED` when critical requirements are missing.
- API error details include `missingRequirements` so UI can render exact blockers.

### Testing
- Backend integration tests now cover blocked and successful build scenarios.
- Frontend unit tests now cover readiness evaluation.

## Source references
- Android WebView: https://developer.android.com/reference/android/webkit/WebView
- Android security best practices: https://developer.android.com/privacy-and-security/security-best-practices
- TWA integration guide: https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/
- TWA quick start + Bubblewrap: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- Capacitor Android docs: https://capacitorjs.com/docs/android
- Cordova Android guide: https://cordova.apache.org/docs/en/latest/guide/platforms/android/
- App signing and Play App Signing: https://developer.android.com/studio/publish/app-signing
- Android App Bundle format: https://developer.android.com/guide/app-bundle/app-bundle-format
- Google Play target API requirement page: https://developer.android.com/google/play/requirements/target-sdk