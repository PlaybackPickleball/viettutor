import { describe, expect, it } from "vitest";
import {
  buildLastNDayActivity,
  countPracticedDays,
  dayKeysFromIsoList,
} from "./practiceActivity";

describe("practiceActivity", () => {
  it("normalizes day keys from ISO timestamps", () => {
    expect(dayKeysFromIsoList(["2026-11-18T12:00:00.000Z", "2026-11-17"])).toEqual([
      "2026-11-18",
      "2026-11-17",
    ]);
  });

  it("builds a 7-day strip ending today with honest practiced flags", () => {
    const now = new Date("2026-11-18T15:00:00.000Z");
    const strip = buildLastNDayActivity(
      [["2026-11-18", "2026-11-16", "2026-11-10"], ["2026-11-17T09:00:00.000Z"]],
      7,
      now,
    );
    expect(strip).toHaveLength(7);
    expect(strip[0]?.date).toBe("2026-11-12");
    expect(strip[6]?.date).toBe("2026-11-18");
    expect(strip.find((d) => d.date === "2026-11-18")?.practiced).toBe(true);
    expect(strip.find((d) => d.date === "2026-11-17")?.practiced).toBe(true);
    expect(strip.find((d) => d.date === "2026-11-16")?.practiced).toBe(true);
    expect(strip.find((d) => d.date === "2026-11-15")?.practiced).toBe(false);
    expect(strip.find((d) => d.date === "2026-11-10")).toBeUndefined();
    expect(countPracticedDays(strip)).toBe(3);
  });
});
