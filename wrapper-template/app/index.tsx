import React, { useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

/**
 * WebView Wrapper Component
 * Loads a website/app URL in a native WebView container
 * 
 * This component is used by the App Wrapper Store to display
 * websites as native Android/iOS apps.
 */

interface AppConfig {
  url: string;
  name: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
  };
}

// App configuration (injected at build time)
const APP_CONFIG: AppConfig = {
  url: process.env.EXPO_PUBLIC_APP_URL || "https://chat.openai.com",
  name: process.env.EXPO_PUBLIC_APP_NAME || "App",
  theme: {
    primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "#10a37f",
    accentColor: process.env.EXPO_PUBLIC_ACCENT_COLOR || "#ffffff",
  },
};

export default function WebViewWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
  };

  // Inject JavaScript to improve UX
  const injectedJavaScript = `
    (function() {
      // Remove browser-specific UI elements if needed
      // Adjust viewport for better mobile experience
      window.addEventListener('message', (event) => {
        console.log('Message from WebView:', event.data);
      });
    })();
    true;
  `;

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
});
