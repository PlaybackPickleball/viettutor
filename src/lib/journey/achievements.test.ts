import { describe, expect, it } from "vitest";
import { defaultProgress } from "@/lib/progress";
import type { PathProgressState } from "@/lib/phonics/learningPath";
import {
  achievementCounts,
  journeyUnitAnalytics,
  listJourneyAchievements,
} from "./achievements";
import { defaultJourneyProgress } from "./progress";

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

describe("journey achievements + analytics", () => {
  it("lists achievements without inventing earned state for a fresh learner", () => {
    const items = listJourneyAchievements(
      defaultJourneyProgress(),
      defaultProgress(),
      emptyPath(),
    );
    expect(items.length).toBeGreaterThanOrEqual(6);
    expect(items.every((a) => typeof a.earned === "boolean")).toBe(true);
    expect(items.filter((a) => a.earned).length).toBe(0);
  });

  it("counts analytics from live catalog without empty lesson inflation", () => {
    const stats = journeyUnitAnalytics(
      defaultJourneyProgress(),
      defaultProgress(),
      emptyPath(),
    );
    expect(stats.liveLessonsTotal).toBeGreaterThan(0);
    expect(stats.liveLessonsComplete).toBe(0);
    expect(stats.unitsComplete).toBe(0);
    expect(stats.karaokeHooksTotal).toBeGreaterThanOrEqual(2);
    expect(stats.note.toLowerCase()).toContain("not accuracy");
  });

  it("marks foundations badge when path store has badge-w0", () => {
    const path = emptyPath();
    path.badges = ["badge-w0"];
    const items = listJourneyAchievements(
      defaultJourneyProgress(),
      defaultProgress(),
      path,
    );
    expect(items.find((a) => a.id === "foundations-badge")?.earned).toBe(true);
    const counts = achievementCounts(defaultJourneyProgress(), defaultProgress(), path);
    expect(counts.earned).toBeGreaterThanOrEqual(1);
  });
});
