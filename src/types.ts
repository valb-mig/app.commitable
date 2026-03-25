import type { HabitColor } from "./utils/theme";

export type DayCommit = {
  committed: boolean;
  message: string;
};

export type CommitMap = Record<string, DayCommit>;

export type Habit = {
  id: string;
  name: string;
  color: HabitColor;
  connectorUrl: string;
  commits: CommitMap;
};

export type Screen = "home" | "create" | "edit";
