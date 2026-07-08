import type { CommitMap } from "../types";
import { today, toKey } from "./date";

export type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  completionRate30d: number;
  totalCommits: number;
};

export function computeStats(commits: CommitMap): HabitStats {
  const todayDate = today();
  const committed = new Set(
    Object.entries(commits)
      .filter(([, v]) => v.committed)
      .map(([k]) => k)
  );

  const totalCommits = committed.size;

  // Current streak — count backwards from today
  let currentStreak = 0;
  const cursor = new Date(todayDate);
  while (committed.has(toKey(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak — scan all committed dates sorted
  const sortedDays = Array.from(committed).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const key of sortedDays) {
    const d = new Date(key + "T00:00:00");
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = d;
  }

  // Completion rate over last 30 days
  let days30 = 0;
  const c30 = new Date(todayDate);
  c30.setDate(c30.getDate() - 29);
  for (let i = 0; i < 30; i++) {
    if (committed.has(toKey(c30))) days30++;
    c30.setDate(c30.getDate() + 1);
  }
  const completionRate30d = Math.round((days30 / 30) * 100);

  return { currentStreak, longestStreak: longest, completionRate30d, totalCommits };
}
