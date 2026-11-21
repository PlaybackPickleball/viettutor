import { XP, type MasteryState, type XpLedgerEntry } from "./types";

/** Idempotent XP grant — same eventKey never awards twice (no farming). */
export function awardXp(
  state: MasteryState,
  eventKey: string,
  amount: number,
  reason: string,
  now = new Date(),
): { state: MasteryState; awarded: number } {
  if (state.xpLedger.some((e) => e.eventKey === eventKey)) {
    return { state, awarded: 0 };
  }
  const entry: XpLedgerEntry = {
    eventKey,
    amount,
    reason,
    createdAt: now.toISOString(),
  };
  return {
    state: {
      ...state,
      xpLedger: [...state.xpLedger, entry],
      totalXp: state.totalXp + amount,
      updatedAt: now.toISOString(),
    },
    awarded: amount,
  };
}

export function lessonCompleteXpKey(lessonId: string): string {
  return `lesson-complete:${lessonId}`;
}

export function quizPassXpKey(lessonId: string): string {
  return `quiz-pass:${lessonId}`;
}

/** +5 once per word for first-attempt typed correct. */
export function firstAttemptTypedXpKey(vocabularyId: string): string {
  return `first-typed:${vocabularyId}`;
}

/** +15 once per calendar day when Daily Review session completes. */
export function dailyReviewCompleteXpKey(day: string): string {
  return `daily-review-complete:${day}`;
}

export function listenTypeXpKey(vocabularyId: string, day: string): string {
  return `listen-type:${vocabularyId}:${day}`;
}

export { XP };
