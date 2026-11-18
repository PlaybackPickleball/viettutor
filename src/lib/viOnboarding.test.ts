import { describe, expect, it } from "vitest";
import { canLeaveViGoals, toggleViGoal } from "./viOnboarding";

describe("vi onboarding goals", () => {
  it("requires at least one goal", () => {
    expect(canLeaveViGoals([])).toBe(false);
    expect(canLeaveViGoals(["alphabet"])).toBe(true);
  });

  it("toggles goals", () => {
    expect(toggleViGoal(["alphabet"], "songs")).toEqual(["alphabet", "songs"]);
    expect(toggleViGoal(["alphabet", "songs"], "alphabet")).toEqual(["songs"]);
  });
});
