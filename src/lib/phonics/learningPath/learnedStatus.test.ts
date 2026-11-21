import { describe, expect, it } from "vitest";
import { defaultPathProgress, completePathLesson } from "./progress";
import { pathStatusForWritten, masteredSkillSummaries } from "./learnedStatus";
import { recordExerciseResult } from "./progress";

describe("path learned status", () => {
  it("marks bò as on-path after Foundations lesson 4 completes", () => {
    let state = defaultPathProgress();
    state = completePathLesson(state, "w0-l04", 4, 4, false);
    const status = pathStatusForWritten(state, "bò");
    expect(status.onPath).toBe(true);
    expect(status.level).not.toBe("unseen");
  });

  it("lists familiar/mastered skills for mastery chips", () => {
    let state = defaultPathProgress();
    for (let i = 0; i < 8; i++) {
      state = recordExerciseResult(state, ["letter-a"], true);
    }
    const chips = masteredSkillSummaries(state, 4);
    expect(chips.some((c) => c.id === "letter-a")).toBe(true);
  });
});
