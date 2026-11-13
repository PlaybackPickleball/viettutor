import { ALL_LETTERS, LEVELS } from "./letters";
import {
  currentLevelId,
  isLetterComplete,
  type LetterProgress,
  type ProgressState,
} from "./progress";

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
  return ALL_LETTERS.reduce((sum, l) => sum + starsForLetter(state.letters[l.id]), 0);
}

export function maxStars(): number {
  return ALL_LETTERS.length * 4;
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
  const mastered = ALL_LETTERS.filter((l) => isLetterComplete(state.letters[l.id])).length;
  const level = currentLevelId(state);
  if (stars === 0) return "Collect a star each time you finish Hear, Say, Write, or Link.";
  if (mastered === 0) {
    return `${stars} star${stars === 1 ? "" : "s"} so far — keep going on Level ${level}.`;
  }
  if (mastered < ALL_LETTERS.length) {
    return `Level ${level} of ${LEVELS.length} · ${mastered} sounds stamped · ${stars}/${maxStars()} stars.`;
  }
  return `Full alphabet path stamped — ${stars} stars. Beautiful work.`;
}
