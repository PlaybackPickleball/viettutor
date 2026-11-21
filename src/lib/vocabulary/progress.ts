/**
 * Illustrated pack mastery + spaced schedule.
 * Also feeds path SRS skill ids (`pack-v-###`) for Daily Review.
 */

import {
  loadPathProgress,
  recordExerciseResult,
} from "@/lib/phonics/learningPath";
import { getPackLesson, getPackWord, listPackLessons } from "./catalog";
import type { PackProgressState, PackWordProgress } from "./types";

const STORAGE_KEY = "ami-lingua.vocab-pack.v1";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function defaultPackProgress(): PackProgressState {
  return {
    version: 1,
    completedLessonIds: [],
    words: {},
    updatedAt: new Date().toISOString(),
  };
}

export function loadPackProgress(): PackProgressState {
  if (typeof window === "undefined") return defaultPackProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPackProgress();
    const parsed = JSON.parse(raw) as Partial<PackProgressState>;
    return {
      version: 1,
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? parsed.completedLessonIds
        : [],
      words: parsed.words && typeof parsed.words === "object" ? parsed.words : {},
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return defaultPackProgress();
  }
}

export function savePackProgress(state: PackProgressState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function defaultWord(): PackWordProgress {
  return {
    seen: 0,
    known: 0,
    again: 0,
    updatedAt: new Date().toISOString(),
  };
}

/** Self-grade: know → longer interval; again → due tomorrow. Mirrors saved-vocab SRS. */
export function gradePackWord(
  wordId: string,
  grade: "know" | "again",
  today = todayKey(),
): PackProgressState {
  const state = loadPackProgress();
  const prev = state.words[wordId] ?? defaultWord();
  const word = getPackWord(wordId);
  let nextWord: PackWordProgress;
  if (grade === "again") {
    nextWord = {
      ...prev,
      seen: prev.seen + 1,
      again: prev.again + 1,
      lastGrade: "again",
      intervalDays: 1,
      due: addDays(today, 1),
      updatedAt: new Date().toISOString(),
    };
  } else {
    const intervalDays = Math.min(14, Math.max(1, (prev.intervalDays ?? 0) || 1) * 2);
    nextWord = {
      ...prev,
      seen: prev.seen + 1,
      known: prev.known + 1,
      lastGrade: "know",
      intervalDays,
      due: addDays(today, intervalDays),
      updatedAt: new Date().toISOString(),
    };
  }
  const next = {
    ...state,
    words: { ...state.words, [wordId]: nextWord },
  };
  savePackProgress(next);

  if (word) {
    recordExerciseResult(loadPathProgress(), [word.skillId], grade === "know");
  }
  return next;
}

export function markPackWordSpoken(wordId: string): PackProgressState {
  const state = loadPackProgress();
  const prev = state.words[wordId] ?? defaultWord();
  const next = {
    ...state,
    words: {
      ...state.words,
      [wordId]: {
        ...prev,
        spokeAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  };
  savePackProgress(next);
  const word = getPackWord(wordId);
  if (word) {
    // Exposure only — never invent a pronunciation score.
    recordExerciseResult(loadPathProgress(), [word.skillId], true);
  }
  return next;
}

export function completePackLesson(lessonId: string): PackProgressState {
  const state = loadPackProgress();
  if (state.completedLessonIds.includes(lessonId)) return state;
  const lesson = getPackLesson(lessonId);
  if (!lesson) return state;
  const next = {
    ...state,
    completedLessonIds: [...state.completedLessonIds, lessonId],
  };
  savePackProgress(next);
  return next;
}

export function isPackLessonComplete(
  lessonId: string,
  state = loadPackProgress(),
): boolean {
  return state.completedLessonIds.includes(lessonId);
}

/** Sequential unlock within the pack hub. */
export function isPackLessonUnlocked(
  lessonId: string,
  state = loadPackProgress(),
): boolean {
  const lessons = listPackLessons();
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return false;
  if (idx === 0) return true;
  const prev = lessons[idx - 1]!;
  return state.completedLessonIds.includes(prev.id);
}

export function duePackWordIds(state = loadPackProgress(), today = todayKey()): string[] {
  return Object.entries(state.words)
    .filter(([, p]) => p.due && p.due <= today)
    .sort((a, b) => (a[1].due ?? "").localeCompare(b[1].due ?? ""))
    .map(([id]) => id);
}

export function packMasteryStats(state = loadPackProgress()) {
  const lessons = listPackLessons();
  const completed = state.completedLessonIds.filter((id) =>
    lessons.some((l) => l.id === id),
  ).length;
  const touched = Object.keys(state.words).length;
  const due = duePackWordIds(state).length;
  return {
    lessonsCompleted: completed,
    lessonsTotal: lessons.length,
    wordsTouched: touched,
    wordsTotal: 100,
    dueCount: due,
  };
}
