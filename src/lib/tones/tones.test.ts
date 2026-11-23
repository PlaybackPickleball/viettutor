import { describe, expect, it } from "vitest";
import {
  buildMasteryQuiz,
  buildToneLessonQuiz,
  getToneCard,
  gradeToneChoice,
  southernListeningAccepts,
  TONE_CARDS,
  TONE_IDS,
  TONE_MASTERY_THRESHOLD,
} from "./index";

describe("Dấu Thanh catalog", () => {
  it("teaches all six tones on the ma family", () => {
    expect(TONE_IDS).toHaveLength(6);
    expect(TONE_CARDS.map((c) => c.written)).toEqual(["ma", "má", "mà", "mả", "mã", "mạ"]);
    expect(getToneCard("ngang")?.markChar).toBe("—");
    expect(getToneCard("nang")?.markChar).toBe(".");
    expect(TONE_MASTERY_THRESHOLD).toBe(0.8);
  });

  it("documents Southern hỏi/ngã listening merger", () => {
    expect(southernListeningAccepts("hoi")).toEqual(["hoi", "nga"]);
    expect(southernListeningAccepts("nga")).toEqual(["hoi", "nga"]);
    expect(southernListeningAccepts("sac")).toEqual(["sac"]);
  });

  it("accepts merged hỏi/ngã on Southern listening grade", () => {
    const q = buildToneLessonQuiz("hoi", "southern")[0]!;
    expect(q.kind).toBe("listen-choose");
    const merged = gradeToneChoice(q, "nga");
    expect(merged.ok).toBe(true);
    expect(merged.note).toMatch(/merge/i);
    const northern = buildToneLessonQuiz("hoi", "northern")[0]!;
    expect(gradeToneChoice(northern, "nga").ok).toBe(false);
  });

  it("builds lesson and mastery quizzes with 3–5 items", () => {
    const lesson = buildToneLessonQuiz("sac", "southern");
    expect(lesson.length).toBeGreaterThanOrEqual(3);
    expect(lesson.length).toBeLessThanOrEqual(5);
    const mastery = buildMasteryQuiz("southern");
    expect(mastery).toHaveLength(5);
  });
});
