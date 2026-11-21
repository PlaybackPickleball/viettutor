/**
 * Journey unlock + Continue Learning facade.
 * Reads existing alphabet + Đánh Vần path stores — no invented scores.
 * Persists optional overrides in ami-lingua.journey.v1.
 */

import { loadHearWriteProgress } from "@/lib/hearWrite/progress";
import { buildProgressSummary } from "@/lib/learningSummary";
import {
  isPathLessonComplete,
  loadPathProgress,
  type PathProgressState,
} from "@/lib/phonics/learningPath";
import {
  isLetterComplete,
  loadProgress,
  practiceStreak,
  type ProgressState,
} from "@/lib/progress";
import { JOURNEY_UNITS, getJourneyUnit } from "./catalog";
import type {
  ContinueLearningTarget,
  JourneyLesson,
  JourneyLessonStatus,
  JourneyUnit,
} from "./types";

const STORAGE_KEY = "ami-lingua.journey.v1";

export type JourneyProgressState = {
  version: 1;
  /** Explicit completions for visit-gated or hub lessons. */
  completedIds: string[];
  updatedAt: string;
};

export function defaultJourneyProgress(): JourneyProgressState {
  return { version: 1, completedIds: [], updatedAt: new Date().toISOString() };
}

export function loadJourneyProgress(): JourneyProgressState {
  if (typeof window === "undefined") return defaultJourneyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultJourneyProgress();
    const parsed = JSON.parse(raw) as Partial<JourneyProgressState>;
    return {
      version: 1,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return defaultJourneyProgress();
  }
}

export function saveJourneyProgress(state: JourneyProgressState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function markJourneyLessonComplete(lessonId: string): JourneyProgressState {
  const state = loadJourneyProgress();
  if (state.completedIds.includes(lessonId)) return state;
  const next = { ...state, completedIds: [...state.completedIds, lessonId] };
  saveJourneyProgress(next);
  return next;
}

function letterSatisfied(lesson: JourneyLesson, alphabet: ProgressState): boolean {
  if (!lesson.letterId) return false;
  const p = alphabet.letters[lesson.letterId];
  if (!p) return false;
  const gate = lesson.letterGate ?? "letter";
  if (gate === "heard") return Boolean(p.heard);
  if (gate === "said") return Boolean(p.sayMastered || (p.attempts ?? 0) > 0);
  return isLetterComplete(p);
}

export function isJourneyLessonComplete(
  lesson: JourneyLesson,
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
): boolean {
  if (journey.completedIds.includes(lesson.id)) return true;
  // Engine lessons only complete via markJourneyLessonComplete (no soft studio stubs).
  if (lesson.engine) return false;
  if (lesson.pathLessonId && isPathLessonComplete(path, lesson.pathLessonId)) return true;
  if (lesson.letterId && letterSatisfied(lesson, alphabet)) return true;
  if (lesson.hearWriteTouched) {
    const hw = loadHearWriteProgress();
    if (Object.keys(hw.items).length > 0) return true;
  }
  // Hub lesson: visiting Đánh Vần map counts once any Foundations lesson is done
  if (lesson.id === "u3-more" && Object.values(path.lessons).some((r) => r?.completed)) {
    return true;
  }
  if (lesson.id === "u7-karaoke") {
    return journey.completedIds.includes("u7-karaoke");
  }
  return false;
}

function liveLessonsInUnit(unit: JourneyUnit): JourneyLesson[] {
  return unit.lessons.filter((l) => l.kind === "live").sort((a, b) => a.order - b.order);
}

/**
 * Unit unlocks when the nearest prior unit that has live lessons is fully complete.
 * Shell-only units never block the next unit.
 */
export function isJourneyUnitUnlocked(
  unitId: string,
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
): boolean {
  const unit = getJourneyUnit(unitId);
  if (!unit) return false;
  if (unit.order <= 1) return true;

  const priorsWithLive = JOURNEY_UNITS.filter(
    (u) => u.order < unit.order && liveLessonsInUnit(u).length > 0,
  );
  if (priorsWithLive.length === 0) return true;
  const nearest = priorsWithLive[priorsWithLive.length - 1]!;
  return liveLessonsInUnit(nearest).every((l) =>
    isJourneyLessonComplete(l, journey, alphabet, path),
  );
}

/**
 * First live lesson in an unlocked unit is open; each next live unlocks after prior live completes.
 * Completed lessons stay reviewable. Shells are coming_soon.
 */
export function journeyLessonStatus(
  lesson: JourneyLesson,
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
): JourneyLessonStatus {
  if (lesson.kind === "shell") return "coming_soon";
  if (!isJourneyUnitUnlocked(lesson.unitId, journey, alphabet, path)) return "locked";
  if (isJourneyLessonComplete(lesson, journey, alphabet, path)) return "completed";

  const unit = getJourneyUnit(lesson.unitId);
  if (!unit) return "locked";
  const live = liveLessonsInUnit(unit);
  const idx = live.findIndex((l) => l.id === lesson.id);
  if (idx <= 0) return "available";
  const prev = live[idx - 1]!;
  return isJourneyLessonComplete(prev, journey, alphabet, path) ? "available" : "locked";
}

export function unitLiveProgress(
  unitId: string,
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
) {
  const unit = getJourneyUnit(unitId);
  if (!unit) return { completed: 0, total: 0, pct: 0 };
  const live = liveLessonsInUnit(unit);
  const completed = live.filter((l) => isJourneyLessonComplete(l, journey, alphabet, path)).length;
  const total = live.length;
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function resolveContinueLearning(
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
): ContinueLearningTarget {
  for (const unit of JOURNEY_UNITS) {
    if (!isJourneyUnitUnlocked(unit.id, journey, alphabet, path)) continue;
    for (const lesson of liveLessonsInUnit(unit)) {
      const status = journeyLessonStatus(lesson, journey, alphabet, path);
      if (status === "available" && lesson.href) {
        const prog = unitLiveProgress(unit.id, journey, alphabet, path);
        return {
          href: lesson.href,
          unitId: unit.id,
          unitTitle: unit.titleEn,
          lessonId: lesson.id,
          lessonTitle: lesson.titleEn,
          durationMin: lesson.durationMin,
          progressLabel: `${prog.completed}/${prog.total} live in unit`,
          progressPct: prog.pct,
        };
      }
    }
  }

  const first = JOURNEY_UNITS[0]!;
  const firstLesson = liveLessonsInUnit(first)[0]!;
  return {
    href: firstLesson.href || "/learn",
    unitId: first.id,
    unitTitle: first.titleEn,
    lessonId: firstLesson.id,
    lessonTitle: firstLesson.titleEn,
    durationMin: firstLesson.durationMin,
    progressLabel: "Start Unit 1 · Discover",
    progressPct: 0,
  };
}

export function journeyHomeStats() {
  const summary = buildProgressSummary();
  const path = loadPathProgress();
  const alphabet = loadProgress();
  const streak = Math.max(summary.streakDays, path.streakDays, practiceStreak(alphabet));
  const today = new Date().toISOString().slice(0, 10);
  const reviewDue = Object.values(path.skills).filter(
    (s) => s.nextReviewAt && s.nextReviewAt <= today && s.level !== "mastered",
  ).length;
  return {
    streakDays: streak,
    xp: path.xp,
    minutesToday: summary.minutesToday,
    reviewDueHint: reviewDue,
  };
}

export function nextLessonPreview(
  continueTarget: ContinueLearningTarget,
): { title: string; href: string } | null {
  const unit = getJourneyUnit(continueTarget.unitId);
  if (!unit) return null;
  const live = liveLessonsInUnit(unit);
  const idx = live.findIndex((l) => l.id === continueTarget.lessonId);
  const next = live[idx + 1];
  if (next?.href) return { title: next.titleEn, href: next.href };
  const nextUnit = JOURNEY_UNITS.find((u) => u.order === unit.order + 1);
  const nextLive = nextUnit ? liveLessonsInUnit(nextUnit)[0] : undefined;
  if (nextLive?.href) return { title: `${nextUnit!.titleEn}: ${nextLive.titleEn}`, href: nextLive.href };
  return null;
}
