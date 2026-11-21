import generated from "./packLessons.generated.json";
import type { PackLesson, PackWord } from "./types";

const WORDS = generated.words as PackWord[];
const LESSONS = generated.lessons as PackLesson[];

const byId = new Map(WORDS.map((w) => [w.id, w]));

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
