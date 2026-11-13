import { describe, expect, it } from "vitest";
import { segmentVietnamese, sentenceTranslationHint } from "./segmentationService";
import { cleanupOcrText } from "./ocrService";
import { explainExpression } from "./tutorService";

describe("segmentVietnamese", () => {
  it("keeps multi-syllable compounds together", () => {
    const segs = segmentVietnamese("Tôi muốn uống nước dừa.");
    const texts = segs.filter((s) => s.kind !== "punct").map((s) => s.text);
    expect(texts).toContain("nước dừa");
    expect(texts).toContain("Tôi");
    expect(texts).toContain("muốn");
  });

  it("preserves Vietnamese diacritics", () => {
    const segs = segmentVietnamese("Cà phê ngon.");
    expect(segs.some((s) => s.expression === "cà phê" || s.text === "Cà phê")).toBe(true);
  });

  it("does not invent tokens from empty OCR", () => {
    expect(segmentVietnamese("")).toEqual([]);
  });
});

describe("cleanupOcrText", () => {
  it("normalizes whitespace without inventing words", () => {
    expect(cleanupOcrText("  Xin   chào\n\n\nban  ")).toBe("Xin chào\n\nban");
  });
});

describe("tutor lexicon", () => {
  it("explains known words", () => {
    const e = explainExpression("nước");
    expect(e.meaningEn.toLowerCase()).toContain("water");
    expect(e.source).toBe("lexicon");
  });

  it("does not invent meanings for unknown words", () => {
    const e = explainExpression("xyzzy");
    expect(e.source).toBe("fallback");
    expect(e.meaningEn.toLowerCase()).toContain("not in the beginner lexicon");
  });
});

describe("sentence hint", () => {
  it("maps the demo sentence", () => {
    expect(sentenceTranslationHint("Tôi muốn uống nước dừa.")).toMatch(/coconut/i);
  });
});
