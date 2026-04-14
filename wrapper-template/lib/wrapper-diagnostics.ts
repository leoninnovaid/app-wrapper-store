import type { WebViewMessageEvent } from "react-native-webview";

export type WrapperDiagnosticLevel = "info" | "warn" | "error";
export type WrapperDiagnosticSource = "native" | "webview" | "bridge";

export interface WrapperDiagnosticEvent {
  id: string;
  timestamp: string;
  level: WrapperDiagnosticLevel;
  source: WrapperDiagnosticSource;
  type: string;
  message: string;
  details?: Record<string, unknown>;
}

interface BridgeMessage {
  __wrapperDebug?: true;
  type?: string;
  level?: WrapperDiagnosticLevel;
  message?: string;
  details?: Record<string, unknown>;
}

export function createDiagnosticEvent(
  source: WrapperDiagnosticSource,
  type: string,
  message: string,
  level: WrapperDiagnosticLevel = "info",
  details?: Record<string, unknown>,
): WrapperDiagnosticEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    source,
    type,
    level,
    message,
    details,
  };
}

export function parseBridgeMessage(event: WebViewMessageEvent): WrapperDiagnosticEvent | null {
  try {
    const payload = JSON.parse(event.nativeEvent.data) as BridgeMessage;
    if (!payload.__wrapperDebug || !payload.type || !payload.message) {
      return null;
    }

    return createDiagnosticEvent(
      payload.type === "bridge:log" ? "bridge" : "webview",
      payload.type,
      payload.message,
      payload.level ?? "info",
      payload.details,
    );
  } catch (error) {
    return createDiagnosticEvent("bridge", "bridge:parse-error", "Unable to parse WebView diagnostic message", "warn", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function buildInjectedDebugScript(showConsoleEvents: boolean): string {
  const consoleBridge = showConsoleEvents
    ? `
      ['log', 'warn', 'error'].forEach(function(level) {
        var original = console[level];
        console[level] = function() {
          var args = Array.prototype.slice.call(arguments).map(function(value) {
            if (typeof value === 'string') {
              return value;
            }

            try {
              return JSON.stringify(value);
            } catch (error) {
              return String(value);
            }
          });

          postDebug('bridge:log', level === 'error' ? 'error' : (level === 'warn' ? 'warn' : 'info'), 'console.' + level + ': ' + args.join(' '));
          if (typeof original === 'function') {
            original.apply(console, arguments);
          }
        };
      });
    `
    : "";

  return `
    (function() {
      function postDebug(type, level, message, details) {
        if (!window.ReactNativeWebView || !window.ReactNativeWebView.postMessage) {
          return;
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({
          __wrapperDebug: true,
          type: type,
          level: level,
          message: message,
          details: details || {}
        }));
      }

      window.addEventListener('error', function(event) {
        postDebug('bridge:error', 'error', event.message || 'Unhandled window error', {
          filename: event.filename,
          line: event.lineno,
          column: event.colno
        });
      });

      window.addEventListener('unhandledrejection', function(event) {
        postDebug('bridge:promise-rejection', 'error', 'Unhandled promise rejection', {
          reason: event.reason ? String(event.reason) : 'unknown'
        });
      });

      document.addEventListener('DOMContentLoaded', function() {
        postDebug('bridge:dom-ready', 'info', 'DOM ready', {
          title: document.title,
          url: window.location.href
        });
      });

      window.addEventListener('load', function() {
        postDebug('bridge:window-load', 'info', 'Window load complete', {
          title: document.title,
          url: window.location.href
        });
      });

      ${consoleBridge}
      true;
    })();
  `;
}
