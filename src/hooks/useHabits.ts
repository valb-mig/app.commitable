import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SharedPrefs from 'react-native-shared-preferences';
import { updateWidget } from "../services/widget";

import type { Habit, CommitMap } from "../types";

const STORAGE_KEY = "@commitable_habits";

type ConnectorResponse = {
  days: Record<string, { committed: boolean; message?: string }>;
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setHabits(raw ? (JSON.parse(raw) as Habit[]) : []);
      }  catch (e) {
        console.warn("useHabits failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Habit[], widgetHabitId?: string) => {
    setHabits(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    const widgetHabit = widgetHabitId
      ? next.find((h) => h.id === widgetHabitId) ?? next[0]
      : next[0];
    if (widgetHabit) {
      SharedPrefs.setName("habits");
      SharedPrefs.setItem("habit_commits", JSON.stringify(widgetHabit.commits));
      SharedPrefs.setItem("habit_color", widgetHabit.color.mid);
      SharedPrefs.setItem("habit_name", widgetHabit.name);
      updateWidget();
    }
  }, []);
  
  const addHabit = useCallback(
    (data: Omit<Habit, "id" | "commits">) => {
      const next: Habit = { ...data, id: Date.now().toString(), commits: {} };
      persist([...habits, next]);
    },
    [habits, persist]
  );

  const updateHabit = useCallback(
    (id: string, data: Partial<Omit<Habit, "id" | "commits">>) => {
      persist(habits.map((h) => (h.id === id ? { ...h, ...data } : h)));
    },
    [habits, persist]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
    },
    [habits, persist]
  );

  const commitDay = useCallback(
    (habitId: string, dateKey: string, message = "") => {
      persist(
        habits.map((h) =>
          h.id === habitId
            ? { ...h, commits: { ...h.commits, [dateKey]: { committed: true, message } } }
            : h
        )
      );
    },
    [habits, persist]
  );

  const uncommitDay = useCallback(
    (habitId: string, dateKey: string) => {
      persist(
        habits.map((h) =>
          h.id === habitId
            ? { ...h, commits: { ...h.commits, [dateKey]: { committed: false, message: "" } } }
            : h
        )
      );
    },
    [habits, persist]
  );

  const syncConnector = useCallback(
    async (habitId: string): Promise<{ ok: boolean; error?: string }> => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit?.connectorUrl) return { ok: false, error: "No connector URL configured" };

      try {
        const res = await fetch(habit.connectorUrl);
        if (!res.ok) return { ok: false, error: `Server returned ${res.status}` };

        const json = (await res.json()) as ConnectorResponse;
        if (!json?.days || typeof json.days !== "object") {
          return { ok: false, error: "Invalid response format — expected { days: {...} }" };
        }

        const merged: CommitMap = { ...habit.commits };
        Object.entries(json.days).forEach(([key, val]) => {
          merged[key] = {
            committed: val.committed ?? false,
            message: val.message ?? merged[key]?.message ?? "",
          };
        });
        persist(
          habits.map((h) => (h.id === habitId ? { ...h, commits: merged } : h)),
          habitId
        );
        return { ok: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Connection failed";
        return { ok: false, error: msg };
      }
    },
    [habits, persist]
  );

  const pinWidgetHabit = useCallback(
    (habitId: string | null) => {
      const habit = habitId ? habits.find((h) => h.id === habitId) : habits[0];
      if (!habit) return;
      SharedPrefs.setName("habits");
      SharedPrefs.setItem("habit_commits", JSON.stringify(habit.commits));
      SharedPrefs.setItem("habit_color", habit.color.mid);
      SharedPrefs.setItem("habit_name", habit.name);
      updateWidget();
    },
    [habits]
  );

  return { habits, loading, addHabit, updateHabit, deleteHabit, commitDay, uncommitDay, syncConnector, pinWidgetHabit };
}
