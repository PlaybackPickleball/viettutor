/**
 * Dấu Thanh progress — local profile store.
 * Mastery requires ≥80% quiz accuracy; retries never subtract prior best.
 */

import { TONE_CARDS, TONE_MASTERY_THRESHOLD } from "./catalog";
import type {
  ToneChapterId,
  ToneDialect,
  ToneLessonRecord,
  ToneProgressState,
} from "./types";

const STORAGE_KEY = "ami-lingua.tones.v1";

function emptyLesson(): ToneLessonRecord {
  return {
    completed: false,
    bestQuizRatio: 0,
    mastered: false,
    attempts: 0,
    lastCompletedAt: null,
  };
}

export function defaultToneProgress(): ToneProgressState {
  return {
    version: 1,
    dialect: "southern",
    fundamentalsDone: false,
    chaptersDone: {},
    baselinePitchHz: null,
    lessons: Object.fromEntries(TONE_CARDS.map((c) => [c.id, emptyLesson()])),
    masteryTest: {
      attempts: 0,
      bestRatio: 0,
      passed: false,
      lastAttemptAt: null,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function loadToneProgress(): ToneProgressState {
  if (typeof window === "undefined") return defaultToneProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultToneProgress();
    const parsed = JSON.parse(raw) as ToneProgressState;
    if (parsed.version !== 1) return defaultToneProgress();
    const base = defaultToneProgress();
    return {
      ...base,
      ...parsed,
      chaptersDone: { ...base.chaptersDone, ...parsed.chaptersDone },
      lessons: { ...base.lessons, ...parsed.lessons },
      masteryTest: { ...base.masteryTest, ...parsed.masteryTest },
    };
  } catch {
    return defaultToneProgress();
  }
}

export function saveToneProgress(state: ToneProgressState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function setToneDialect(dialect: ToneDialect): ToneProgressState {
  const state = loadToneProgress();
  const next = { ...state, dialect };
  saveToneProgress(next);
  return next;
}

export function markToneFundamentalsDone(): ToneProgressState {
  const state = loadToneProgress();
  const next = {
    ...state,
    fundamentalsDone: true,
    chaptersDone: { ...state.chaptersDone, intro: true },
  };
  saveToneProgress(next);
  return next;
}

export function markToneChapterDone(chapter: ToneChapterId): ToneProgressState {
  const state = loadToneProgress();
  const next = {
    ...state,
    fundamentalsDone: chapter === "intro" ? true : state.fundamentalsDone,
    chaptersDone: { ...state.chaptersDone, [chapter]: true },
  };
  saveToneProgress(next);
  return next;
}

export function setToneBaselinePitch(hz: number | null): ToneProgressState {
  const state = loadToneProgress();
  const next = { ...state, baselinePitchHz: hz };
  saveToneProgress(next);
  return next;
}

export function recordToneLessonQuiz(
  toneId: string,
  correct: number,
  total: number,
): ToneProgressState {
  const state = loadToneProgress();
  const prev = state.lessons[toneId] ?? emptyLesson();
  const ratio = total <= 0 ? 1 : correct / total;
  const best = Math.max(prev.bestQuizRatio, ratio);
  const mastered = best >= TONE_MASTERY_THRESHOLD;
  const nextLesson: ToneLessonRecord = {
    completed: true,
    bestQuizRatio: best,
    mastered,
    attempts: prev.attempts + 1,
    lastCompletedAt: new Date().toISOString(),
  };
  const next = {
    ...state,
    lessons: { ...state.lessons, [toneId]: nextLesson },
  };
  saveToneProgress(next);
  return next;
}

export function recordMasteryTest(correct: number, total: number): ToneProgressState {
  const state = loadToneProgress();
  const ratio = total <= 0 ? 1 : correct / total;
  const best = Math.max(state.masteryTest.bestRatio, ratio);
  const next = {
    ...state,
    masteryTest: {
      attempts: state.masteryTest.attempts + 1,
      bestRatio: best,
      passed: best >= TONE_MASTERY_THRESHOLD || state.masteryTest.passed,
      lastAttemptAt: new Date().toISOString(),
    },
  };
  saveToneProgress(next);
  return next;
}

export function tonesMasteredCount(state = loadToneProgress()): number {
  return TONE_CARDS.filter((c) => state.lessons[c.id]?.mastered).length;
}

export function allTonesMastered(state = loadToneProgress()): boolean {
  return tonesMasteredCount(state) === TONE_CARDS.length;
}

export function continueToneHref(state = loadToneProgress()): string {
  if (!state.chaptersDone.intro) return "/dau-thanh";
  if (!state.chaptersDone.pitch) return "/dau-thanh?chapter=pitch";
  for (const card of TONE_CARDS) {
    if (!state.lessons[card.id]?.mastered) return `/dau-thanh/${card.id}`;
  }
  if (!state.masteryTest.passed) return "/dau-thanh/mastery";
  return "/dau-thanh?chapter=practice";
}
