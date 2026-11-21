import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dueVocab,
  ensureVocabSaved,
  findVocabByExpression,
  gradeVocabItem,
  isSongVocab,
  type SavedVocabItem,
} from "./store";

function install(seed: SavedVocabItem[] = []) {
  const mem = new Map<string, string>([["ami-lingua.vocab.v1", JSON.stringify(seed)]]);
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
  return mem;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("vocab review", () => {
  it("detects song sources", () => {
    expect(isSongVocab({ sourceLessonId: "learn-lyrics:hat-mua" } as SavedVocabItem)).toBe(true);
    expect(isSongVocab({ sourceLessonId: "scan:1" } as SavedVocabItem)).toBe(false);
  });

  it("ensureVocabSaved creates once without farming practice on re-tap", () => {
    install();
    const first = ensureVocabSaved({
      expression: "bò",
      meaningEn: "cow",
      originalSentence: "con bò",
      sourceLessonId: "karaoke:demo",
    });
    expect(first.created).toBe(true);
    expect(findVocabByExpression("bò")?.practiceCount).toBe(0);
    const second = ensureVocabSaved({
      expression: "bò",
      meaningEn: "cow",
      originalSentence: "con bò",
      sourceLessonId: "karaoke:demo",
    });
    expect(second.created).toBe(false);
    expect(second.item.practiceCount).toBe(0);
  });

  it("schedules know vs again", () => {
    install([
      {
        id: "v1",
        expression: "mưa",
        meaningEn: "rain",
        originalSentence: "",
        sourceLessonId: "learn-lyrics:hat-mua",
        savedAt: "2026-11-18T00:00:00.000Z",
        practiceCount: 0,
        reviewStatus: "new",
      },
    ]);
    const afterKnow = gradeVocabItem("v1", "know", "2026-11-18");
    expect(afterKnow[0].intervalDays).toBe(2);
    expect(afterKnow[0].due).toBe("2026-11-20");
    expect(dueVocab(afterKnow, "2026-11-18")).toHaveLength(0);

    const afterAgain = gradeVocabItem("v1", "again", "2026-11-18");
    expect(afterAgain[0].due).toBe("2026-11-19");
    expect(dueVocab(afterAgain, "2026-11-19")).toHaveLength(1);
  });
});
