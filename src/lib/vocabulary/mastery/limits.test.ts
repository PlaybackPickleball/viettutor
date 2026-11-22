import { describe, expect, it } from "vitest";
import {
  assertMasteryStateLimits,
  MAX_MASTERY_LEDGER,
  MAX_MASTERY_LESSONS,
  MAX_MASTERY_WORDS,
} from "./limits";
import type { MasteryState, WordMasteryRecord } from "./types";

function emptyWord(id: string): WordMasteryRecord {
  return {
    vocabularyId: id,
    introducedAt: null,
    lessonCompletedAt: null,
    attempts: 0,
    correctFirstAttempts: 0,
    typingAttempts: 0,
    typingCorrect: 0,
    listeningAttempts: 0,
    listeningCorrect: 0,
    recognitionAttempts: 0,
    recognitionCorrect: 0,
    pronunciationAttempts: 0,
    pronunciationCorrect: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    reviewIntervalDays: 0,
    consecutiveSuccesses: 0,
    masteryStatus: "New",
  };
}

function baseState(partial?: Partial<MasteryState>): MasteryState {
  return {
    version: 1,
    words: { a: emptyWord("a") },
    completedLessonIds: [],
    xpLedger: [],
    totalXp: 0,
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

describe("mastery state limits", () => {
  it("accepts a normal pack-sized payload", () => {
    expect(assertMasteryStateLimits(baseState())).toEqual({ ok: true });
  });

  it("rejects oversized word maps", () => {
    const words: Record<string, WordMasteryRecord> = {};
    for (let i = 0; i < MAX_MASTERY_WORDS + 1; i++) words[`w${i}`] = emptyWord(`w${i}`);
    const result = assertMasteryStateLimits(baseState({ words }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("too_many_words");
  });

  it("rejects oversized lesson / ledger arrays", () => {
    const lessons = assertMasteryStateLimits(
      baseState({ completedLessonIds: Array.from({ length: MAX_MASTERY_LESSONS + 1 }, (_, i) => `l${i}`) }),
    );
    expect(lessons.ok).toBe(false);
    if (!lessons.ok) expect(lessons.error).toBe("too_many_lessons");

    const ledger = assertMasteryStateLimits(
      baseState({
        xpLedger: Array.from({ length: MAX_MASTERY_LEDGER + 1 }, (_, i) => ({
          eventKey: `e${i}`,
          amount: 1,
          reason: "t",
          createdAt: new Date().toISOString(),
        })),
      }),
    );
    expect(ledger.ok).toBe(false);
    if (!ledger.ok) expect(ledger.error).toBe("too_many_ledger");
  });
});

