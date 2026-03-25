import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import CommitGrid from "./CommitGrid";
import { COLORS, FONT } from "../utils/theme";
import type { Habit } from "../types";

type Props = {
  habit: Habit;
  selected: boolean;
  onPress: () => void;
  onDayPress: (day: Date) => void;
  onLongPress: () => void;
};

export default function HabitCard({ habit, selected, onPress, onDayPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={600}
      style={[styles.card, { borderColor: selected ? habit.color.mid : COLORS.border }]}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <View style={[styles.dot, { backgroundColor: habit.color.bright }]} />
          <Text style={[styles.name, { fontFamily: FONT.bold }]}>❯ {habit.name}</Text>
        </View>
      </View>

      <CommitGrid commits={habit.commits} color={habit.color} small onDayPress={onDayPress} />

      {habit.connectorUrl ? (
        <Text style={[styles.connector, { color: habit.color.mid, fontFamily: FONT.regular }]}>
          ⬡ conector ativo
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 14,
  },
  streak: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  connector: {
    fontSize: 10,
    marginTop: 10,
  },
});
