import { describe, expect, it } from "vitest";
import { resolveSequence, sequenceLabel } from "@/lib/phonics";

/**
 * Learn-the-Lyrics relies on authored phonics for Breakdown — never invent lyrics.
 * Progress helpers are localStorage-bound; engine coverage is the critical unit test.
 */
describe("learn lyrics breakdown reuse", () => {
  it("uses verified bá sequence for word breakdown", () => {
    const steps = resolveSequence("bá");
    expect(steps).not.toBeNull();
    expect(sequenceLabel(steps!)).toBe("bờ – a – ba – sắc – bá");
  });

  it("does not invent closed-syllable breakdowns", () => {
    expect(resolveSequence("chồng")).toBeNull();
  });
});
