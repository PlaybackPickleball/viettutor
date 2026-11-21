import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  getPackLesson,
  listPackLessons,
  listPackWords,
  PACK_IMAGE_CACHE_BUST,
  packImageUrl,
  packLessonWords,
  packWordCount,
} from "./catalog";

describe("vocabulary pack catalog", () => {
  it("loads 100 words with VI diacritics and public image paths", () => {
    const words = listPackWords();
    expect(words).toHaveLength(100);
    expect(packWordCount()).toBe(100);
    const first = words[0]!;
    expect(first.vi).toBe("tôi");
    expect(first.en).toBe("I");
    expect(first.imageSrc).toBe("/vocabulary/images/001.webp");
    expect(first.skillId).toBe("pack-v-001");
    expect(packImageUrl(first)).toBe(
      `/vocabulary/images/001.webp?v=${PACK_IMAGE_CACHE_BUST}`,
    );
  });

  it("builds 16 progressive lessons with 5–7 new words and prior review", () => {
    const lessons = listPackLessons();
    expect(lessons).toHaveLength(16);
    const allNew = new Set<string>();
    for (const lesson of lessons) {
      expect(lesson.newWordIds.length).toBeGreaterThanOrEqual(5);
      expect(lesson.newWordIds.length).toBeLessThanOrEqual(7);
      for (const id of lesson.newWordIds) {
        expect(allNew.has(id)).toBe(false);
        allNew.add(id);
      }
      if (lesson.order === 1) {
        expect(lesson.reviewWordIds).toHaveLength(0);
      } else {
        expect(lesson.reviewWordIds.length).toBeGreaterThan(0);
        expect(lesson.reviewWordIds.length).toBeLessThanOrEqual(3);
      }
      const { neu, review } = packLessonWords(lesson);
      expect(neu).toHaveLength(lesson.newWordIds.length);
      expect(review).toHaveLength(lesson.reviewWordIds.length);
    }
    expect(allNew.size).toBe(100);
    expect(getPackLesson("u4-l01")?.newWordIds[0]).toBe("v001");
  });

  it("has every image file on disk", () => {
    const root = join(process.cwd(), "public");
    const missing = listPackWords().filter((w) => !existsSync(join(root, w.imageSrc.slice(1))));
    expect(missing).toEqual([]);
  });
});
