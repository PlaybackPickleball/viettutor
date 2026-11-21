/**
 * Client mastery store — localStorage primary; syncs to /api/vocab/mastery when signed in.
 */
import { getPackLesson, packLessonWordIds } from "@/lib/vocabulary";
import { applyReviewResult, defaultWordRecord, isDue, markIntroduced, markLessonCompleted, todayUtc } from "./srs";
import {
  awardXp,
  dailyReviewCompleteXpKey,
  firstAttemptTypedXpKey,
  lessonCompleteXpKey,
  quizPassXpKey,
  XP,
} from "./xp";
import type {
  MasteryState,
  QuizQuestionKind,
  QuizResult,
  SkillKind,
  WordMasteryRecord,
} from "./types";

export const MASTERY_STORAGE_KEY = "ami-lingua.vocab-mastery.v1";

export function defaultMasteryState(): MasteryState {
  return {
    version: 1,
    words: {},
    completedLessonIds: [],
    xpLedger: [],
    totalXp: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

export function loadMasteryState(): MasteryState {
  if (typeof window === "undefined") return defaultMasteryState();
  try {
    const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return defaultMasteryState();
    const parsed = JSON.parse(raw) as Partial<MasteryState>;
    return {
      version: 1,
      words: parsed.words ?? {},
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      xpLedger: Array.isArray(parsed.xpLedger) ? parsed.xpLedger : [],
      totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return defaultMasteryState();
  }
}

export function saveMasteryState(state: MasteryState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(next));
  void syncMasteryToServer(next);
}

async function syncMasteryToServer(state: MasteryState): Promise<void> {
  try {
    await fetch("/api/vocab/mastery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
      credentials: "include",
    });
  } catch {
    // Offline / unsigned — localStorage remains source of truth for guests.
  }
}

export async function pullMasteryFromServer(): Promise<MasteryState | null> {
  try {
    const res = await fetch("/api/vocab/mastery", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as MasteryState | { error: string };
    if ("error" in data) return null;
    if (data.version !== 1) return null;
    const local = loadMasteryState();
    const merged = mergeStates(local, data);
    localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
}

function mergeStates(a: MasteryState, b: MasteryState): MasteryState {
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const older = newer === a ? b : a;
  const words: Record<string, WordMasteryRecord> = { ...older.words };
  for (const [id, rec] of Object.entries(newer.words)) {
    const prev = words[id];
    if (!prev || (rec.lastReviewedAt ?? "") >= (prev.lastReviewedAt ?? "")) {
      words[id] = rec;
    }
  }
  const ledgerKeys = new Set(newer.xpLedger.map((e) => e.eventKey));
  const xpLedger = [
    ...newer.xpLedger,
    ...older.xpLedger.filter((e) => !ledgerKeys.has(e.eventKey)),
  ];
  const totalXp = xpLedger.reduce((s, e) => s + e.amount, 0);
  const completedLessonIds = Array.from(
    new Set([...newer.completedLessonIds, ...older.completedLessonIds]),
  );
  return {
    version: 1,
    words,
    completedLessonIds,
    xpLedger,
    totalXp,
    updatedAt: newer.updatedAt >= older.updatedAt ? newer.updatedAt : older.updatedAt,
  };
}

export function getOrCreateWord(state: MasteryState, vocabularyId: string): WordMasteryRecord {
  return state.words[vocabularyId] ?? defaultWordRecord(vocabularyId);
}

export function introduceWords(state: MasteryState, vocabularyIds: string[], now = new Date()): MasteryState {
  const words = { ...state.words };
  for (const id of vocabularyIds) {
    words[id] = markIntroduced(getOrCreateWord(state, id), now);
  }
  return { ...state, words, updatedAt: now.toISOString() };
}

/**
 * Mark lesson complete only after quiz pass. Awards lesson + quiz XP once.
 * Schedules each word for first review. Awards first-attempt typed XP when applicable.
 */
export function completeLessonWithQuiz(
  state: MasteryState,
  result: QuizResult,
  now = new Date(),
): MasteryState {
  let next = { ...state, words: { ...state.words } };
  const lesson = getPackLesson(result.lessonId);
  if (!lesson) return state;

  for (const ans of result.answers) {
    const skill: SkillKind =
      ans.kind === "typing" ? "typing" : ans.kind === "listening" ? "listening" : "recognition";
    const cur = getOrCreateWord(next, ans.vocabularyId);
    const wasFirst = cur.attempts === 0;
    next.words[ans.vocabularyId] = applyReviewResult(cur, ans.correct, skill, now);
    if (ans.kind === "typing" && ans.correct && wasFirst) {
      next = awardXp(
        next,
        firstAttemptTypedXpKey(ans.vocabularyId),
        XP.firstAttemptTyped,
        `First typed ${ans.vocabularyId}`,
        now,
      ).state;
    }
  }

  if (result.passed) {
    if (!next.completedLessonIds.includes(result.lessonId)) {
      next.completedLessonIds = [...next.completedLessonIds, result.lessonId];
    }
    for (const id of packLessonWordIds(lesson)) {
      next.words[id] = markLessonCompleted(getOrCreateWord(next, id), now);
    }
    next = awardXp(
      next,
      lessonCompleteXpKey(result.lessonId),
      XP.lessonComplete,
      `Lesson ${result.lessonId}`,
      now,
    ).state;
    next = awardXp(
      next,
      quizPassXpKey(result.lessonId),
      XP.quizPass,
      `Quiz pass ${result.lessonId}`,
      now,
    ).state;
  }

  next.updatedAt = now.toISOString();
  return next;
}

export function recordDailyReviewItem(
  state: MasteryState,
  vocabularyId: string,
  correct: boolean,
  kind: QuizQuestionKind,
  now = new Date(),
): MasteryState {
  const skill: SkillKind =
    kind === "typing" ? "typing" : kind === "listening" ? "listening" : "recognition";
  const next: MasteryState = {
    ...state,
    words: {
      ...state.words,
      [vocabularyId]: applyReviewResult(getOrCreateWord(state, vocabularyId), correct, skill, now),
    },
    updatedAt: now.toISOString(),
  };
  return next;
}

/** Award +15 once when the learner finishes today's Daily Review queue. */
export function completeDailyReviewSession(state: MasteryState, now = new Date()): MasteryState {
  const day = todayUtc(now);
  return awardXp(
    state,
    dailyReviewCompleteXpKey(day),
    XP.dailyReviewComplete,
    `Daily Review complete ${day}`,
    now,
  ).state;
}

export function recordListenAndType(
  state: MasteryState,
  vocabularyId: string,
  correct: boolean,
  now = new Date(),
): MasteryState {
  const cur = getOrCreateWord(state, vocabularyId);
  const wasFirst = cur.attempts === 0;
  let next: MasteryState = {
    ...state,
    words: {
      ...state.words,
      [vocabularyId]: applyReviewResult(cur, correct, "typing", now),
    },
  };
  if (correct && wasFirst) {
    next = awardXp(
      next,
      firstAttemptTypedXpKey(vocabularyId),
      XP.firstAttemptTyped,
      `First typed ${vocabularyId}`,
      now,
    ).state;
  }
  next.updatedAt = now.toISOString();
  return next;
}

/** Due words from completed lessons only (plan: no farming unfinished vocab). */
export function dueMasteryWordIds(state: MasteryState = loadMasteryState(), today = todayUtc()): string[] {
  const eligible = new Set<string>();
  for (const lessonId of state.completedLessonIds) {
    const lesson = getPackLesson(lessonId);
    if (!lesson) continue;
    for (const id of packLessonWordIds(lesson)) eligible.add(id);
  }
  return Object.values(state.words)
    .filter((w) => eligible.has(w.vocabularyId) && isDue(w, today))
    .map((w) => w.vocabularyId);
}

export function masteryDueCount(state?: MasteryState): number {
  return dueMasteryWordIds(state ?? loadMasteryState()).length;
}

export function isMasteryLessonComplete(lessonId: string, state = loadMasteryState()): boolean {
  return state.completedLessonIds.includes(lessonId);
}
