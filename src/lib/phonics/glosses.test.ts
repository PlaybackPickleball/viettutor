import { describe, expect, it } from "vitest";
import { PHONICS_LESSONS, MA_TONE_FAMILY } from "./lessons";

describe("Đánh Vần authored EN glosses", () => {
  it("gives every build step a glossEn", () => {
    for (const lesson of PHONICS_LESSONS.filter((l) => l.kind === "build")) {
      expect(lesson.meaningEn, lesson.id).toBeTruthy();
      for (const step of lesson.steps ?? []) {
        expect(step.glossEn, `${lesson.id}:${step.display}`).toBeTruthy();
      }
    }
  });

  it("gives every tone-family card a meaningEn", () => {
    for (const lesson of PHONICS_LESSONS.filter(
      (l) => l.kind === "tone-family" || l.kind === "listen-tone",
    )) {
      for (const card of lesson.toneFamily ?? []) {
        expect(card.meaningEn, `${lesson.id}:${card.written}`).toBeTruthy();
      }
    }
    expect(MA_TONE_FAMILY.every((c) => Boolean(c.meaningEn))).toBe(true);
  });

  it("gives every read word an English gloss", () => {
    const read = PHONICS_LESSONS.find((l) => l.id === "read-familiar");
    expect(read?.readWords?.length).toBeGreaterThan(0);
    for (const w of read?.readWords ?? []) {
      expect(w.en.length).toBeGreaterThan(2);
    }
  });
});
