# Wrapper Testing Framework

This framework standardizes how generated wrappers are tested and debugged before release. It combines native-side diagnostics in the Expo template with a repeatable validation workflow for Android, iOS, and web parity checks.

## Goals

- Make wrapper failures visible without attaching a full native debugger first.
- Capture the same signals across platforms: load lifecycle, HTTP failures, JavaScript runtime errors, and bridge messages.
- Give every generated wrapper the same QA checklist and debug entrypoints.

## What the framework includes

### 1. Built-in diagnostics in `wrapper-template`

Enable diagnostics with:

```bash
EXPO_PUBLIC_ENABLE_WRAPPER_DEBUG=true
```

Optional flags:

```bash
EXPO_PUBLIC_DEBUG_CONSOLE_EVENTS=true
EXPO_PUBLIC_DEBUG_EVENT_BUFFER_SIZE=40
EXPO_PUBLIC_DEBUG_ENDPOINT=https://debug.example.com
```

When enabled, the wrapper exposes:

- Floating `Debug` action inside the app
- Event timeline for `load-start`, `load-end`, HTTP errors, WebView errors
- JavaScript bridge events for:
  - `DOMContentLoaded`
  - `window.load`
  - uncaught browser errors
  - unhandled promise rejections
  - forwarded page console output
- Manual `Reload WebView` control

### 2. Repeatable validation script

Use:

```bash
cd wrapper-template
npm run validate
```

Platform-specific flows:

```bash
npm run debug:android
npm run debug:ios
npm run debug:web
```

The validator checks required environment variables and prints the expected test flow for each platform.

### 3. Cross-platform release checklist

Every wrapped app should pass:

1. Base config validation (`npm run validate`)
2. Android smoke test
3. iOS smoke test
4. Web parity check
5. Failure-path verification with diagnostics enabled

## Recommended workflow

### Local wrapper smoke test

1. Set `EXPO_PUBLIC_APP_URL`, `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_APP_SLUG`, and theme colors.
2. Enable diagnostics with `EXPO_PUBLIC_ENABLE_WRAPPER_DEBUG=true`.
3. Start one platform-specific debug command.
4. Open the in-app debug panel.
5. Validate:
   - initial load succeeds
   - navigation works
   - auth/session state survives reloads
   - back navigation behaves correctly
   - a forced failure produces usable diagnostics

### Android-specific checks

- Validate keyboard behavior, uploads, downloads, and Android back button handling.
- If emulator/device testing is needed, use the Android QA workflow from the Test Android Apps plugin to capture screenshots, logs, and UI state.

### iOS-specific checks

- Validate safe-area layout, gesture navigation, and permission prompts.
- If simulator debugging is needed, use the iOS debugger workflow from the Build iOS Apps plugin.

## Extending the framework

Future improvements can plug into the same event model:

- post captured diagnostics to a remote endpoint
- export a structured session report after test runs
- add Detox/Maestro/E2E automation on top of the current manual checklist
- gate releases on wrapper-template validation in CI
