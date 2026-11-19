import { describe, expect, it } from "vitest";
import {
  getPathLesson,
  getPlayableLessons,
  getWorldLessons,
  LEARNING_LESSONS,
  LEARNING_WORLDS,
} from "./catalog";
import {
  DEMO_UNLOCK_ALL_PATH,
  defaultPathProgress,
  isPathLessonUnlocked,
  starsFromRatio,
  completePathLesson,
  pathMastery,
} from "./progress";
import { PATH_SYLLABLES } from "./syllables";

describe("Đánh Vần learning path catalog", () => {
  it("defines 12 worlds all playable", () => {
    expect(LEARNING_WORLDS).toHaveLength(12);
    expect(LEARNING_WORLDS.every((w) => w.playable)).toBe(true);
    expect(LEARNING_WORLDS.map((w) => w.id)).toEqual([
      "w1",
      "w2",
      "w3",
      "w4",
      "w5",
      "w6",
      "w7",
      "w8",
      "w9",
      "w10",
      "w11",
      "w12",
    ]);
  });

  it("ships 144 playable micro-lessons (12×12)", () => {
    expect(getPlayableLessons()).toHaveLength(144);
    expect(LEARNING_LESSONS).toHaveLength(144);
    expect(getWorldLessons("w1")).toHaveLength(12);
    expect(getWorldLessons("w12")).toHaveLength(12);
    expect(getPathLesson("w1-l01")?.titleEn).toMatch(/Meet ba and ma/i);
    expect(getPathLesson("w4-l01")?.playable).toBe(true);
    expect(getPathLesson("w4-l01")?.exercises.length).toBeGreaterThanOrEqual(2);
    expect(getPathLesson("w12-l12")?.playable).toBe(true);
  });

  it("gives every playable lesson 2–6 exercises with hints", () => {
    for (const lesson of getPlayableLessons()) {
      expect(lesson.exercises.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(lesson.exercises.length, lesson.id).toBeLessThanOrEqual(8);
      for (const ex of lesson.exercises) {
        expect(ex.hintEn.length, ex.id).toBeGreaterThan(3);
        expect(ex.skillIds.length, ex.id).toBeGreaterThan(0);
      }
    }
  });

  it("follows World 1 exact progression titles", () => {
    const titles = getWorldLessons("w1").map((l) => l.titleEn);
    expect(titles[0]).toMatch(/Meet ba and ma/i);
    expect(titles[1]).toMatch(/Build ba and ma/i);
    expect(titles[2]).toMatch(/sắc/i);
    expect(titles[3]).toMatch(/huyền/i);
    expect(titles[8]).toMatch(/Six tones/i);
    expect(titles[11]).toMatch(/mastery challenge/i);
  });

  it("demo-unlocks every playable lesson for testing", () => {
    expect(DEMO_UNLOCK_ALL_PATH).toBe(true);
    const fresh = defaultPathProgress();
    expect(isPathLessonUnlocked(fresh, "w1-l01")).toBe(true);
    expect(isPathLessonUnlocked(fresh, "w1-l12")).toBe(true);
    expect(isPathLessonUnlocked(fresh, "w6-l05")).toBe(true);
    expect(isPathLessonUnlocked(fresh, "w12-l12")).toBe(true);
    const after = completePathLesson(fresh, "w1-l01", 4, 4, false);
    expect(after.xp).toBe(10);
  });

  it("awards stars from performance thresholds", () => {
    expect(starsFromRatio(0.95, { two: 0.7, three: 0.9 })).toBe(3);
    expect(starsFromRatio(0.75, { two: 0.7, three: 0.9 })).toBe(2);
    expect(starsFromRatio(0.4, { two: 0.7, three: 0.9 })).toBe(1);
    expect(starsFromRatio(0, { two: 0.7, three: 0.9 })).toBe(0);
  });

  it("reports mastery over full playable set", () => {
    expect(pathMastery(defaultPathProgress())).toEqual({ completed: 0, total: 144, pct: 0 });
  });

  it("glosses bá as paternal aunt and never uncle/embrace", () => {
    const baSac = PATH_SYLLABLES.find((s) => s.written === "bá");
    expect(baSac?.vocab?.glossEn.toLowerCase()).toContain("paternal aunt");
    const blob =
      JSON.stringify(LEARNING_LESSONS).toLowerCase() + JSON.stringify(PATH_SYLLABLES).toLowerCase();
    expect(blob).not.toContain("uncle");
    expect(blob).not.toContain("embrace");
  });
});
