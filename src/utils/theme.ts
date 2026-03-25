export const COLORS = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#21262d",
  borderMid: "#30363d",
  text: "#e6edf3",
  textMuted: "#8b949e",
  textDim: "#6e7681",
  textGhost: "#484f58",
  danger: "#f85149",
} as const;

export type HabitColor = {
  name: string;
  base: string;
  mid: string;
  bright: string;
};

export const HABIT_COLORS: HabitColor[] = [
  { name: "green",  base: "#196c2e", mid: "#26a641", bright: "#39d353" },
  { name: "purple", base: "#553098", mid: "#8957e5", bright: "#a371f7" },
  { name: "blue",   base: "#1158c7", mid: "#1f6feb", bright: "#388bfd" },
  { name: "orange", base: "#9e6a03", mid: "#d29922", bright: "#f0883e" },
  { name: "pink",   base: "#8a2f6e", mid: "#db61a2", bright: "#f778ba" },
  { name: "cyan",   base: "#0e6a6e", mid: "#1b9fa5", bright: "#39c5cf" },
  { name: "red",    base: "#8a1c1c", mid: "#c62828", bright: "#f44336" },
  { name: "yellow", base: "#7d6608", mid: "#b8860b", bright: "#e3b341" },
];

export const FONT = {
  regular: "JetBrainsMono_400Regular",
  semiBold: "JetBrainsMono_600SemiBold",
  bold: "JetBrainsMono_700Bold",
} as const;
