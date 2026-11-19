import { describe, expect, it } from "vitest";
import { getPhonicsLesson, PHONICS_LESSONS, MA_TONE_FAMILY } from "./lessons";

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

  it("glosses bá as paternal aunt (regional), never uncle", () => {
    const baSac = getPhonicsLesson("ba-sac");
    expect(baSac?.meaningEn?.toLowerCase()).toContain("paternal aunt");
    expect(baSac?.meaningEn?.toLowerCase()).not.toContain("uncle");
    expect(baSac?.meaningEn?.toLowerCase()).not.toContain("embrace");
    for (const step of baSac?.steps ?? []) {
      if (step.display === "bá") {
        expect(step.glossEn?.toLowerCase()).toContain("paternal aunt");
        expect(step.glossEn?.toLowerCase()).not.toContain("uncle");
      }
    }
    const baFamily = getPhonicsLesson("ba-six-tones")?.toneFamily?.find((c) => c.written === "bá");
    expect(baFamily?.meaningEn?.toLowerCase()).toContain("paternal aunt");
    expect(baFamily?.meaningEn?.toLowerCase()).not.toContain("uncle");
    const read = getPhonicsLesson("read-familiar")?.readWords?.find((w) => w.vi === "bá");
    expect(read?.en.toLowerCase()).toContain("paternal aunt");
    expect(read?.en.toLowerCase()).not.toContain("uncle");
  });

  it("never uses uncle for any authored gloss", () => {
    const blob = JSON.stringify(PHONICS_LESSONS).toLowerCase();
    expect(blob).not.toContain("uncle");
    expect(blob).not.toContain("embrace");
  });
});
