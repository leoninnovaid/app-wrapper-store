import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { WrapperDiagnosticEvent } from "../lib/wrapper-diagnostics";

interface DebugPanelProps {
  visible: boolean;
  events: WrapperDiagnosticEvent[];
  appName: string;
  appUrl: string;
  onClose: () => void;
  onClear: () => void;
  onReload: () => void;
}

export function DebugPanel({
  visible,
  events,
  appName,
  appUrl,
  onClose,
  onClear,
  onReload,
}: DebugPanelProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wrapper Diagnostics</Text>
            <Text style={styles.meta}>{appName}</Text>
            <Text style={styles.meta}>{appUrl}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onReload} style={styles.actionButton}>
            <Text style={styles.actionText}>Reload WebView</Text>
          </Pressable>
          <Pressable onPress={onClear} style={styles.actionButton}>
            <Text style={styles.actionText}>Clear Events</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.eventList}>
          {events.length === 0 ? (
            <Text style={styles.emptyText}>No events captured yet.</Text>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventHeader}>
                  [{event.level.toUpperCase()}] {event.type}
                </Text>
                <Text style={styles.eventBody}>{event.message}</Text>
                <Text style={styles.eventMeta}>
                  {event.timestamp} | {event.source}
                </Text>
                {event.details ? (
                  <Text style={styles.eventDetails}>
                    {JSON.stringify(event.details, null, 2)}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08131a",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: {
    color: "#b5c7d3",
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: "#103244",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  eventList: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyText: {
    color: "#d3dee5",
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: "#11222b",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  eventHeader: {
    color: "#7dd3fc",
    fontWeight: "700",
    fontSize: 13,
  },
  eventBody: {
    color: "#ffffff",
    fontSize: 14,
  },
  eventMeta: {
    color: "#b5c7d3",
    fontSize: 11,
  },
  eventDetails: {
    color: "#d7e6ee",
    fontFamily: "monospace",
    fontSize: 11,
  },
});
