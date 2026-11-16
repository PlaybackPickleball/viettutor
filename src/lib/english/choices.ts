import type { Choice, SpokenLine } from "./lessonTypes";

export function choices(rows: [string, string][]): Choice[] {
  return rows.map(([id, label]) => ({ id, label }));
}

export function talk(
  teacher: [string, string],
  learner: [string, string],
  close: [string, string],
): SpokenLine[] {
  return [
    { who: "teacher", en: teacher[0], vi: teacher[1] },
    { who: "learner", en: learner[0], vi: learner[1] },
    { who: "teacher", en: close[0], vi: close[1] },
  ];
}
