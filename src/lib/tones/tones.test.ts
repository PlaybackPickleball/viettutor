import { describe, expect, it } from "vitest";
import {
  buildMasteryQuiz,
  buildToneLessonQuiz,
  contourToSvgPath,
  estimateFramePitch,
  getToneCard,
  gradeToneChoice,
  normalizeToBaseline,
  southernListeningAccepts,
  TONE_CARDS,
  TONE_CHAPTERS,
  TONE_IDS,
  TONE_MASTERY_THRESHOLD,
  TONE_RECORDING_WISHLIST,
} from "./index";

describe("Dấu Thanh catalog", () => {
  it("teaches all six tones on the ma family", () => {
    expect(TONE_IDS).toHaveLength(6);
    expect(TONE_CARDS.map((c) => c.written)).toEqual(["ma", "má", "mà", "mả", "mã", "mạ"]);
    expect(getToneCard("ngang")?.markChar).toBe("—");
    expect(getToneCard("nang")?.markChar).toBe(".");
    expect(getToneCard("sac")?.teachEn.length).toBeGreaterThan(20);
    expect(TONE_MASTERY_THRESHOLD).toBe(0.8);
    expect(TONE_CHAPTERS).toHaveLength(6);
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

  it("builds lesson quizzes with match-graph and 12-item mastery", () => {
    const lesson = buildToneLessonQuiz("sac", "southern");
    expect(lesson.length).toBeGreaterThanOrEqual(5);
    expect(lesson.some((q) => q.kind === "match-graph")).toBe(true);
    const mastery = buildMasteryQuiz("southern");
    expect(mastery).toHaveLength(12);
  });

  it("lists native recording wishlist categories", () => {
    expect(TONE_RECORDING_WISHLIST.length).toBeGreaterThanOrEqual(6);
  });
});

describe("local pitch helpers", () => {
  it("returns null for silence frames", () => {
    const silence = new Float32Array(512);
    expect(estimateFramePitch(silence, 16000)).toBeNull();
  });

  it("maps normalized contour to an SVG path", () => {
    const path = contourToSvgPath([
      { t: 0, y: 0.5 },
      { t: 1, y: 0.2 },
    ]);
    expect(path.startsWith("M")).toBe(true);
    expect(path.includes("L")).toBe(true);
  });

  it("normalizes samples around baseline", () => {
    const pts = normalizeToBaseline(
      [
        { t: 0, hz: 200 },
        { t: 0.1, hz: 220 },
      ],
      200,
    );
    expect(pts[0]!.y).toBeCloseTo(0.5, 1);
    expect(pts[1]!.y).toBeLessThan(0.5);
  });
});
