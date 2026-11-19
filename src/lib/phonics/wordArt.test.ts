import { describe, expect, it } from "vitest";
import { PATH_SYLLABLES } from "./learningPath/syllables";
import { getPhonicsLesson, MA_TONE_FAMILY } from "./lessons";
import { resolveWordArt, wordArtCoverage } from "./wordArt";

describe("Đánh Vần word art", () => {
  it("covers bá as paternal aunt vocab art (never uncle)", () => {
    const art = resolveWordArt("bá");
    expect(art?.kind).toBe("vocab");
    expect(art?.artId).toBe("aunt");
    expect(art?.alt.toLowerCase()).toContain("paternal aunt");
    expect(art?.alt.toLowerCase()).not.toContain("uncle");
  });

  it("uses training abstracts for sound-training syllables", () => {
    expect(resolveWordArt("mả")?.kind).toBe("training");
    expect(resolveWordArt("mã")?.kind).toBe("training");
    expect(resolveWordArt("mạ")?.kind).toBe("training");
    expect(resolveWordArt("ma")?.artId).toMatch(/^abstract-/);
  });

  it("maps conversational path syllables to vocab art", () => {
    const missing = PATH_SYLLABLES.filter(
      (s) => s.vocab?.conversational && !resolveWordArt(s.written),
    ).map((s) => s.written);
    expect(missing).toEqual([]);
  });

  it("maps classic read-familiar words", () => {
    const read = getPhonicsLesson("read-familiar")?.readWords ?? [];
    for (const w of read) {
      expect(resolveWordArt(w.vi), w.vi).toBeTruthy();
    }
  });

  it("maps ma and ba tone-family cards", () => {
    for (const card of MA_TONE_FAMILY) {
      expect(resolveWordArt(card.written), card.written).toBeTruthy();
    }
    const baFamily = getPhonicsLesson("ba-six-tones")?.toneFamily ?? [];
    for (const card of baFamily) {
      expect(resolveWordArt(card.written), card.written).toBeTruthy();
    }
  });

  it("ships a balanced vocab + training set", () => {
    const c = wordArtCoverage();
    expect(c.vocab).toBeGreaterThan(20);
    expect(c.training).toBeGreaterThan(10);
    expect(c.total).toBe(c.vocab + c.training);
  });
});
