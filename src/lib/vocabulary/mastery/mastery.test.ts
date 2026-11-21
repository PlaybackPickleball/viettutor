import { describe, expect, it } from "vitest";
import { listPackLessons, packLessonWordIds } from "@/lib/vocabulary";
import {
  applyReviewResult,
  awardXp,
  buildLessonQuiz,
  completeDailyReviewSession,
  completeLessonWithQuiz,
  dailyReviewCompleteXpKey,
  defaultMasteryState,
  defaultWordRecord,
  dueMasteryWordIds,
  firstAttemptTypedXpKey,
  gradeTypedVi,
  introduceWords,
  markLessonCompleted,
  quizPassXpKey,
  scoreQuiz,
  SRS_INTERVALS_DAYS,
  todayUtc,
  XP,
} from "./index";

describe("gradeTypedVi (NFC + diacritics)", () => {
  it("accepts exact NFC match ignoring case/trim", () => {
    expect(gradeTypedVi("  Nước ", "nước").ok).toBe(true);
  });

  it("flags wrong diacritics with soft hint (nuoc vs nước)", () => {
    const g = gradeTypedVi("nuoc", "nước");
    expect(g.ok).toBe(false);
    if (!g.ok) {
      expect(g.reason).toBe("wrong_diacritics");
      expect(g.hint.toLowerCase()).toMatch(/tone|mark/);
    }
  });

  it("rejects wrong base letters", () => {
    const g = gradeTypedVi("trường", "nước");
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.reason).toBe("wrong_base");
  });
});

describe("SRS intervals", () => {
  it("advances 1 → 3 → 7 → 14 → 30 on success", () => {
    let rec = defaultWordRecord("v001");
    const now = new Date("2026-11-21T12:00:00Z");
    for (const days of SRS_INTERVALS_DAYS) {
      rec = applyReviewResult(rec, true, "recognition", now);
      expect(rec.reviewIntervalDays).toBe(days);
      expect(rec.nextReviewAt).toBeTruthy();
    }
    expect(rec.masteryStatus).toBe("Mastered");
  });

  it("shortens interval on miss and does not auto-master from introduce alone", () => {
    let rec = defaultWordRecord("v002");
    rec = markLessonCompleted(rec, new Date("2026-11-21T12:00:00Z"));
    expect(rec.masteryStatus).not.toBe("Mastered");
    expect(rec.reviewIntervalDays).toBe(1); // seeded on lesson complete
    rec = applyReviewResult(rec, true, "typing", new Date("2026-11-22T12:00:00Z"));
    expect(rec.reviewIntervalDays).toBe(3);
    rec = applyReviewResult(rec, true, "typing", new Date("2026-11-25T12:00:00Z"));
    expect(rec.reviewIntervalDays).toBe(7);
    rec = applyReviewResult(rec, false, "typing", new Date("2026-12-02T12:00:00Z"));
    expect(rec.reviewIntervalDays).toBe(3); // halved from 7
    expect(rec.consecutiveSuccesses).toBe(0);
  });
});

describe("Daily Review eligibility", () => {
  it("never includes unlearned / incomplete-lesson words", () => {
    const lesson = listPackLessons()[0]!;
    const wordIds = packLessonWordIds(lesson);
    let state = defaultMasteryState();
    state = introduceWords(state, wordIds, new Date("2026-11-01T00:00:00Z"));
    expect(dueMasteryWordIds(state, "2026-11-21")).toEqual([]);

    const answers = wordIds.slice(0, 8).map((id, i) => ({
      questionId: `q${i}`,
      vocabularyId: id,
      correct: true,
      kind: "image" as const,
    }));
    while (answers.length < 8) {
      answers.push({
        questionId: `q${answers.length}`,
        vocabularyId: wordIds[0]!,
        correct: true,
        kind: "image" as const,
      });
    }
    const result = scoreQuiz(lesson.id, answers);
    expect(result.passed).toBe(true);
    state = completeLessonWithQuiz(state, result, new Date("2026-11-01T00:00:00Z"));

    expect(dueMasteryWordIds(state, "2026-11-01")).toEqual([]);
    const due = dueMasteryWordIds(state, "2026-11-02");
    expect(due.length).toBeGreaterThan(0);
    for (const id of due) {
      expect(wordIds).toContain(id);
    }
  });

  it("failed review reappears sooner", () => {
    let rec = defaultWordRecord("v010");
    rec = markLessonCompleted(rec, new Date("2026-11-01T00:00:00Z"));
    // seeded 1 → success 3 → success 7
    rec = applyReviewResult(rec, true, "listening", new Date("2026-11-02T00:00:00Z"));
    rec = applyReviewResult(rec, true, "listening", new Date("2026-11-05T00:00:00Z"));
    expect(rec.reviewIntervalDays).toBe(7);
    rec = applyReviewResult(rec, false, "listening", new Date("2026-11-12T00:00:00Z"));
    expect(rec.reviewIntervalDays).toBe(3);
    expect(rec.nextReviewAt).toBe("2026-11-15");
  });
});

describe("Quiz builder + score", () => {
  it("builds ~8 questions with typing mix for a real lesson", () => {
    const lesson = listPackLessons()[0]!;
    const qs = buildLessonQuiz(lesson.id);
    expect(qs.length).toBeGreaterThanOrEqual(Math.min(8, packLessonWordIds(lesson).length));
    expect(qs.some((q) => q.kind === "typing")).toBe(true);
    expect(qs.some((q) => q.kind === "image")).toBe(true);
    expect(qs.some((q) => q.kind === "listening")).toBe(true);
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
  });

  it("requires 80% to pass", () => {
    const answers = Array.from({ length: 8 }, (_, i) => ({
      questionId: `q${i}`,
      vocabularyId: "v001",
      correct: i < 6,
      kind: "image" as const,
    }));
    expect(scoreQuiz("u4-l01", answers).passed).toBe(false);
    expect(scoreQuiz("u4-l01", answers.map((a, i) => ({ ...a, correct: i < 7 }))).passed).toBe(true);
  });
});

describe("XP no farming", () => {
  it("awards lesson+quiz once and ignores duplicate keys", () => {
    const lesson = listPackLessons()[0]!;
    const wordIds = packLessonWordIds(lesson);
    let state = defaultMasteryState();
    const kinds = ["typing", "listening", "image"] as const;
    const answers = Array.from({ length: 8 }, (_, i) => ({
      questionId: `q${i}`,
      vocabularyId: wordIds[i % wordIds.length]!,
      correct: true,
      kind: kinds[i % 3]!,
    }));
    const result = scoreQuiz(lesson.id, answers);
    state = completeLessonWithQuiz(state, result, new Date("2026-11-21T00:00:00Z"));
    const xp1 = state.totalXp;
    expect(xp1).toBeGreaterThanOrEqual(XP.lessonComplete + XP.quizPass);
    state = completeLessonWithQuiz(state, result, new Date("2026-11-21T00:00:00Z"));
    expect(state.totalXp).toBe(xp1);
    expect(state.xpLedger.filter((e) => e.eventKey === quizPassXpKey(lesson.id))).toHaveLength(1);
  });

  it("Daily Review complete XP once per day", () => {
    let state = defaultMasteryState();
    const day = todayUtc(new Date("2026-11-21T15:00:00Z"));
    state = completeDailyReviewSession(state, new Date("2026-11-21T15:00:00Z"));
    expect(state.totalXp).toBe(XP.dailyReviewComplete);
    state = completeDailyReviewSession(state, new Date("2026-11-21T18:00:00Z"));
    expect(state.totalXp).toBe(XP.dailyReviewComplete);
    expect(state.xpLedger.some((e) => e.eventKey === dailyReviewCompleteXpKey(day))).toBe(true);
  });

  it("first-attempt typed XP is idempotent", () => {
    let state = defaultMasteryState();
    const r1 = awardXp(state, firstAttemptTypedXpKey("v001"), XP.firstAttemptTyped, "t");
    const r2 = awardXp(r1.state, firstAttemptTypedXpKey("v001"), XP.firstAttemptTyped, "t");
    expect(r1.awarded).toBe(5);
    expect(r2.awarded).toBe(0);
  });
});
