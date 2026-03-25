import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT } from "../utils/theme";
import { formatShortPtBR } from "../utils/date";
import type { Habit } from "../types";

type Props = {
  habit: Habit;
};

export default function CommitList({ habit }: Props) {
  const entries = Object.entries(habit.commits)
    .filter(([, v]) => v.committed)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 10);

  if (!entries.length) {
    return (
      <Text style={[styles.empty, { fontFamily: FONT.regular }]}>nenhum commit ainda</Text>
    );
  }

  return (
    <View>
      {entries.map(([key, val]) => (
        <View key={key} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: habit.color.mid }]} />
          <View style={styles.content}>
            <Text style={[styles.date, { fontFamily: FONT.regular }]}>
              {formatShortPtBR(key)}
            </Text>
            {val.message ? (
              <Text style={[styles.message, { fontFamily: FONT.regular }]}>
                "{val.message}"
              </Text>
            ) : (
              <Text style={[styles.noMessage, { fontFamily: FONT.regular }]}>
                sem mensagem
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: COLORS.textGhost,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  content: { flex: 1 },
  date: { color: COLORS.textMuted, fontSize: 11 },
  message: { color: COLORS.text, fontSize: 13, marginTop: 2 },
  noMessage: {
    color: COLORS.textGhost,
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
});
