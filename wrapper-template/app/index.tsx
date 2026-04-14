import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { DebugPanel } from "../components/DebugPanel";
import { APP_CONFIG } from "../lib/wrapper-config";
import {
  buildInjectedDebugScript,
  createDiagnosticEvent,
  parseBridgeMessage,
  type WrapperDiagnosticEvent,
} from "../lib/wrapper-diagnostics";

export default function WebViewWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(false);
  const [events, setEvents] = useState<WrapperDiagnosticEvent[]>([]);
  const webViewRef = useRef<WebView>(null);

  const pushEvent = (event: WrapperDiagnosticEvent) => {
    setEvents((current) => [event, ...current].slice(0, APP_CONFIG.debug.eventBufferSize));
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    pushEvent(createDiagnosticEvent("native", "webview:load-start", "WebView started loading", "info"));
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    pushEvent(createDiagnosticEvent("native", "webview:load-end", "WebView finished loading", "info"));
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
    pushEvent(
      createDiagnosticEvent("native", "webview:error", nativeEvent.description || "WebView load error", "error", {
        url: nativeEvent.url,
        code: nativeEvent.code,
      }),
    );
  };

  const injectedJavaScript = buildInjectedDebugScript(APP_CONFIG.debug.showConsoleEvents);

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    pushEvent(
      createDiagnosticEvent("native", "webview:http-error", `HTTP ${nativeEvent.statusCode}`, "error", {
        description: nativeEvent.description,
        url: nativeEvent.url,
        statusCode: nativeEvent.statusCode,
      }),
    );
  };

  const handleMessage = (event: any) => {
    const diagnosticEvent = parseBridgeMessage(event);
    if (diagnosticEvent) {
      pushEvent(diagnosticEvent);
    }
  };

  const handleReload = () => {
    pushEvent(createDiagnosticEvent("native", "wrapper:reload", "Manual WebView reload requested", "warn"));
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={APP_CONFIG.theme?.primaryColor || "#10a37f"}
            />
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: APP_CONFIG.url }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleHttpError}
          onMessage={handleMessage}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsBackForwardNavigationGestures={true}
          userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
          // Enable cookies and local storage
          sharedCookiesEnabled={true}
          // Security settings
          allowFileAccess={false}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={false}
          mixedContentMode="always"
        />

        {APP_CONFIG.debug.enabled ? (
          <Pressable
            onPress={() => setIsDebugPanelVisible(true)}
            style={styles.debugButton}
          >
            <Text style={styles.debugButtonText}>Debug</Text>
          </Pressable>
        ) : null}

        <DebugPanel
          visible={isDebugPanelVisible}
          events={events}
          appName={APP_CONFIG.name}
          appUrl={APP_CONFIG.url}
          onClose={() => setIsDebugPanelVisible(false)}
          onClear={() => setEvents([])}
          onReload={handleReload}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  debugButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#0f766e",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },
  debugButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
