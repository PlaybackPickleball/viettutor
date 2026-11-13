import type { LetterId } from "./letters";
import {
  ALL_LETTERS,
  LEVELS,
  getLettersForLevel,
  SAY_TARGET_REPS,
} from "./letters";

export type LetterProgress = {
  heard: boolean;
  sayStreak: number;
  sayMastered: boolean;
  written: boolean;
  objectSeen: boolean;
  attempts: number;
  /** Qualities from the current 10-take set (0–100) */
  sayQualities: number[];
  /** Average after completing SAY_TARGET_REPS */
  sayAverage: number | null;
};

export type ProgressState = {
  dialect: "southern";
  currentLetterId: LetterId;
  letters: Record<string, LetterProgress>;
  practiceDates: string[];
  minutesToday: number;
  minutesDate: string;
  updatedAt: string;
};

const STORAGE_KEY = "ami-lingua.progress.v2";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyLetter(): LetterProgress {
  return {
    heard: false,
    sayStreak: 0,
    sayMastered: false,
    written: false,
    objectSeen: false,
    attempts: 0,
    sayQualities: [],
    sayAverage: null,
  };
}

export function defaultProgress(): ProgressState {
  const letters: Record<string, LetterProgress> = {};
  for (const l of ALL_LETTERS) {
    letters[l.id] = emptyLetter();
  }
  return {
    dialect: "southern",
    currentLetterId: ALL_LETTERS[0].id,
    letters,
    practiceDates: [],
    minutesToday: 0,
    minutesDate: todayKey(),
    updatedAt: new Date().toISOString(),
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("ami-lingua.progress.v1");
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const base = defaultProgress();
    const letters: Record<string, LetterProgress> = { ...base.letters };
    for (const [id, p] of Object.entries(parsed.letters ?? {})) {
      letters[id] = { ...emptyLetter(), ...p, sayQualities: p.sayQualities ?? [] };
    }
    const minutesDate = parsed.minutesDate ?? todayKey();
    return {
      ...base,
      ...parsed,
      letters,
      practiceDates: parsed.practiceDates ?? [],
      minutesToday: minutesDate === todayKey() ? (parsed.minutesToday ?? 0) : 0,
      minutesDate: todayKey(),
      dialect: "southern",
      currentLetterId: (parsed.currentLetterId as LetterId) ?? base.currentLetterId,
      updatedAt: parsed.updatedAt ?? base.updatedAt,
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function touchPractice(state: ProgressState): ProgressState {
  const day = todayKey();
  const dates = state.practiceDates.includes(day)
    ? state.practiceDates
    : [...state.practiceDates, day].slice(-60);
  const minutesToday =
    state.minutesDate === day ? state.minutesToday + 1 : 1;
  return { ...state, practiceDates: dates, minutesToday, minutesDate: day };
}

export function practiceStreak(state: ProgressState): number {
  const set = new Set(state.practiceDates);
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function markHeard(state: ProgressState, id: string): ProgressState {
  const letter = { ...(state.letters[id] ?? emptyLetter()), heard: true };
  const next = touchPractice({
    ...state,
    currentLetterId: id as LetterId,
    letters: { ...state.letters, [id]: letter },
  });
  saveProgress(next);
  return next;
}

export function recordSayAttempt(
  state: ProgressState,
  id: string,
  passed: boolean,
  quality: number,
): ProgressState {
  const prev = state.letters[id] ?? emptyLetter();
  const qualities = [...prev.sayQualities, quality].slice(-SAY_TARGET_REPS);
  const attempts = prev.attempts + 1;
  const complete = qualities.length >= SAY_TARGET_REPS;
  const sayAverage = complete
    ? Math.round(qualities.reduce((a, b) => a + b, 0) / qualities.length)
    : prev.sayAverage;
  const sayStreak = passed ? prev.sayStreak + 1 : 0;
  const sayMastered = prev.sayMastered || complete;
  const letter: LetterProgress = {
    ...prev,
    attempts,
    sayQualities: qualities,
    sayAverage,
    sayStreak,
    sayMastered,
  };
  const next = touchPractice({
    ...state,
    currentLetterId: id as LetterId,
    letters: { ...state.letters, [id]: letter },
  });
  saveProgress(next);
  return next;
}

export function resetSaySet(state: ProgressState, id: string): ProgressState {
  const prev = state.letters[id] ?? emptyLetter();
  const letter: LetterProgress = {
    ...prev,
    sayQualities: [],
    sayAverage: null,
    sayMastered: false,
    sayStreak: 0,
  };
  const next = { ...state, letters: { ...state.letters, [id]: letter } };
  saveProgress(next);
  return next;
}

export function markWritten(state: ProgressState, id: string): ProgressState {
  const letter = { ...(state.letters[id] ?? emptyLetter()), written: true };
  const next = touchPractice({
    ...state,
    letters: { ...state.letters, [id]: letter },
  });
  saveProgress(next);
  return next;
}

export function markObjectSeen(state: ProgressState, id: string): ProgressState {
  const letter = { ...(state.letters[id] ?? emptyLetter()), objectSeen: true };
  const next = touchPractice({
    ...state,
    letters: { ...state.letters, [id]: letter },
  });
  saveProgress(next);
  return next;
}

export function isLetterComplete(p: LetterProgress | undefined): boolean {
  if (!p) return false;
  return p.heard && p.sayMastered && p.written && p.objectSeen;
}

export function masteryCounts(state: ProgressState) {
  const total = ALL_LETTERS.length;
  let mastered = 0;
  let inProgress = 0;
  for (const l of ALL_LETTERS) {
    const p = state.letters[l.id];
    if (isLetterComplete(p)) mastered += 1;
    else if (p && (p.heard || p.attempts > 0 || p.written || p.objectSeen)) inProgress += 1;
  }
  return { mastered, inProgress, total };
}

export function isLevelComplete(state: ProgressState, levelId: number): boolean {
  const letters = getLettersForLevel(levelId);
  return letters.length > 0 && letters.every((l) => isLetterComplete(state.letters[l.id]));
}

/** Level 1 always open; later levels unlock when the previous level is fully stamped. */
export function isLevelUnlocked(state: ProgressState, levelId: number): boolean {
  if (levelId <= 1) return true;
  return isLevelComplete(state, levelId - 1);
}

export function levelMastery(state: ProgressState, levelId: number) {
  const letters = getLettersForLevel(levelId);
  const mastered = letters.filter((l) => isLetterComplete(state.letters[l.id])).length;
  return { mastered, total: letters.length };
}

export function currentLevelId(state: ProgressState): number {
  for (const level of LEVELS) {
    if (!isLevelComplete(state, level.id)) return level.id;
  }
  return LEVELS[LEVELS.length - 1]?.id ?? 1;
}

export function continueHref(state: ProgressState): string {
  const id = state.currentLetterId;
  const p = state.letters[id] ?? emptyLetter();
  if (!p.heard) return `/studio/${id}/hear`;
  if (!p.sayMastered) return `/studio/${id}/say`;
  if (!p.written) return `/studio/${id}/write`;
  if (!p.objectSeen) return `/studio/${id}/object`;
  const next = ALL_LETTERS.find(
    (l) => l.order === (ALL_LETTERS.find((x) => x.id === id)?.order ?? 0) + 1,
  );
  if (next && isLevelUnlocked(state, next.levelId)) return `/studio/${next.id}/hear`;
  // Jump to first incomplete letter in the highest unlocked level
  for (const level of LEVELS) {
    if (!isLevelUnlocked(state, level.id)) break;
    for (const l of getLettersForLevel(level.id)) {
      if (!isLetterComplete(state.letters[l.id])) return `/studio/${l.id}/hear`;
    }
  }
  return `/studio/${id}/object`;
}
