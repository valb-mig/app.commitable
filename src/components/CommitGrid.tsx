import React, { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { View, ScrollView, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { generateWeeks, isFuture, toKey, MONTH_LABELS } from "../utils/date";
import { COLORS, FONT, type HabitColor } from "../utils/theme";
import type { CommitMap } from "../types";

type Props = {
  commits: CommitMap;
  color: HabitColor;
  small?: boolean;
  onDayPress?: (day: Date) => void;
};

const SQ_LARGE = 13;
const SQ_SMALL = 10;
const GAP_LARGE = 3;
const GAP_SMALL = 2;

export default function CommitGrid({
  commits,
  color,
  small = false,
  onDayPress,
}: Props) {
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sq = small ? SQ_SMALL : SQ_LARGE;
  const gap = small ? GAP_SMALL : GAP_LARGE;

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const weeks = useMemo(() => generateWeeks(), []);

  const monthCols = useMemo(() => {
    const cols: { wi: number; m: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, wi) => {
      const firstReal = week.find((d) => !isFuture(d));
      if (firstReal) {
        const m = firstReal.getMonth();
        if (m !== lastMonth) {
          cols.push({ wi, m });
          lastMonth = m;
        }
      }
    });

    return cols;
  }, [weeks]);

  const handlePress = useCallback(
    (day: Date, future: boolean) => {
      if (!future) onDayPress?.(day);
    },
    [onDayPress]
  );

  useEffect(() => {
    if (!ready) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>loading grid...</Text>
      </View>
    );
  }

  const width = weeks.length * (sq + gap);
  const height = 7 * (sq + gap);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View>
        {/* Month labels */}
        {!small && (
          <View style={styles.monthRow}>
            {weeks.map((_, wi) => {
              const label = monthCols.find((mc) => mc.wi === wi);
              return (
                <View key={wi} style={{ width: sq + gap }}>
                  <Text style={styles.monthLabel}>
                    {label ? MONTH_LABELS[label.m] : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* SVG GRID */}
        <Svg width={width} height={height}>
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const key = toKey(day);
              const future = isFuture(day);
              const committed = !!commits[key]?.committed;

              let fill = "#161b22";
              if (future) fill = "#0d1117";
              else if (committed) fill = color.mid;

              return (
                <Rect
                  key={`${wi}-${di}`}
                  x={wi * (sq + gap)}
                  y={di * (sq + gap)}
                  width={sq}
                  height={sq}
                  rx={2}
                  fill={fill}
                  stroke={
                    committed && !future
                      ? `${color.bright}33`
                      : COLORS.border
                  }
                  onPress={() => handlePress(day, future)}
                />
              );
            })
          )}
        </Svg>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  monthRow: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 4,
  },
  monthLabel: {
    fontSize: 6,
    color: COLORS.textMuted,
    fontFamily: FONT.regular,
  },
});