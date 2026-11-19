import {
  getFirstPlayableLesson,
  getPathLesson,
  getPlayableLessons,
  getWorld,
  getWorldLessons,
  LEARNING_WORLDS,
} from "./catalog";
import type {
  LessonAttemptRecord,
  LessonMapStatus,
  PathProgressState,
  SkillMasteryLevel,
  SkillProgressRecord,
} from "./types";

const STORAGE_KEY = "ami-lingua.phonics-path.v1";

export const XP_PER_LESSON = 10;
export const XP_REVIEW_BONUS = 5;

export function defaultPathProgress(): PathProgressState {
  return {
    version: 1,
    dialect: "southern",
    xp: 0,
    streakDays: 0,
    lastPracticeDate: null,
    lessons: {},
    skills: {},
    badges: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadPathProgress(): PathProgressState {
  if (typeof window === "undefined") return defaultPathProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPathProgress();
    const parsed = JSON.parse(raw) as Partial<PathProgressState>;
    return {
      ...defaultPathProgress(),
      ...parsed,
      version: 1,
      dialect: "southern",
      lessons: parsed.lessons ?? {},
      skills: parsed.skills ?? {},
      badges: parsed.badges ?? [],
    };
  } catch {
    return defaultPathProgress();
  }
}

export function savePathProgress(state: PathProgressState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function touchStreak(state: PathProgressState): PathProgressState {
  const day = todayKey();
  if (state.lastPracticeDate === day) return state;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  const streakDays =
    state.lastPracticeDate === yKey ? state.streakDays + 1 : state.lastPracticeDate ? 1 : 1;
  return { ...state, lastPracticeDate: day, streakDays };
}

/** Stars from exercise performance ratio (not time). */
export function starsFromRatio(
  ratio: number,
  thresholds: { two: number; three: number },
): 0 | 1 | 2 | 3 {
  if (ratio >= thresholds.three) return 3;
  if (ratio >= thresholds.two) return 2;
  if (ratio > 0) return 1;
  return 0;
}

function defaultSkill(): SkillProgressRecord {
  return {
    exposures: 0,
    correct: 0,
    incorrect: 0,
    level: "new",
    nextReviewAt: null,
    lastSeenAt: null,
  };
}

/**
 * Spaced intervals (days) by level — adjusted mildly by recent accuracy.
 * Single lesson completion never jumps straight to mastered.
 */
function nextReviewDate(level: SkillMasteryLevel, accuracy: number): string {
  const base =
    level === "new" ? 1 : level === "learning" ? 3 : level === "familiar" ? 7 : 14;
  const adj = accuracy < 0.6 ? Math.max(1, base - 2) : accuracy > 0.85 ? base + 2 : base;
  const d = new Date();
  d.setDate(d.getDate() + adj);
  return d.toISOString().slice(0, 10);
}

function recomputeSkillLevel(rec: SkillProgressRecord): SkillMasteryLevel {
  const total = rec.correct + rec.incorrect;
  if (total < 4) return "new";
  const acc = rec.correct / Math.max(1, total);
  if (rec.exposures >= 12 && acc >= 0.85 && rec.correct >= 8) return "mastered";
  if (rec.exposures >= 6 && acc >= 0.7) return "familiar";
  if (rec.exposures >= 2) return "learning";
  return "new";
}

export function recordExerciseResult(
  state: PathProgressState,
  skillIds: string[],
  correct: boolean,
): PathProgressState {
  const skills = { ...state.skills };
  const now = new Date().toISOString();
  for (const id of skillIds) {
    const prev = skills[id] ?? defaultSkill();
    const next: SkillProgressRecord = {
      ...prev,
      exposures: prev.exposures + 1,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      lastSeenAt: now,
    };
    next.level = recomputeSkillLevel(next);
    const acc = next.correct / Math.max(1, next.correct + next.incorrect);
    next.nextReviewAt = nextReviewDate(next.level, acc);
    skills[id] = next;
  }
  const touched = touchStreak({ ...state, skills });
  savePathProgress(touched);
  return touched;
}

export function completePathLesson(
  state: PathProgressState,
  lessonId: string,
  correctCount: number,
  totalGraded: number,
  reviewBonusEarned: boolean,
): PathProgressState {
  const lesson = getPathLesson(lessonId);
  if (!lesson || !lesson.playable) return state;

  const ratio = totalGraded === 0 ? 1 : correctCount / totalGraded;
  const stars = starsFromRatio(ratio, lesson.starThresholds);
  const prev = state.lessons[lessonId];
  const alreadyXp = prev?.completed ? prev.xpEarned : 0;
  let xpGain = 0;
  if (!prev?.completed) {
    xpGain = XP_PER_LESSON + (reviewBonusEarned ? XP_REVIEW_BONUS : 0);
  } else if (stars > (prev.stars ?? 0)) {
    // Star improvement only — no double base XP
    xpGain = 0;
  }

  const record: LessonAttemptRecord = {
    completed: true,
    stars: Math.max(stars, prev?.stars ?? 0) as 0 | 1 | 2 | 3,
    bestCorrectRatio: Math.max(ratio, prev?.bestCorrectRatio ?? 0),
    attempts: (prev?.attempts ?? 0) + 1,
    xpEarned: alreadyXp + xpGain,
    completedAt: new Date().toISOString(),
  };

  let badges = [...state.badges];
  const world = getWorld(lesson.worldId);
  if (world) {
    const worldLessons = getWorldLessons(world.id).filter((l) => l.playable);
    const lessons = { ...state.lessons, [lessonId]: record };
    const allDone = worldLessons.every((l) => lessons[l.id]?.completed);
    if (allDone && !badges.includes(world.badgeId)) {
      badges = [...badges, world.badgeId];
    }
  }

  const next = touchStreak({
    ...state,
    xp: state.xp + xpGain,
    lessons: { ...state.lessons, [lessonId]: record },
    badges,
  });
  savePathProgress(next);
  return next;
}

export function isPathLessonComplete(state: PathProgressState, lessonId: string): boolean {
  return Boolean(state.lessons[lessonId]?.completed);
}

/**
 * Unlock: prior lesson in same world complete; world N unlocks when world N-1 badge earned
 * (all playable lessons complete). Lesson 1 of world 1 always open.
 */
export function isPathLessonUnlocked(state: PathProgressState, lessonId: string): boolean {
  const lesson = getPathLesson(lessonId);
  if (!lesson || !lesson.playable) return false;
  const world = getWorld(lesson.worldId);
  if (!world || !world.playable) return false;

  if (world.order > 1) {
    const prevWorld = LEARNING_WORLDS.find((w) => w.order === world.order - 1);
    if (!prevWorld?.playable) return false;
    const prevLessons = getWorldLessons(prevWorld.id).filter((l) => l.playable);
    if (!prevLessons.every((l) => isPathLessonComplete(state, l.id))) return false;
  }

  if (lesson.order <= 1) return true;
  const prev = getWorldLessons(lesson.worldId).find((l) => l.order === lesson.order - 1);
  if (!prev) return true;
  if (!prev.playable) return true;
  return isPathLessonComplete(state, prev.id);
}

export function lessonMapStatus(state: PathProgressState, lessonId: string): LessonMapStatus {
  const lesson = getPathLesson(lessonId);
  if (!lesson) return "locked";
  if (!lesson.playable) return "locked";
  if (!isPathLessonUnlocked(state, lessonId)) return "locked";
  const rec = state.lessons[lessonId];
  if (rec?.completed && rec.stars >= 3) return "mastered";
  if (rec?.completed) return "completed";
  return "available";
}

export function pathMastery(state: PathProgressState) {
  const playable = getPlayableLessons();
  const completed = playable.filter((l) => isPathLessonComplete(state, l.id)).length;
  const total = playable.length;
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function continuePathHref(state: PathProgressState): string {
  for (const lesson of getPlayableLessons()) {
    if (!isPathLessonComplete(state, lesson.id) && isPathLessonUnlocked(state, lesson.id)) {
      return `/danh-van/path/${lesson.id}`;
    }
  }
  const first = getFirstPlayableLesson();
  return `/danh-van/path/${first.id}`;
}

export function skillsDueForReview(state: PathProgressState, limit = 5): string[] {
  const today = todayKey();
  return Object.entries(state.skills)
    .filter(([, rec]) => rec.nextReviewAt && rec.nextReviewAt <= today && rec.level !== "mastered")
    .sort((a, b) => (a[1].nextReviewAt ?? "").localeCompare(b[1].nextReviewAt ?? ""))
    .slice(0, limit)
    .map(([id]) => id);
}

export const BADGE_LABELS: Record<string, string> = {
  "badge-w1": "World 1 — ba & ma",
  "badge-w2": "World 2 — Tone mastery",
  "badge-w3": "World 3 — New consonants",
};
