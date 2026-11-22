import { getLetter } from "@/lib/letters";
import { getSyllable } from "./syllables";
import type { PathExercise, ExerciseOption, ExerciseType, StepRole } from "./types";

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

export function hearSound(args: {
  lessonKey: string;
  promptEn: string;
  promptVi?: string;
  audio: string;
  audioAssetId?: string;
  hintEn?: string;
  skillIds: string[];
  written?: string;
  glossEn?: string;
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-HEAR`),
    type: "hear-sound",
    stepRole: "hear",
    promptEn: args.promptEn,
    promptVi: args.promptVi,
    audioUtterance: args.audio,
    audioAssetId: args.audioAssetId,
    targetWritten: args.written,
    targetGlossEn: args.glossEn,
    hintEn: args.hintEn ?? "Listen at normal speed, then Slow if you need another pass.",
    skillIds: args.skillIds,
  };
}

export function writeTrace(args: {
  lessonKey: string;
  grapheme: string;
  /** Alphabet letter id for strokes; omit for Mali-guide-only syllable write. */
  letterId?: string;
  promptEn: string;
  hintEn?: string;
  skillIds: string[];
  glossEn?: string;
}): PathExercise {
  const letter = args.letterId ? getLetter(args.letterId) : undefined;
  return {
    id: eid(`${args.lessonKey}-WRITE`),
    type: "write-trace",
    stepRole: "write",
    promptEn: args.promptEn,
    targetWritten: args.grapheme,
    targetGlossEn: args.glossEn,
    traceGrapheme: args.grapheme,
    traceStrokes: letter?.strokes ?? [],
    hintEn:
      args.hintEn ??
      "Trace the Mali model — practice the shape; we do not grade handwriting accuracy.",
    skillIds: args.skillIds,
  };
}

export function listenChoose(args: {
  lessonKey: string;
  promptEn: string;
  promptVi?: string;
  audio: string;
  audioAssetId?: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
  stepRole?: StepRole;
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-A`),
    type: "listen-choose",
    stepRole: args.stepRole ?? "recognize",
    promptEn: args.promptEn,
    promptVi: args.promptVi,
    audioUtterance: args.audio,
    audioAssetId: args.audioAssetId,
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
  audioAssetId?: string;
}): PathExercise {
  const syl = getSyllable(args.syllableId);
  if (!syl) throw new Error(`Unknown syllable ${args.syllableId}`);
  return {
    id: eid(`${args.lessonKey}-B`),
    type: "build-syllable",
    stepRole: "blend",
    promptEn: args.promptEn,
    audioUtterance: syl.written,
    audioAssetId: args.audioAssetId,
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
  audioAssetId?: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-C`),
    type: "tone-detective",
    stepRole: "recognize",
    promptEn: args.promptEn,
    audioUtterance: args.audio,
    audioAssetId: args.audioAssetId,
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
  audioAssetId?: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
  stepRole?: StepRole;
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-D`),
    type: "sound-match",
    stepRole: args.stepRole ?? "recognize",
    promptEn: args.promptEn,
    audioUtterance: args.audio,
    audioAssetId: args.audioAssetId,
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
  audioAssetId?: string;
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-E`),
    type: "speak-compare",
    stepRole: "repeat",
    promptEn: args.promptEn,
    audioUtterance: args.written,
    audioAssetId: args.audioAssetId,
    targetWritten: args.written,
    targetGlossEn: args.glossEn,
    hintEn:
      "Listen to the reference, record yourself, then replay both. Deepgram match when configured — never a fake pronunciation score.",
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
    stepRole: "recognize",
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
  audioAssetId?: string;
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-G`),
    type: "read-without-help",
    stepRole: "read",
    promptEn: args.promptEn ?? "Read this syllable, then reveal the meaning.",
    targetWritten: args.written,
    targetGlossEn: args.glossEn,
    audioUtterance: args.written,
    audioAssetId: args.audioAssetId,
    hintEn: "Try reading first — then tap Reveal to check.",
    skillIds: args.skillIds,
  };
}

export function reviewChallenge(args: {
  lessonKey: string;
  promptEn: string;
  audio: string;
  audioAssetId?: string;
  choices: { id: string; label: string; glossEn?: string }[];
  correctId: string;
  hintEn: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-H`),
    type: "review-challenge",
    stepRole: "recognize",
    promptEn: args.promptEn,
    audioUtterance: args.audio,
    audioAssetId: args.audioAssetId,
    options: opts(args.choices),
    correctOptionId: args.correctId,
    hintEn: args.hintEn,
    skillIds: args.skillIds,
    reviewBonus: true,
  };
}

export function listenType(args: {
  lessonKey: string;
  promptEn: string;
  promptVi?: string;
  audio: string;
  audioAssetId?: string;
  written: string;
  glossEn?: string;
  hintEn?: string;
  skillIds: string[];
}): PathExercise {
  return {
    id: eid(`${args.lessonKey}-RECALL`),
    type: "listen-type",
    stepRole: "recall",
    promptEn: args.promptEn,
    promptVi: args.promptVi,
    audioUtterance: args.audio,
    audioAssetId: args.audioAssetId,
    targetWritten: args.written,
    targetGlossEn: args.glossEn,
    hintEn:
      args.hintEn ??
      "Listen, then type what you heard — no peeking. Diacritics matter.",
    skillIds: args.skillIds,
  };
}

export const EXERCISE_TYPE_LABEL: Record<ExerciseType, string> = {
  "hear-sound": "Hear",
  "listen-choose": "Listen & Choose",
  "build-syllable": "Build the Syllable",
  "tone-detective": "Tone Detective",
  "sound-match": "Sound Match",
  "speak-compare": "Speak & Compare",
  "missing-component": "Missing Component",
  "read-without-help": "Read Without Help",
  "write-trace": "Handwriting (optional)",
  "review-challenge": "Recognize",
  "listen-type": "Recall (type)",
};

export const STEP_ROLE_LABEL: Record<StepRole, string> = {
  hear: "HEAR",
  /** Product loop label — Deepgram match, not a pronunciation score. */
  repeat: "SAY",
  blend: "BLEND",
  recognize: "RECOGNIZE",
  read: "READ",
  write: "WRITE",
  review: "RECOGNIZE",
  recall: "RECALL",
};

const TYPE_DEFAULT_ROLE: Record<ExerciseType, StepRole> = {
  "hear-sound": "hear",
  "listen-choose": "recognize",
  "build-syllable": "blend",
  "tone-detective": "recognize",
  "sound-match": "recognize",
  "speak-compare": "repeat",
  "missing-component": "recognize",
  "read-without-help": "read",
  "write-trace": "write",
  "review-challenge": "recognize",
  "listen-type": "recall",
};

export function resolveStepRole(exercise: PathExercise): StepRole {
  return exercise.stepRole ?? TYPE_DEFAULT_ROLE[exercise.type];
}
