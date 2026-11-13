import { LEVEL1_LETTERS } from "./letters";
import { isLetterComplete, type LetterProgress, type ProgressState } from "./progress";

export type StepId = "hear" | "say" | "write" | "object";

const STEP_PRAISE: Record<StepId, string[]> = {
  hear: ["Ears open — nice listening.", "You heard the teacher’s model clearly."],
  say: ["Brave voice — that take counted.", "Your mouth is finding the sound."],
  write: ["Hand and eye working together.", "Beautiful stroke practice."],
  object: ["Sound meets meaning — well linked.", "Picture locked to the sound."],
};

const LETTER_DONE = [
  "Star earned — this sound is yours.",
  "Teacher stamp: sound complete.",
  "Wonderful — ready for the next letter.",
];

export function starsForLetter(p: LetterProgress | undefined): number {
  if (!p) return 0;
  let n = 0;
  if (p.heard) n += 1;
  if (p.sayMastered) n += 1;
  if (p.written) n += 1;
  if (p.objectSeen) n += 1;
  return n;
}

export function totalStars(state: ProgressState): number {
  return LEVEL1_LETTERS.reduce((sum, l) => sum + starsForLetter(state.letters[l.id]), 0);
}

export function maxStars(): number {
  return LEVEL1_LETTERS.length * 4;
}

export function praiseForStep(step: StepId, seed = 0): string {
  const pool = STEP_PRAISE[step];
  return pool[seed % pool.length];
}

export function praiseForLetterDone(seed = 0): string {
  return LETTER_DONE[seed % LETTER_DONE.length];
}

export function motivationLine(state: ProgressState): string {
  const stars = totalStars(state);
  const mastered = LEVEL1_LETTERS.filter((l) => isLetterComplete(state.letters[l.id])).length;
  if (stars === 0) return "Collect a star each time you finish Hear, Say, Write, or Link.";
  if (mastered === 0) {
    return `${stars} star${stars === 1 ? "" : "s"} so far — keep going, one sound at a time.`;
  }
  if (mastered < LEVEL1_LETTERS.length) {
    return `${mastered} sound${mastered === 1 ? "" : "s"} stamped · ${stars}/${maxStars()} stars.`;
  }
  return `All Level 1 sounds stamped — ${stars} stars. Beautiful work.`;
}
