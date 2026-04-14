export interface WrapperThemeConfig {
  primaryColor: string;
  accentColor: string;
}

export interface WrapperDebugConfig {
  enabled: boolean;
  remoteDebugUrl?: string;
  showConsoleEvents: boolean;
  eventBufferSize: number;
}

export interface WrapperAppConfig {
  url: string;
  name: string;
  theme: WrapperThemeConfig;
  debug: WrapperDebugConfig;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const APP_CONFIG: WrapperAppConfig = {
  url: process.env.EXPO_PUBLIC_APP_URL || "https://chat.openai.com",
  name: process.env.EXPO_PUBLIC_APP_NAME || "App",
  theme: {
    primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "#10a37f",
    accentColor: process.env.EXPO_PUBLIC_ACCENT_COLOR || "#ffffff",
  },
  debug: {
    enabled: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_WRAPPER_DEBUG, false),
    remoteDebugUrl: process.env.EXPO_PUBLIC_DEBUG_ENDPOINT || undefined,
    showConsoleEvents: parseBoolean(process.env.EXPO_PUBLIC_DEBUG_CONSOLE_EVENTS, true),
    eventBufferSize: parseNumber(process.env.EXPO_PUBLIC_DEBUG_EVENT_BUFFER_SIZE, 40),
  },
};
