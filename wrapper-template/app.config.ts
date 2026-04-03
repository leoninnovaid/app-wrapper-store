import type { ExpoConfig } from "expo/config";

/**
 * App configuration for App Wrapper Store template
 * This is dynamically generated based on app configuration
 */

const env = {
  // These values are injected at build time
  appName: process.env.EXPO_PUBLIC_APP_NAME || "App Wrapper",
  appSlug: process.env.EXPO_PUBLIC_APP_SLUG || "app-wrapper",
  appUrl: process.env.EXPO_PUBLIC_APP_URL || "https://example.com",
  primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "#10a37f",
  accentColor: process.env.EXPO_PUBLIC_ACCENT_COLOR || "#ffffff",
  iconUrl: process.env.EXPO_PUBLIC_ICON_URL || "./assets/icon.png",
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: env.iconUrl,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: `com.appwrapperstore.${env.appSlug}`,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: env.primaryColor,
      foregroundImage: "./assets/adaptive-icon.png",
    },
    package: `com.appwrapperstore.${env.appSlug}`,
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "MODIFY_AUDIO_SETTINGS",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: env.primaryColor,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
