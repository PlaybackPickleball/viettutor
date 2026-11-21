import generated from "./packLessons.generated.json";
import type { PackLesson, PackWord } from "./types";

const WORDS = generated.words as PackWord[];
const LESSONS = generated.lessons as PackLesson[];

const byId = new Map(WORDS.map((w) => [w.id, w]));

/** Bump when replacing image binaries so browsers drop the prior 128×128 set. */
export const PACK_IMAGE_CACHE_BUST = "hd1";

/** Public image URL with cache-bust query (disk path stays `word.imageSrc`). */
export function packImageUrl(word: PackWord): string {
  const base = word.imageSrc.startsWith("/") ? word.imageSrc : `/${word.imageSrc}`;
  return `${base}?v=${PACK_IMAGE_CACHE_BUST}`;
}

export function listPackWords(): PackWord[] {
  return WORDS;
}

export function getPackWord(id: string): PackWord | undefined {
  return byId.get(id);
}

export function listPackLessons(): PackLesson[] {
  return LESSONS;
}

export function getPackLesson(id: string): PackLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function packLessonWords(lesson: PackLesson): {
  neu: PackWord[];
  review: PackWord[];
} {
  return {
    neu: lesson.newWordIds.map((id) => byId.get(id)!).filter(Boolean),
    review: lesson.reviewWordIds.map((id) => byId.get(id)!).filter(Boolean),
  };
}

export function packWordCount(): number {
  return WORDS.length;
}

export function packLessonCount(): number {
  return LESSONS.length;
}
