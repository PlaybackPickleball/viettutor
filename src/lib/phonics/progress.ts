import { PHONICS_LESSONS } from "./lessons";
import type { PhonicsProgressState } from "./types";

const STORAGE_KEY = "ami-lingua.phonics.v1";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultPhonicsProgress(): PhonicsProgressState {
  return {
    dialect: "southern",
    completedLessonIds: [],
    attemptsByLesson: {},
    lastLessonId: null,
    practiceDates: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadPhonicsProgress(): PhonicsProgressState {
  if (typeof window === "undefined") return defaultPhonicsProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPhonicsProgress();
    const parsed = JSON.parse(raw) as Partial<PhonicsProgressState>;
    return {
      ...defaultPhonicsProgress(),
      ...parsed,
      dialect: "southern",
      completedLessonIds: parsed.completedLessonIds ?? [],
      attemptsByLesson: parsed.attemptsByLesson ?? {},
      practiceDates: parsed.practiceDates ?? [],
    };
  } catch {
    return defaultPhonicsProgress();
  }
}

export function savePhonicsProgress(state: PhonicsProgressState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function touch(state: PhonicsProgressState): PhonicsProgressState {
  const day = todayKey();
  const dates = state.practiceDates.includes(day)
    ? state.practiceDates
    : [...state.practiceDates, day].slice(-60);
  return { ...state, practiceDates: dates };
}

export function markLessonAttempted(state: PhonicsProgressState, lessonId: string): PhonicsProgressState {
  const attemptsByLesson = {
    ...state.attemptsByLesson,
    [lessonId]: (state.attemptsByLesson[lessonId] ?? 0) + 1,
  };
  const next = touch({
    ...state,
    attemptsByLesson,
    lastLessonId: lessonId,
  });
  savePhonicsProgress(next);
  return next;
}

export function markLessonComplete(state: PhonicsProgressState, lessonId: string): PhonicsProgressState {
  const completedLessonIds = state.completedLessonIds.includes(lessonId)
    ? state.completedLessonIds
    : [...state.completedLessonIds, lessonId];
  const next = touch({
    ...state,
    completedLessonIds,
    lastLessonId: lessonId,
    attemptsByLesson: {
      ...state.attemptsByLesson,
      [lessonId]: state.attemptsByLesson[lessonId] ?? 1,
    },
  });
  savePhonicsProgress(next);
  return next;
}

export function isLessonComplete(state: PhonicsProgressState, lessonId: string): boolean {
  return state.completedLessonIds.includes(lessonId);
}

/** Lesson N unlocks when lesson N-1 is complete (lesson 1 always open). */
export function isLessonUnlocked(state: PhonicsProgressState, lessonId: string): boolean {
  const lesson = PHONICS_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return false;
  if (lesson.order <= 1) return true;
  const prev = PHONICS_LESSONS.find((l) => l.order === lesson.order - 1);
  if (!prev) return true;
  return isLessonComplete(state, prev.id);
}

export function phonicsMastery(state: PhonicsProgressState) {
  const total = PHONICS_LESSONS.length;
  const completed = state.completedLessonIds.filter((id) =>
    PHONICS_LESSONS.some((l) => l.id === id),
  ).length;
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function continuePhonicsHref(state: PhonicsProgressState): string {
  for (const lesson of PHONICS_LESSONS) {
    if (!isLessonComplete(state, lesson.id) && isLessonUnlocked(state, lesson.id)) {
      return `/danh-van/lesson/${lesson.id}`;
    }
  }
  if (state.lastLessonId) return `/danh-van/lesson/${state.lastLessonId}`;
  return "/danh-van/lesson/ba-sac";
}
