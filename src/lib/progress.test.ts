import { describe, expect, it } from "vitest";
import {
  MAX_GAP_SECONDS,
  creditPracticeTime,
  defaultProgress,
} from "./progress";

describe("creditPracticeTime", () => {
  it("does not invent minutes on the first stamp of a day", () => {
    const base = defaultProgress();
    const t0 = Date.parse("2026-11-18T12:00:00.000Z");
    const next = creditPracticeTime(
      { ...base, minutesDate: "2026-11-18", practiceSecondsToday: 0, lastActiveAt: null },
      t0,
    );
    expect(next.practiceSecondsToday).toBe(0);
    expect(next.minutesToday).toBe(0);
    expect(next.practiceDates).toContain("2026-11-18");
    expect(next.lastActiveAt).toBe(new Date(t0).toISOString());
  });

  it("adds wall-clock seconds between stamps", () => {
    const t0 = Date.parse("2026-11-18T12:00:00.000Z");
    const t1 = t0 + 90_000;
    const started = creditPracticeTime(
      {
        ...defaultProgress(),
        minutesDate: "2026-11-18",
        practiceSecondsToday: 0,
        lastActiveAt: null,
      },
      t0,
    );
    const next = creditPracticeTime(started, t1);
    expect(next.practiceSecondsToday).toBe(90);
    expect(next.minutesToday).toBe(1);
  });

  it("caps long idle gaps", () => {
    const t0 = Date.parse("2026-11-18T12:00:00.000Z");
    const t1 = t0 + 600_000;
    const started = creditPracticeTime(
      {
        ...defaultProgress(),
        minutesDate: "2026-11-18",
        practiceSecondsToday: 0,
        lastActiveAt: null,
      },
      t0,
    );
    const next = creditPracticeTime(started, t1);
    expect(next.practiceSecondsToday).toBe(MAX_GAP_SECONDS);
    expect(next.minutesToday).toBe(Math.floor(MAX_GAP_SECONDS / 60));
  });
});
