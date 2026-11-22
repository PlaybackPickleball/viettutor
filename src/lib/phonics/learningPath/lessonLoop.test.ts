import { describe, expect, it } from "vitest";
import { getPathLesson, getPlayableLessons, lessonHasFullLoop } from "./index";

describe("Hear → Recognize → Say → Recall loop", () => {
  it("gives every playable lesson Hear, Recognize, Say, and Recall", () => {
    for (const lesson of getPlayableLessons()) {
      expect(lessonHasFullLoop(lesson), lesson.id).toBe(true);
      expect(lesson.exercises.length, lesson.id).toBeLessThanOrEqual(8);
      expect(
        lesson.exercises.every((e) => e.type !== "write-trace"),
        lesson.id,
      ).toBe(true);
    }
  });

  it("orders Foundations Sound a as Hear → Recognize → Say → Recall", () => {
    const lesson = getPathLesson("w0-l01");
    expect(lesson).toBeTruthy();
    const types = lesson!.exercises.map((e) => e.type);
    expect(types[0]).toBe("hear-sound");
    expect(types).not.toContain("write-trace");
    expect(types).toContain("speak-compare");
    expect(
      types.some((t) => t === "listen-choose" || t === "sound-match" || t === "review-challenge"),
    ).toBe(true);
    expect(types).toContain("listen-type");
    expect(types.indexOf("hear-sound")).toBeLessThan(types.indexOf("speak-compare"));
    expect(types.indexOf("speak-compare")).toBeLessThan(types.lastIndexOf("listen-type"));
  });
});
