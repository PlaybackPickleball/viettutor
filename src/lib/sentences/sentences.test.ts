import { describe, expect, it } from "vitest";
import {
  getEssentialLesson,
  getEssentialSentence,
  listEssentialLessons,
  listEssentialSentences,
  SENTENCE_STAGES,
} from "./index";

describe("Essential Sentences MVP curriculum", () => {
  it("has exactly 5 lessons × 10 = 50 sentences", () => {
    const lessons = listEssentialLessons();
    expect(lessons).toHaveLength(5);
    const sentences = listEssentialSentences();
    expect(sentences).toHaveLength(50);
    expect(sentences.map((s) => s.order)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1),
    );
  });

  it("uses stable sentence_NNN ids and pending_review + southern", () => {
    for (const s of listEssentialSentences()) {
      expect(s.id).toMatch(/^sentence_\d{3}$/);
      expect(s.dialect).toBe("southern");
      expect(s.contentStatus).toBe("pending_review");
      if (s.lessonId === "s-l01" || s.lessonId === "s-l02") {
        expect(s.audioMode).toBe("native");
      } else {
        expect(s.audioMode).toBe("tts_temporary");
      }
      expect(s.vi.length).toBeGreaterThan(0);
      expect(s.en.length).toBeGreaterThan(0);
      expect(s.words.some((w) => w.kind === "word")).toBe(true);
    }
  });

  it("matches approved first/last and lesson topics", () => {
    expect(getEssentialSentence("sentence_001")?.vi).toBe("Xin chào.");
    expect(getEssentialSentence("sentence_050")?.vi).toBe("Tôi bị lạc đường.");
    expect(getEssentialLesson("s-l01")?.titleEn).toBe("Greetings & Politeness");
    expect(getEssentialLesson("s-l05")?.titleEn).toBe("Directions & Transportation");
    expect(getEssentialLesson("s-l01")?.sentenceIds).toHaveLength(10);
  });

  it("links Top 100 ids when present (tôi/bạn/phở)", () => {
    const s3 = getEssentialSentence("sentence_003")!;
    const toiWord = s3.words.find((w) => w.kind === "word" && w.surface.toLowerCase() === "tôi");
    expect(toiWord && toiWord.kind === "word" && toiWord.packWordId).toBe("v001");
    const s21 = getEssentialSentence("sentence_021")!;
    const pho = s21.words.find((w) => w.kind === "word" && w.surface === "phở");
    expect(pho && pho.kind === "word" && pho.packWordId).toBe("v043");
  });

  it("defines five learning stages", () => {
    expect(SENTENCE_STAGES).toEqual([
      "look-listen",
      "words",
      "danh-van",
      "speak",
      "apply",
    ]);
  });
});
