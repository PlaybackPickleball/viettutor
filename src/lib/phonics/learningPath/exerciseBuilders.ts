import { getSyllable } from "./syllables";
import type { PathExercise, ExerciseOption, ExerciseType } from "./types";

let exerciseSeq = 0;

function eid(prefix: string): string {
  exerciseSeq += 1;
  return `${prefix}-${exerciseSeq}`;
}

/** Reset counter between lesson files so ids stay stable within a module load order. */
export function resetExerciseIds() {
  exerciseSeq = 0;
}

function opts(labels: { id: string; label: string; glossEn?: string }[]): ExerciseOption[] {
  return labels.map((l) => ({ id: l.id, label: l.label, glossEn: l.glossEn }));
}

export function listenChoose(args: {
  lessonKey: string;
  promptEn: string;
  promptVi?: string;
  audio: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-A`),
    type: "listen-choose",
    promptEn: args.promptEn,
    promptVi: args.promptVi,
    audioUtterance: args.audio,
    options: opts(args.choices),
    correctOptionId: args.correctId,
    hintEn: args.hintEn,
    skillIds: args.skillIds,
  };
}

export function buildSyllable(args: {
  lessonKey: string;
  syllableId: string;
  promptEn: string;
  skillIds: string[];
  hintEn?: string;
}): PathExercise {
  const syl = getSyllable(args.syllableId);
  if (!syl) throw new Error(`Unknown syllable ${args.syllableId}`);
  return {
    id: eid(`${args.lessonKey}-B`),
    type: "build-syllable",
    promptEn: args.promptEn,
    audioUtterance: syl.written,
    buildSteps: syl.sequence,
    targetWritten: syl.written,
    targetGlossEn: syl.vocab?.glossEn,
    hintEn: args.hintEn ?? `Follow the authored steps to build ${syl.written}.`,
    skillIds: args.skillIds,
  };
}

export function toneDetective(args: {
  lessonKey: string;
  promptEn: string;
  audio: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-C`),
    type: "tone-detective",
    promptEn: args.promptEn,
    audioUtterance: args.audio,
    options: opts(args.choices),
    correctOptionId: args.correctId,
    hintEn: args.hintEn,
    skillIds: args.skillIds,
  };
}

export function soundMatch(args: {
  lessonKey: string;
  promptEn: string;
  audio: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-D`),
    type: "sound-match",
    promptEn: args.promptEn,
    audioUtterance: args.audio,
    options: opts(args.choices),
    correctOptionId: args.correctId,
    hintEn: args.hintEn,
    skillIds: args.skillIds,
  };
}

export function speakCompare(args: {
  lessonKey: string;
  written: string;
  glossEn?: string;
  promptEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-E`),
    type: "speak-compare",
    promptEn: args.promptEn,
    audioUtterance: args.written,
    targetWritten: args.written,
    targetGlossEn: args.glossEn,
    hintEn: "Listen to the reference, record yourself, then replay both — judge by ear (no fake score).",
    skillIds: args.skillIds,
  };
}

export function missingComponent(args: {
  lessonKey: string;
  syllableId: string;
  missingKind: "initial" | "vowel" | "tone";
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  promptEn: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  const syl = getSyllable(args.syllableId);
  if (!syl) throw new Error(`Unknown syllable ${args.syllableId}`);
  return {
    id: eid(`${args.lessonKey}-F`),
    type: "missing-component",
    promptEn: args.promptEn,
    audioUtterance: syl.written,
    buildSteps: syl.sequence,
    targetWritten: syl.written,
    targetGlossEn: syl.vocab?.glossEn,
    missingKind: args.missingKind,
    options: opts(args.choices),
    correctOptionId: args.correctId,
    hintEn: args.hintEn,
    skillIds: args.skillIds,
  };
}

export function readWithoutHelp(args: {
  lessonKey: string;
  written: string;
  glossEn: string;
  promptEn?: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-G`),
    type: "read-without-help",
    promptEn: args.promptEn ?? "Read this syllable, then reveal the meaning.",
    targetWritten: args.written,
    targetGlossEn: args.glossEn,
    audioUtterance: args.written,
    hintEn: "Try reading first — then tap Reveal to check.",
    skillIds: args.skillIds,
  };
}

export function reviewChallenge(args: {
  lessonKey: string;
  promptEn: string;
  audio: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-H`),
    type: "review-challenge",
    promptEn: args.promptEn,
    audioUtterance: args.audio,
    options: opts(args.choices),
    correctOptionId: args.correctId,
    hintEn: args.hintEn,
    skillIds: args.skillIds,
    reviewBonus: true,
  };
}

export const EXERCISE_TYPE_LABEL: Record<ExerciseType, string> = {
  "listen-choose": "Listen & Choose",
  "build-syllable": "Build the Syllable",
  "tone-detective": "Tone Detective",
  "sound-match": "Sound Match",
  "speak-compare": "Speak & Compare",
  "missing-component": "Missing Component",
  "read-without-help": "Read Without Help",
  "review-challenge": "Review Challenge",
};
