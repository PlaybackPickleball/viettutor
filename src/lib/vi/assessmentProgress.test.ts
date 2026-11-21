import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loadAssessmentStore,
  recordPronunciationAttempt,
  summarizeItem,
} from "./assessmentProgress";

function install() {
  const mem = new Map<string, string>();
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Vietnamese pronunciation progress", () => {
  it("tracks latest, best, and improvement without inventing scores", () => {
    install();
    recordPronunciationAttempt({
      itemId: "w0-l01-E",
      expectedText: "a",
      overallScore: 60,
      accuracyScore: 58,
      status: "scored",
    });
    recordPronunciationAttempt({
      itemId: "w0-l01-E",
      expectedText: "a",
      overallScore: 78,
      accuracyScore: 75,
      status: "scored",
    });
    recordPronunciationAttempt({
      itemId: "w0-l01-E",
      expectedText: "a",
      overallScore: null,
      accuracyScore: null,
      status: "unavailable",
    });

    const summary = summarizeItem("w0-l01-E");
    expect(summary.attemptCount).toBe(3);
    expect(summary.bestOverall).toBe(78);
    expect(summary.latest?.status).toBe("unavailable");
    expect(summary.latest?.overallScore).toBeNull();
    expect(summary.improvement).toBeNull();

    const store = loadAssessmentStore();
    expect(store.attempts[1]?.bestPreviousOverall).toBe(60);
    expect(store.attempts.every((a) => a.toneScore === null)).toBe(true);
  });
});
