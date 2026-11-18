/** Honest day-level practice activity (no scores, no invented minutes). */

export type DayActivity = {
  /** YYYY-MM-DD (UTC, same as progress.ts todayKey) */
  date: string;
  /** Short weekday label for UI, e.g. Mon */
  label: string;
  practiced: boolean;
};

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekdayLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00.000Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

/** Collect YYYY-MM-DD keys from ISO timestamps or bare day keys. */
export function dayKeysFromIsoList(values: string[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    const key = v.length >= 10 ? v.slice(0, 10) : v;
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) out.push(key);
  }
  return out;
}

/**
 * Last `days` calendar days ending today (UTC), with practiced=true if the day
 * appears in any of the provided practice day-key lists.
 */
export function buildLastNDayActivity(
  practiceDayLists: string[][],
  days = 7,
  now = new Date(),
): DayActivity[] {
  const set = new Set<string>();
  for (const list of practiceDayLists) {
    for (const key of dayKeysFromIsoList(list)) set.add(key);
  }

  const result: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const cursor = new Date(now);
    cursor.setUTCDate(cursor.getUTCDate() - i);
    const date = utcDayKey(cursor);
    result.push({
      date,
      label: weekdayLabel(date),
      practiced: set.has(date),
    });
  }
  return result;
}

export function countPracticedDays(activity: DayActivity[]): number {
  return activity.filter((d) => d.practiced).length;
}
