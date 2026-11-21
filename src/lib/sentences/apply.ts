import { listEssentialSentences } from "./catalog";
import type { EssentialSentence } from "./types";

/** Build a 4-choice EN comprehension item; distractors from other sentences. */
export function buildApplyChoices(sentence: EssentialSentence): {
  choices: string[];
  correctEn: string;
} {
  const pool = listEssentialSentences()
    .filter((s) => s.id !== sentence.id)
    .map((s) => s.en);
  const distractors: string[] = [];
  for (const en of pool) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(en) && en !== sentence.en) distractors.push(en);
  }
  const choices = shuffle([sentence.en, ...distractors.slice(0, 3)]);
  return { choices, correctEn: sentence.en };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
