import { describe, expect, it } from "vitest";
import { getPathLesson, getPlayableLessons, lessonHasFullLoop } from "./index";

describe("Hear → Write → Say → Review loop", () => {
  it("gives every playable lesson Hear, Write, Say, and Review", () => {
    for (const lesson of getPlayableLessons()) {
      expect(lessonHasFullLoop(lesson), lesson.id).toBe(true);
      expect(lesson.exercises.length, lesson.id).toBeLessThanOrEqual(8);
    }
  });

  it("orders Foundations Sound a as Hear → Write → Say → Review", () => {
    const lesson = getPathLesson("w0-l01");
    expect(lesson).toBeTruthy();
    const types = lesson!.exercises.map((e) => e.type);
    expect(types[0]).toBe("hear-sound");
    expect(types).toContain("write-trace");
    expect(types).toContain("speak-compare");
    expect(types.indexOf("write-trace")).toBeLessThan(types.indexOf("speak-compare"));
    expect(lesson!.exercises.some((e) => e.stepRole === "review" || e.type === "review-challenge")).toBe(
      true,
    );
  });
});
