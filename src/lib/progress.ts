import type { LetterId } from "./letters";
import { LEVEL1_LETTERS, MASTERY_SAY_STREAK } from "./letters";

export type LetterProgress = {
  heard: boolean;
  sayStreak: number;
  sayMastered: boolean;
  written: boolean;
  objectSeen: boolean;
  attempts: number;
};

export type ProgressState = {
  dialect: "southern";
  currentLetterId: LetterId;
  letters: Record<string, LetterProgress>;
  updatedAt: string;
};

const STORAGE_KEY = "ami-lingua.progress.v1";

function emptyLetter(): LetterProgress {
  return {
    heard: false,
    sayStreak: 0,
    sayMastered: false,
    written: false,
    objectSeen: false,
    attempts: 0,
  };
}

export function defaultProgress(): ProgressState {
  const letters: Record<string, LetterProgress> = {};
  for (const l of LEVEL1_LETTERS) {
    letters[l.id] = emptyLetter();
  }
  return {
    dialect: "southern",
    currentLetterId: LEVEL1_LETTERS[0].id,
    letters,
    updatedAt: new Date().toISOString(),
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    // Merge new letters if curriculum grows
    const base = defaultProgress();
    return {
      ...base,
      ...parsed,
      letters: { ...base.letters, ...parsed.letters },
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

export function markHeard(state: ProgressState, id: string): ProgressState {
  const letter = { ...(state.letters[id] ?? emptyLetter()), heard: true };
  const next = {
    ...state,
    currentLetterId: id as LetterId,
    letters: { ...state.letters, [id]: letter },
  };
  saveProgress(next);
  return next;
}

export function recordSayAttempt(
  state: ProgressState,
  id: string,
  passed: boolean,
): ProgressState {
  const prev = state.letters[id] ?? emptyLetter();
  const sayStreak = passed ? prev.sayStreak + 1 : 0;
  const sayMastered = prev.sayMastered || sayStreak >= MASTERY_SAY_STREAK;
  const letter: LetterProgress = {
    ...prev,
    attempts: prev.attempts + 1,
    sayStreak,
    sayMastered,
  };
  const next = {
    ...state,
    currentLetterId: id as LetterId,
    letters: { ...state.letters, [id]: letter },
  };
  saveProgress(next);
  return next;
}

export function markWritten(state: ProgressState, id: string): ProgressState {
  const letter = { ...(state.letters[id] ?? emptyLetter()), written: true };
  const next = {
    ...state,
    letters: { ...state.letters, [id]: letter },
  };
  saveProgress(next);
  return next;
}

export function markObjectSeen(state: ProgressState, id: string): ProgressState {
  const letter = { ...(state.letters[id] ?? emptyLetter()), objectSeen: true };
  const next = {
    ...state,
    letters: { ...state.letters, [id]: letter },
  };
  saveProgress(next);
  return next;
}

export function isLetterComplete(p: LetterProgress | undefined): boolean {
  if (!p) return false;
  return p.heard && p.sayMastered && p.written && p.objectSeen;
}

export function masteryCounts(state: ProgressState) {
  const total = LEVEL1_LETTERS.length;
  let mastered = 0;
  let inProgress = 0;
  for (const l of LEVEL1_LETTERS) {
    const p = state.letters[l.id];
    if (isLetterComplete(p)) mastered += 1;
    else if (p && (p.heard || p.attempts > 0 || p.written || p.objectSeen)) inProgress += 1;
  }
  return { mastered, inProgress, total };
}

export function continueHref(state: ProgressState): string {
  const id = state.currentLetterId;
  const p = state.letters[id] ?? emptyLetter();
  if (!p.heard) return `/studio/${id}/hear`;
  if (!p.sayMastered) return `/studio/${id}/say`;
  if (!p.written) return `/studio/${id}/write`;
  if (!p.objectSeen) return `/studio/${id}/object`;
  const next = LEVEL1_LETTERS.find((l) => l.order === (LEVEL1_LETTERS.find((x) => x.id === id)?.order ?? 0) + 1);
  if (next) return `/studio/${next.id}/hear`;
  return `/studio/${id}/object`;
}
