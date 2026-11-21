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
  /** Latest provider overall score when claimed — null for VI Deepgram match path. */
  sayLatestScore: number | null;
  /** Best provider overall score for this letter — null when none scored. */
  sayBestScore: number | null;
};

export type ProgressState = {
  dialect: "southern";
  currentLetterId: LetterId;
  letters: Record<string, LetterProgress>;
  practiceDates: string[];
  /** Whole minutes derived from practiceSecondsToday (display). */
  minutesToday: number;
  /** Accumulated active practice seconds for minutesDate. */
  practiceSecondsToday: number;
  minutesDate: string;
  /** ISO timestamp of last credited activity (wall-clock gaps). */
  lastActiveAt: string | null;
  updatedAt: string;
};

const STORAGE_KEY = "ami-lingua.progress.v2";

/** Max seconds credited between two activity stamps (tab left open). */
export const MAX_GAP_SECONDS = 120;

function todayKey(nowMs: number = Date.now()): string {
  return new Date(nowMs).toISOString().slice(0, 10);
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
    sayLatestScore: null,
    sayBestScore: null,
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
    practiceSecondsToday: 0,
    minutesDate: todayKey(),
    lastActiveAt: null,
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
    const sameDay = minutesDate === todayKey();
    const practiceSecondsToday = sameDay
      ? Math.max(0, parsed.practiceSecondsToday ?? (parsed.minutesToday ?? 0) * 60)
      : 0;
    return {
      ...base,
      ...parsed,
      letters,
      practiceDates: parsed.practiceDates ?? [],
      practiceSecondsToday,
      minutesToday: Math.floor(practiceSecondsToday / 60),
      minutesDate: todayKey(),
      lastActiveAt: sameDay ? (parsed.lastActiveAt ?? null) : null,
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

/**
 * Credit wall-clock practice since lastActiveAt (capped), mark today as practiced.
 * Does not invent minutes from sparse +1 touch counters.
 */
export function creditPracticeTime(
  state: ProgressState,
  nowMs: number = Date.now(),
): ProgressState {
  const day = todayKey(nowMs);
  const dates = state.practiceDates.includes(day)
    ? state.practiceDates
    : [...state.practiceDates, day].slice(-60);

  let practiceSecondsToday =
    state.minutesDate === day ? Math.max(0, state.practiceSecondsToday ?? 0) : 0;
  const lastMs = state.lastActiveAt ? Date.parse(state.lastActiveAt) : NaN;
  if (state.minutesDate === day && Number.isFinite(lastMs) && nowMs > lastMs) {
    const gapSec = Math.floor((nowMs - lastMs) / 1000);
    practiceSecondsToday += Math.min(MAX_GAP_SECONDS, Math.max(0, gapSec));
  }

  return {
    ...state,
    practiceDates: dates,
    practiceSecondsToday,
    minutesToday: Math.floor(practiceSecondsToday / 60),
    minutesDate: day,
    lastActiveAt: new Date(nowMs).toISOString(),
  };
}

function touchPractice(state: ProgressState): ProgressState {
  return creditPracticeTime(state);
}

/** Persist a wall-clock tick while a practice surface is open. */
export function tickPracticeClock(nowMs: number = Date.now()): ProgressState {
  const next = creditPracticeTime(loadProgress(), nowMs);
  saveProgress(next);
  return next;
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
  quality: number | null,
  options?: { countTowardSet?: boolean },
): ProgressState {
  const prev = state.letters[id] ?? emptyLetter();
  const countTowardSet = options?.countTowardSet !== false;
  /** Store 0 for compare-only cycles (no invented quality). */
  const q = typeof quality === "number" ? quality : 0;
  const alreadyComplete =
    prev.sayMastered || (prev.sayQualities?.length ?? 0) >= SAY_TARGET_REPS;
  /** Unlimited retries after the set: update best/latest only — no XP/mastery farm. */
  const qualities =
    countTowardSet && !alreadyComplete
      ? [...prev.sayQualities, q].slice(-SAY_TARGET_REPS)
      : prev.sayQualities;
  const attempts = prev.attempts + 1;
  const complete = qualities.length >= SAY_TARGET_REPS;
  const scoredQualities = qualities.filter((n) => n > 0);
  const sayAverage =
    complete && scoredQualities.length === qualities.length
      ? Math.round(scoredQualities.reduce((a, b) => a + b, 0) / scoredQualities.length)
      : complete
        ? null
        : prev.sayAverage;
  const sayStreak = passed ? prev.sayStreak + 1 : 0;
  const sayMastered = prev.sayMastered || complete;
  const sayLatestScore = typeof quality === "number" ? quality : prev.sayLatestScore;
  const sayBestScore =
    typeof quality === "number"
      ? prev.sayBestScore == null
        ? quality
        : Math.max(prev.sayBestScore, quality)
      : prev.sayBestScore;
  const letter: LetterProgress = {
    ...prev,
    attempts,
    sayQualities: qualities,
    sayAverage,
    sayStreak,
    sayMastered,
    sayLatestScore,
    sayBestScore,
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
