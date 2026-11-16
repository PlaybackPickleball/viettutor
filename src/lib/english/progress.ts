import type { KeyValueStore } from "@/lib/experience/store";
import { browserStore } from "@/lib/experience/store";
import type { FeedbackCategory, EnglishFeedback } from "./feedback";
import { ENGLISH_LESSONS } from "./curriculum";
import type { DailyMinutes, GoalId, LevelId } from "./onboarding";
import { dailyReviewLimit } from "./onboarding";

export const ENGLISH_PROGRESS_KEY = "ami-lingua.vi-to-en.v1";

export type MicChoice = "unknown" | "granted" | "denied" | "listening_only";

export type AttemptRecord = {
  id: string;
  lessonId: string;
  phrase: string;
  at: string;
  source: EnglishFeedback["source"];
  category: FeedbackCategory | null;
  failed: boolean;
  phonemeScoringAvailable: boolean;
  observationVi: string;
  recognizedText: string | null;
};

export type ReviewItem = {
  id: string;
  en: string;
  vi: string;
  lessonId: string;
  due: string;
  intervalDays: number;
  lapses: number;
};

export type LessonTrack = {
  stageIndex: number;
  cleared: string[];
  completed: boolean;
};

export type EnglishProgress = {
  version: 1;
  onboardingCompleted: boolean;
  goals: GoalId[];
  level: LevelId | null;
  dailyMinutes: DailyMinutes | null;
  mic: MicChoice;
  lessons: Record<string, LessonTrack>;
  attempts: AttemptRecord[];
  review: ReviewItem[];
  attachedUserId?: string;
  updatedAt: string;
};

const ATTEMPT_CAP = 300;

export function emptyEnglishProgress(): EnglishProgress {
  return {
    version: 1,
    onboardingCompleted: false,
    goals: [],
    level: null,
    dailyMinutes: null,
    mic: "unknown",
    lessons: {},
    attempts: [],
    review: [],
    updatedAt: new Date().toISOString(),
  };
}

export function parseEnglishProgress(raw: string | null): EnglishProgress {
  const base = emptyEnglishProgress();
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<EnglishProgress>;
    if (parsed.version !== 1) return base;
    return {
      ...base,
      ...parsed,
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      lessons: parsed.lessons ?? {},
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      review: Array.isArray(parsed.review) ? parsed.review : [],
      mic: parsed.mic ?? "unknown",
      onboardingCompleted: Boolean(parsed.onboardingCompleted),
    };
  } catch {
    return base;
  }
}

export function loadEnglishProgress(store: KeyValueStore = browserStore()): EnglishProgress {
  return parseEnglishProgress(store.getItem(ENGLISH_PROGRESS_KEY));
}

export function saveEnglishProgress(
  progress: EnglishProgress,
  store: KeyValueStore = browserStore(),
): EnglishProgress {
  const next = { ...progress, version: 1 as const, updatedAt: new Date().toISOString() };
  store.setItem(ENGLISH_PROGRESS_KEY, JSON.stringify(next));
  return next;
}

export function greetingVi(hour: number): string {
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function completedCount(progress: EnglishProgress): number {
  return ENGLISH_LESSONS.filter((lesson) => progress.lessons[lesson.id]?.completed).length;
}

export function continueTarget(progress: EnglishProgress): { lessonId: string; stageIndex: number } {
  for (const lesson of ENGLISH_LESSONS) {
    const track = progress.lessons[lesson.id];
    if (!track?.completed) {
      return { lessonId: lesson.id, stageIndex: track?.stageIndex ?? 0 };
    }
  }
  const last = ENGLISH_LESSONS[ENGLISH_LESSONS.length - 1];
  return { lessonId: last.id, stageIndex: 0 };
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function scheduleReview(item: ReviewItem, category: FeedbackCategory, today: string): ReviewItem {
  if (category === "very_good") {
    const intervalDays = item.intervalDays <= 0 ? 2 : Math.min(14, item.intervalDays * 2);
    return { ...item, intervalDays, due: addDays(today, intervalDays) };
  }
  return {
    ...item,
    intervalDays: 1,
    due: addDays(today, 1),
    lapses: item.lapses + 1,
  };
}

export function upsertReview(
  progress: EnglishProgress,
  input: { en: string; vi: string; lessonId: string; category: FeedbackCategory },
  today: string,
): EnglishProgress {
  const id = `${input.lessonId}:${input.en}`.toLowerCase();
  const existing =
    progress.review.find((item) => item.id === id) ??
    ({
      id,
      en: input.en,
      vi: input.vi,
      lessonId: input.lessonId,
      due: today,
      intervalDays: 0,
      lapses: 0,
    } satisfies ReviewItem);
  const nextItem = scheduleReview(existing, input.category, today);
  const review = progress.review.filter((item) => item.id !== id).concat(nextItem);
  return { ...progress, review };
}

export function dueReviews(progress: EnglishProgress, today: string): ReviewItem[] {
  const limit = dailyReviewLimit(progress.dailyMinutes);
  return progress.review
    .filter((item) => item.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, limit);
}

export function recordAttempt(
  progress: EnglishProgress,
  attempt: Omit<AttemptRecord, "id" | "at"> & { at?: string },
): EnglishProgress {
  const next: AttemptRecord = {
    ...attempt,
    id: `a-${attempt.at ?? Date.now()}-${progress.attempts.length}`,
    at: attempt.at ?? new Date().toISOString(),
  };
  const attempts = [...progress.attempts, next].slice(-ATTEMPT_CAP);
  return { ...progress, attempts };
}

export function clearStage(
  progress: EnglishProgress,
  lessonId: string,
  stageId: string,
  stageIndex: number,
  stageCount: number,
): EnglishProgress {
  const prev = progress.lessons[lessonId] ?? { stageIndex: 0, cleared: [], completed: false };
  const cleared = prev.cleared.includes(stageId) ? prev.cleared : [...prev.cleared, stageId];
  const completed = cleared.length >= stageCount;
  const lessons = {
    ...progress.lessons,
    [lessonId]: {
      stageIndex: completed ? stageIndex : Math.min(stageCount - 1, stageIndex + 1),
      cleared,
      completed,
    },
  };
  return { ...progress, lessons };
}

export function summarizeAttempts(
  attempts: AttemptRecord[],
  phrases: string[],
): { phrase: string; label: string }[] {
  return phrases.map((phrase) => {
    const latest = [...attempts].reverse().find((item) => item.phrase === phrase);
    if (!latest || latest.failed || !latest.category) {
      return { phrase, label: "Chưa chấm được" };
    }
    if (latest.category === "needs_practice") return { phrase, label: "Cần luyện thêm" };
    if (latest.category === "fairly_good") return { phrase, label: "Khá tốt" };
    return { phrase, label: "Rất tốt" };
  });
}

/**
 * Keep guest lesson history and attach an account id later.
 * Does not clear lessons, attempts, review, or onboarding.
 */
export function attachGuestProgress(progress: EnglishProgress, userId: string): EnglishProgress {
  if (!userId.trim()) return progress;
  if (progress.attachedUserId && progress.attachedUserId !== userId) return progress;
  return { ...progress, attachedUserId: userId };
}
