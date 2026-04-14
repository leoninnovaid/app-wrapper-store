#!/usr/bin/env node

const platformArgIndex = process.argv.indexOf("--platform");
const platform = platformArgIndex >= 0 ? process.argv[platformArgIndex + 1] : "all";
const validPlatforms = new Set(["android", "ios", "web", "all"]);

if (!validPlatforms.has(platform)) {
  console.error(`[wrapper-validate] Invalid platform "${platform}". Use android, ios, web, or all.`);
  process.exit(1);
}

const env = {
  url: process.env.EXPO_PUBLIC_APP_URL,
  name: process.env.EXPO_PUBLIC_APP_NAME,
  slug: process.env.EXPO_PUBLIC_APP_SLUG,
  primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR,
  accentColor: process.env.EXPO_PUBLIC_ACCENT_COLOR,
  debugEnabled: process.env.EXPO_PUBLIC_ENABLE_WRAPPER_DEBUG,
  debugEndpoint: process.env.EXPO_PUBLIC_DEBUG_ENDPOINT,
};

const checks = [
  {
    label: "App URL is set",
    passed: typeof env.url === "string" && /^https?:\/\//.test(env.url),
    help: "Set EXPO_PUBLIC_APP_URL to a full https:// or http:// URL.",
  },
  {
    label: "App name is set",
    passed: Boolean(env.name && env.name.trim()),
    help: "Set EXPO_PUBLIC_APP_NAME to a user-facing app name.",
  },
  {
    label: "App slug is set",
    passed: Boolean(env.slug && env.slug.trim()),
    help: "Set EXPO_PUBLIC_APP_SLUG to a stable package-safe slug.",
  },
  {
    label: "Primary color is set",
    passed: Boolean(env.primaryColor && env.primaryColor.trim()),
    help: "Set EXPO_PUBLIC_PRIMARY_COLOR for splash and branding consistency.",
  },
  {
    label: "Accent color is set",
    passed: Boolean(env.accentColor && env.accentColor.trim()),
    help: "Set EXPO_PUBLIC_ACCENT_COLOR to match the wrapped app theme.",
  },
];

const debugChecks =
  env.debugEnabled && ["1", "true", "yes", "on"].includes(env.debugEnabled.toLowerCase())
    ? [
        {
          label: "Debug endpoint is configured",
          passed: !env.debugEndpoint || /^https?:\/\//.test(env.debugEndpoint),
          help: "If you use EXPO_PUBLIC_DEBUG_ENDPOINT, it must be a full URL.",
        },
      ]
    : [];

const platformChecklists = {
  android: [
    "Launch with npm run debug:android",
    "Verify initial page load completes and the loading indicator clears",
    "Open the Debug panel and confirm DOM-ready + load events appear",
    "Exercise login, file upload, deep links, and back navigation",
    "Trigger an offline or bad URL scenario and confirm the error is captured",
  ],
  ios: [
    "Launch with npm run debug:ios",
    "Confirm the WebView renders inside safe areas",
    "Open the Debug panel and verify JavaScript bridge events stream in",
    "Exercise camera/microphone/payment flows if the wrapped app uses them",
    "Force a failing request and confirm the diagnostics timeline is actionable",
  ],
  web: [
    "Launch with npm run debug:web",
    "Confirm the same target URL and branding values are loaded",
    "Exercise key user journeys in the browser for parity",
    "Compare console and in-app diagnostics for any mismatches",
  ],
};

console.log("[wrapper-validate] Wrapper configuration validation");
console.log("");

const allChecks = [...checks, ...debugChecks];
let hasFailure = false;
for (const check of allChecks) {
  const marker = check.passed ? "PASS" : "FAIL";
  console.log(`${marker}  ${check.label}`);
  if (!check.passed) {
    hasFailure = true;
    console.log(`      ${check.help}`);
  }
}

console.log("");
const platformsToPrint = platform === "all" ? ["android", "ios", "web"] : [platform];
for (const currentPlatform of platformsToPrint) {
  console.log(`[${currentPlatform}] Suggested validation flow`);
  for (const step of platformChecklists[currentPlatform]) {
    console.log(`  - ${step}`);
  }
  console.log("");
}

if (hasFailure) {
  process.exit(1);
}
