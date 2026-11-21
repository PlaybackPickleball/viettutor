import generated from "./curriculum.generated.json";
import type { EssentialLesson, EssentialSentence } from "./types";

const LESSONS = generated.lessons as EssentialLesson[];
const SENTENCES = generated.sentences as EssentialSentence[];
const byId = new Map(SENTENCES.map((s) => [s.id, s]));

export const SENTENCES_PRONOUN_NOTE = generated.pronounNote as string;

export function listEssentialLessons(): EssentialLesson[] {
  return LESSONS;
}

export function getEssentialLesson(id: string): EssentialLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function listEssentialSentences(): EssentialSentence[] {
  return SENTENCES;
}

export function getEssentialSentence(id: string): EssentialSentence | undefined {
  return byId.get(id);
}

export function lessonSentences(lesson: EssentialLesson): EssentialSentence[] {
  return lesson.sentenceIds.map((id) => byId.get(id)!).filter(Boolean);
}

export function nextSentenceInLesson(
  lessonId: string,
  sentenceId: string,
): EssentialSentence | null {
  const lesson = getEssentialLesson(lessonId);
  if (!lesson) return null;
  const idx = lesson.sentenceIds.indexOf(sentenceId);
  if (idx < 0 || idx + 1 >= lesson.sentenceIds.length) return null;
  return byId.get(lesson.sentenceIds[idx + 1]!) ?? null;
}
