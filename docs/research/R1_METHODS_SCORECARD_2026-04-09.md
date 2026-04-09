# R1 Methods Scorecard (Snapshot: 2026-04-09)

## Decision question

Which method should be default for converting websites into Android apps, given reliability, policy compliance, and implementation speed?

## Methods evaluated

- WebView wrapper
- Trusted Web Activity (TWA)
- Capacitor Android
- Apache Cordova Android

## Scoring model

Scale: 1 (weak) to 5 (strong)

Criteria:

1. Setup speed
2. Operational reliability
3. Play policy alignment
4. Native extension flexibility
5. Long-term maintenance risk

## Preliminary scorecard

| Method | Setup speed | Reliability | Policy alignment | Native flexibility | Maintenance risk (inverse) | Total |
|---|---:|---:|---:|---:|---:|---:|
| WebView wrapper | 5 | 3 | 3 | 3 | 3 | 17 |
| TWA | 3 | 4 | 5 | 2 | 4 | 18 |
| Capacitor | 4 | 4 | 4 | 5 | 4 | 21 |
| Cordova | 3 | 3 | 4 | 4 | 3 | 17 |

## Recommendation (inference)

- Default for local/sideload use cases: `webview` (fastest path, lowest setup friction).
- Default for Play-distributed PWA-centric apps: `twa`.
- Default for web apps requiring richer native APIs: `capacitor`.
- Cordova remains fallback for legacy plugin compatibility.

This recommendation is an inference from official documentation and known integration constraints; prototype runs are still required for final sign-off.

## Concrete next steps

1. Build one minimal prototype per method with same test URL and shared acceptance checks.
2. Measure time-to-first-successful-build and time-to-fix for one forced failure case per method.
3. Record exact command set and required toolchain versions for reproducibility.
4. Freeze default strategy rules in backend policy config.

## Evidence sources (retrieved 2026-04-09)

- TWA quick start and Bubblewrap workflow:
- https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- TWA integration and Digital Asset Links association:
- https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/
- Android App Links assetlinks.json requirements:
- https://developer.android.com/training/app-links/configure-assetlinks
- Capacitor Android target SDK constraints:
- https://capacitorjs.com/docs/android/setting-target-sdk
- Capacitor Play deployment notes:
- https://capacitorjs.com/docs/android/deploying-to-google-play
- Cordova Android API/toolchain matrix:
- https://cordova.apache.org/docs/en/latest/guide/platforms/android/
- WebView URI loading security risk and mitigations:
- https://developer.android.com/privacy-and-security/risks/unsafe-uri-loading