export function toKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function today(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function isFuture(date: Date): boolean {
  return date > today();
}

export function generateWeeks(): Date[][] {
  const t = today();
  const days: Date[] = [];

  const start = new Date(t);
  start.setFullYear(t.getFullYear() - 1);
  start.setDate(start.getDate() - start.getDay());

  for (let d = new Date(start); d <= t; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const extra = 6 - today().getDay();
  for (let i = 1; i <= extra; i++) {
    const fd = new Date(t);
    fd.setDate(t.getDate() + i);
    days.push(fd);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function formatDatePtBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortPtBR(dateKey: string): string {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
