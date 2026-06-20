export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatPrettyDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function minutesToHM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00").getTime();
  const today = new Date(todayISO() + "T00:00:00").getTime();
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case "High":
      return "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300";
    case "Medium":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300";
    default:
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "InProgress":
      return "bg-blush-100 text-blush-600 dark:bg-blush-900/40 dark:text-blush-300";
    default:
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300";
  }
}
