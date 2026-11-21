import { describe, expect, it } from "vitest";
import { assembleDailyJourney } from "./dailyJourney";

describe("assembleDailyJourney", () => {
  it("returns four phases totaling about 10 minutes", () => {
    const plan = assembleDailyJourney();
    expect(plan.blocks).toHaveLength(4);
    expect(plan.blocks.map((b) => b.phase)).toEqual(["warmup", "learn", "speak", "fun"]);
    expect(plan.totalMin).toBe(10);
    for (const block of plan.blocks) {
      expect(block.href.startsWith("/")).toBe(true);
      expect(block.titleEn.length).toBeGreaterThan(0);
    }
  });
});
