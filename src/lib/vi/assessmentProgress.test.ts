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

describe("Vietnamese speech-check progress", () => {
  it("tracks match attempts without inventing scores", () => {
    install();
    recordPronunciationAttempt({
      itemId: "w0-l01-E",
      expectedText: "ba",
      overallScore: null,
      accuracyScore: null,
      match: false,
      recognizedText: "bà",
      status: "mismatch",
    });
    recordPronunciationAttempt({
      itemId: "w0-l01-E",
      expectedText: "ba",
      overallScore: null,
      accuracyScore: null,
      match: true,
      recognizedText: "ba",
      status: "match",
    });
    recordPronunciationAttempt({
      itemId: "w0-l01-E",
      expectedText: "ba",
      overallScore: null,
      accuracyScore: null,
      match: null,
      status: "unavailable",
    });

    const summary = summarizeItem("w0-l01-E");
    expect(summary.attemptCount).toBe(3);
    expect(summary.matchCount).toBe(1);
    expect(summary.bestOverall).toBeNull();
    expect(summary.latest?.status).toBe("unavailable");
    expect(summary.latest?.overallScore).toBeNull();

    const store = loadAssessmentStore();
    expect(store.attempts.every((a) => a.toneScore === null)).toBe(true);
    expect(store.attempts.every((a) => a.overallScore === null)).toBe(true);
  });
});
