import { describe, expect, it } from "vitest";
import { defaultProgress } from "@/lib/progress";
import type { PathProgressState } from "@/lib/phonics/learningPath";
import { JOURNEY_UNITS } from "./catalog";
import {
  defaultJourneyProgress,
  isJourneyLessonComplete,
  isJourneyUnitUnlocked,
  journeyLessonStatus,
  resolveContinueLearning,
} from "./progress";

function emptyPath(): PathProgressState {
  return {
    version: 1,
    dialect: "southern",
    xp: 0,
    streakDays: 0,
    lastPracticeDate: null,
    lessons: {},
    skills: {},
    badges: [],
    updatedAt: new Date().toISOString(),
  };
}

describe("journey unlock", () => {
  it("keeps Unit 1 first live lesson available", () => {
    const first = JOURNEY_UNITS[0]!.lessons.find((l) => l.kind === "live")!;
    expect(
      journeyLessonStatus(first, defaultJourneyProgress(), defaultProgress(), emptyPath()),
    ).toBe("available");
  });

  it("locks later Unit 1 lessons until prior complete", () => {
    const second = JOURNEY_UNITS[0]!.lessons.find((l) => l.id === "u1-l02")!;
    expect(
      journeyLessonStatus(second, defaultJourneyProgress(), defaultProgress(), emptyPath()),
    ).toBe("locked");
  });

  it("unlocks next after engine lesson marked complete", () => {
    const journey = {
      ...defaultJourneyProgress(),
      completedIds: ["u1-l01"],
    };
    const second = JOURNEY_UNITS[0]!.lessons.find((l) => l.id === "u1-l02")!;
    expect(journeyLessonStatus(second, journey, defaultProgress(), emptyPath())).toBe("available");
  });

  it("locks Unit 3 until Unit 1 live lessons finish", () => {
    expect(
      isJourneyUnitUnlocked("u3", defaultJourneyProgress(), defaultProgress(), emptyPath()),
    ).toBe(false);
  });

  it("Continue Learning points at first available live lesson", () => {
    const target = resolveContinueLearning(defaultJourneyProgress(), defaultProgress(), emptyPath());
    expect(target.lessonId).toBe("u1-l01");
    expect(target.href).toBe("/learn/u1-l01");
  });

  it("marks path lesson complete from path store", () => {
    const lesson = JOURNEY_UNITS.find((u) => u.id === "u3")!.lessons.find((l) => l.id === "u3-l01")!;
    const path = emptyPath();
    path.lessons["w0-l01"] = {
      completed: true,
      stars: 1,
      bestCorrectRatio: 1,
      attempts: 1,
      xpEarned: 10,
      completedAt: new Date().toISOString(),
    };
    expect(isJourneyLessonComplete(lesson, defaultJourneyProgress(), defaultProgress(), path)).toBe(
      true,
    );
  });
});
