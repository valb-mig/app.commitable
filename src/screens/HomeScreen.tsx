import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import HabitCard from "../components/HabitCard";
import CommitGrid from "../components/CommitGrid";
import CommitList from "../components/CommitList";
import CommitModal from "../components/CommitModal";
import { today, toKey } from "../utils/date";
import { computeStats } from "../utils/stats";
import { COLORS, FONT } from "../utils/theme";
import type { Habit } from "../types";

type Props = {
  habits: Habit[];
  filterId: string | null;
  onSelectHabit: (id: string | null) => void;
  commitDay: (habitId: string, dateKey: string, message: string) => void;
  uncommitDay: (habitId: string, dateKey: string) => void;
  deleteHabit: (id: string) => void;
  syncConnector: (habitId: string) => Promise<{ ok: boolean; error?: string }>;
  onBackup: () => void;
  onNavigateCreate: () => void;
  onNavigateEdit: (habit: Habit) => void;
};

export default function HomeScreen({
  habits,
  filterId,
  onSelectHabit,
  commitDay,
  uncommitDay,
  deleteHabit,
  syncConnector,
  onBackup,
  onNavigateCreate,
  onNavigateEdit,
}: Props) {
  const [modalDay, setModalDay] = useState<Date | null>(null);
  const [modalHabitId, setModalHabitId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const filtered = filterId ? habits.find((h) => h.id === filterId) ?? null : null;
  const modalHabit = modalHabitId ? habits.find((h) => h.id === modalHabitId) ?? null : null;

  useEffect(() => {
    setShowGrid(false);
    const id = requestAnimationFrame(() => setShowGrid(true));
    return () => cancelAnimationFrame(id);
  }, [filterId]);

  const handleSync = async () => {
    if (!filtered || syncing) return;
    setSyncing(true);
    const result = await syncConnector(filtered.id);
    setSyncing(false);
    if (!result.ok) Alert.alert("Sync failed", result.error ?? "Unknown error");
  };

  const openModal = (habit: Habit, day: Date) => {
    setModalHabitId(habit.id);
    setModalDay(day);
  };

  const closeModal = () => {
    setModalDay(null);
    setModalHabitId(null);
  };

  const handleHeaderBtn = () => {
    if (filtered) {
      openModal(filtered, today());
    } else {
      onNavigateCreate();
    }
  };

  const todayKey = toKey(today());
  const todayCommitted = filtered ? filtered.commits[todayKey]?.committed : false;

  const confirmDelete = () => {
    Alert.alert(
      "Remove habit",
      `Are you sure you want to remove "${filtered?.name}"? All history will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteHabit(filtered?.id ?? "");
            onSelectHabit(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSub, { fontFamily: FONT.regular }]}>❯ ~/commitable</Text>
          <Text style={[styles.headerTitle, { fontFamily: FONT.bold }]}>Commitable</Text>
        </View>
        <View style={styles.headerActions}>
          {!filtered && (
            <TouchableOpacity style={styles.backupBtn} onPress={onBackup} activeOpacity={0.7}>
              <Text style={[styles.backupBtnText, { fontFamily: FONT.regular }]}>⇅</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.headerBtn,
              filtered && {
                backgroundColor: todayCommitted ? filtered.color.base : filtered.color.mid,
                borderColor: filtered.color.bright,
              },
            ]}
            onPress={handleHeaderBtn}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.headerBtnText,
                { fontFamily: FONT.bold },
                filtered && { color: "#fff" },
              ]}
            >
              {filtered
                ? todayCommitted
                  ? "✓ edit commit"
                  : "❯ commit"
                : "+ new habit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          onPress={() => onSelectHabit(null)}
          style={[styles.filterChip, !filterId && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              { fontFamily: FONT.regular, color: !filterId ? COLORS.text : COLORS.textMuted },
            ]}
          >
            todos
          </Text>
        </TouchableOpacity>
        {habits.map((h) => (
          <TouchableOpacity
            key={h.id}
            onPress={() => onSelectHabit(filterId === h.id ? null : h.id)}
            style={[
              styles.filterChip,
              filterId === h.id && { backgroundColor: h.color.base, borderColor: h.color.mid },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { fontFamily: FONT.regular, color: filterId === h.id ? COLORS.text : COLORS.textMuted },
              ]}
            >
              ❯ {h.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered ? (
          <View>
            <View style={[styles.bigCard, { borderColor: filtered.color.mid }]}>
              <View style={styles.bigCardHeader}>
                <View style={styles.nameRow}>
                  <View style={[styles.dot, { backgroundColor: filtered.color.bright }]} />
                  <Text style={[styles.bigName, { fontFamily: FONT.bold }]}>❯ {filtered.name}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => onNavigateEdit(filtered)}>
                    <Text style={[styles.editBtn, { fontFamily: FONT.regular }]}>edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDelete}>
                    <Text style={[styles.deleteBtnText, { fontFamily: FONT.regular }]}>remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showGrid ? (
                <CommitGrid
                  commits={filtered.commits}
                  color={filtered.color}
                  onDayPress={(day) => openModal(filtered, day)}
                />
              ) : (
                <View style={{ height: 120, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>preparing grid...</Text>
                </View>
              )}

              {/* Stats */}
              {(() => {
                const s = computeStats(filtered.commits);
                return (
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { fontFamily: FONT.bold, color: filtered.color.mid }]}>
                        {s.currentStreak}
                      </Text>
                      <Text style={[styles.statLabel, { fontFamily: FONT.regular }]}>streak</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { fontFamily: FONT.bold, color: filtered.color.mid }]}>
                        {s.longestStreak}
                      </Text>
                      <Text style={[styles.statLabel, { fontFamily: FONT.regular }]}>best</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { fontFamily: FONT.bold, color: filtered.color.mid }]}>
                        {s.completionRate30d}%
                      </Text>
                      <Text style={[styles.statLabel, { fontFamily: FONT.regular }]}>30d</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { fontFamily: FONT.bold, color: filtered.color.mid }]}>
                        {s.totalCommits}
                      </Text>
                      <Text style={[styles.statLabel, { fontFamily: FONT.regular }]}>total</Text>
                    </View>
                  </View>
                );
              })()}

              {filtered.connectorUrl ? (
                <TouchableOpacity onPress={handleSync} disabled={syncing} style={styles.syncRow}>
                  {syncing ? (
                    <ActivityIndicator size={10} color={filtered.color.mid} style={{ marginRight: 6 }} />
                  ) : (
                    <Text style={[styles.connectorLabel, { color: filtered.color.mid, fontFamily: FONT.regular }]}>⬡</Text>
                  )}
                  <Text style={[styles.connectorLabel, { color: syncing ? filtered.color.base : filtered.color.mid, fontFamily: FONT.regular }]}>
                    {syncing ? "syncing..." : "sync connector"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.logCard}>
              <Text style={[styles.logTitle, { fontFamily: FONT.regular }]}>
                ❯ git log --oneline {filtered.name}/
              </Text>
              <CommitList habit={filtered} />
            </View>
          </View>
        ) : (
          <View>
            {habits.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { fontFamily: FONT.regular }]}>no habit found yet</Text>
                <Text style={[styles.emptyHint, { fontFamily: FONT.regular }]}>
                  touch "+ new habit" to start
                </Text>
              </View>
            )}
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                selected={filterId === h.id}
                onPress={() => onSelectHabit(filterId === h.id ? null : h.id)}
                onDayPress={(day) => openModal(h, day)}
                onLongPress={() => onNavigateEdit(h)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CommitModal
        visible={!!modalDay}
        day={modalDay}
        habit={modalHabit}
        onClose={closeModal}
        onSave={(key, msg) => { if (modalHabitId) commitDay(modalHabitId, key, msg); }}
        onRemove={(key) => { if (modalHabitId) uncommitDay(modalHabitId, key); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerSub: { color: COLORS.textMuted, fontSize: 10 },
  headerTitle: { color: COLORS.text, fontSize: 22, letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  backupBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  backupBtnText: { color: COLORS.textMuted, fontSize: 14 },
  headerBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderMid,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  headerBtnText: { color: COLORS.text, fontSize: 12 },
  filterBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.surface, borderColor: COLORS.borderMid },
  filterChipText: { fontSize: 11 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  bigCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bigCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  bigName: { color: COLORS.text, fontSize: 16 },
  editBtn: { color: COLORS.textGhost, fontSize: 13 },
  deleteBtnText: { color: COLORS.danger, fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, letterSpacing: -0.5 },
  statLabel: { color: COLORS.textGhost, fontSize: 9, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  connectorLabel: { fontSize: 10 },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  logCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logTitle: { color: COLORS.textMuted, fontSize: 11, marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: COLORS.textGhost, fontSize: 14, marginBottom: 6 },
  emptyHint: { color: COLORS.textGhost, fontSize: 11 },
});
