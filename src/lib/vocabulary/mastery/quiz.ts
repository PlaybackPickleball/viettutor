import { getPackLesson, getPackWord, packLessonWordIds, type PackWord } from "@/lib/vocabulary";
import {
  QUIZ_PASS_PERCENT,
  QUIZ_TARGET_QUESTIONS,
  type QuizQuestion,
  type QuizQuestionKind,
  type QuizResult,
} from "./types";

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function distractors(correct: PackWord, pool: PackWord[], n: number, rnd: () => number): string[] {
  const others = shuffle(
    pool.filter((w) => w.id !== correct.id),
    rnd,
  )
    .slice(0, n)
    .map((w) => w.vi);
  return shuffle([correct.vi, ...others], rnd);
}

/**
 * Build ~8 end-of-lesson quiz questions: mix of image MC, listening MC, typing.
 * Seeded by lessonId for stable tests.
 */
export function buildLessonQuiz(lessonId: string, seedExtra = 0): QuizQuestion[] {
  const lesson = getPackLesson(lessonId);
  if (!lesson) return [];
  const words = packLessonWordIds(lesson)
    .map((id) => getPackWord(id))
    .filter((w): w is PackWord => Boolean(w));
  if (words.length === 0) return [];

  const rnd = mulberry32(hashSeed(lessonId) + seedExtra);
  const kinds: QuizQuestionKind[] = ["image", "listening", "typing"];
  const target = Math.min(QUIZ_TARGET_QUESTIONS, Math.max(words.length, Math.min(8, words.length * 2)));
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < target; i++) {
    const word = words[i % words.length]!;
    const kind = kinds[i % kinds.length]!;
    if (kind === "typing") {
      questions.push({
        id: `${lessonId}-q${i}`,
        kind,
        vocabularyId: word.id,
        promptEn: `Type the Vietnamese for “${word.en}”.`,
        choices: [],
        correctVi: word.vi,
      });
    } else if (kind === "image") {
      questions.push({
        id: `${lessonId}-q${i}`,
        kind,
        vocabularyId: word.id,
        promptEn: `What is this? (${word.en})`,
        choices: distractors(word, words, 3, rnd),
        correctVi: word.vi,
      });
    } else {
      questions.push({
        id: `${lessonId}-q${i}`,
        kind,
        vocabularyId: word.id,
        promptEn: `Listen — which word did you hear?`,
        choices: distractors(word, words, 3, rnd),
        correctVi: word.vi,
      });
    }
  }
  return questions;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function scoreQuiz(
  lessonId: string,
  answers: Array<{ questionId: string; vocabularyId: string; correct: boolean; kind: QuizQuestionKind }>,
): QuizResult {
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return {
    lessonId,
    total,
    correct,
    percent,
    passed: percent >= QUIZ_PASS_PERCENT,
    answers,
  };
}

export { QUIZ_PASS_PERCENT, QUIZ_TARGET_QUESTIONS };
