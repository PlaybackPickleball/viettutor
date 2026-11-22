/**
 * Hear → Recognize → Say → Recall loop helpers for Đánh Vần / Journey lessons.
 * Handwriting (write-trace) is optional Practice — stripped from mandatory loops.
 */

import { getLetter } from "@/lib/letters";
import { resolveStepRole } from "./exerciseBuilders";
import { getSyllable } from "./syllables";
import type { LearningLesson, PathExercise, StepRole } from "./types";

export const LOOP_PHASES = ["hear", "recognize", "say", "recall"] as const;
export type LoopPhase = (typeof LOOP_PHASES)[number];

export const LOOP_PHASE_LABEL: Record<LoopPhase, string> = {
  hear: "Hear",
  recognize: "Recognize",
  say: "Say",
  recall: "Recall",
};

/** Map pedagogical step roles onto the product loop. */
export function stepRoleToLoopPhase(role: StepRole): LoopPhase | null {
  if (role === "hear") return "hear";
  if (role === "recognize" || role === "review") return "recognize";
  if (role === "repeat") return "say";
  if (role === "recall") return "recall";
  return null;
}

export function exerciseLoopPhase(exercise: PathExercise): LoopPhase | null {
  if (exercise.type === "write-trace") return null;
  return stepRoleToLoopPhase(resolveStepRole(exercise));
}

export function lessonLoopCoverage(lesson: LearningLesson): Record<LoopPhase, boolean> {
  const coverage: Record<LoopPhase, boolean> = {
    hear: false,
    recognize: false,
    say: false,
    recall: false,
  };
  for (const ex of lesson.exercises) {
    const phase = exerciseLoopPhase(ex);
    if (phase) coverage[phase] = true;
  }
  return coverage;
}

export function lessonHasFullLoop(lesson: LearningLesson): boolean {
  const c = lessonLoopCoverage(lesson);
  return c.hear && c.recognize && c.say && c.recall;
}

function primaryWritten(lesson: LearningLesson): {
  written: string;
  glossEn?: string;
  letterId?: string;
} {
  for (const id of lesson.targetSyllableIds) {
    const syl = getSyllable(id);
    if (syl) {
      return { written: syl.written, glossEn: syl.vocab?.glossEn };
    }
  }
  for (const ex of lesson.exercises) {
    if (ex.targetWritten) {
      return { written: ex.targetWritten, glossEn: ex.targetGlossEn };
    }
    if (ex.audioUtterance) {
      return { written: ex.audioUtterance };
    }
  }
  const intro = lesson.introducesSkillIds[0] ?? lesson.reviewSkillIds[0];
  if (intro?.startsWith("letter-")) {
    const letterId = intro.slice("letter-".length);
    const letter = getLetter(letterId);
    if (letter) return { written: letter.grapheme, letterId: letter.id, glossEn: letter.soundHint };
  }
  return { written: lesson.titleVi || "a" };
}

function skillIdsFor(lesson: LearningLesson): string[] {
  const ids = [
    ...lesson.introducesSkillIds,
    ...lesson.reviewSkillIds,
    ...lesson.exercises.flatMap((e) => e.skillIds),
  ];
  return [...new Set(ids)].slice(0, 6);
}

function similarDistractors(written: string): string[] {
  const pool = ["a", "ă", "â", "e", "ê", "o", "ô", "ơ", "ba", "ma", "bo", "bò", "ăn", "ấm"];
  return pool.filter((w) => w !== written).slice(0, 3);
}

function makeHear(lesson: LearningLesson, target: ReturnType<typeof primaryWritten>): PathExercise {
  const skills = skillIdsFor(lesson);
  return {
    id: `${lesson.id}-loop-hear`,
    type: "hear-sound",
    stepRole: "hear",
    promptEn: `Hear ${target.written} — play, then Slow if you need another pass.`,
    audioUtterance: target.written,
    targetWritten: target.written,
    targetGlossEn: target.glossEn,
    hintEn: "Listen at normal speed, then Slow if you need another pass.",
    skillIds: skills.length ? skills : ["listen-discriminate"],
  };
}

function makeRecognize(
  lesson: LearningLesson,
  target: ReturnType<typeof primaryWritten>,
): PathExercise {
  const skills = [...new Set([...skillIdsFor(lesson), "listen-discriminate"])];
  const distractors = [
    ...lesson.targetSyllableIds
      .map((id) => getSyllable(id)?.written)
      .filter((w): w is string => Boolean(w) && w !== target.written),
    ...similarDistractors(target.written),
  ].filter((w, i, arr) => arr.indexOf(w) === i && w !== target.written);
  const picks = distractors.slice(0, 2);
  while (picks.length < 2) {
    const pad = similarDistractors(target.written).find((w) => !picks.includes(w));
    if (!pad) break;
    picks.push(pad);
  }
  const choices = [
    { id: target.written, label: target.written, glossEn: target.glossEn },
    ...picks.map((w) => ({ id: w, label: w })),
  ];
  return {
    id: `${lesson.id}-loop-recognize`,
    type: "listen-choose",
    stepRole: "recognize",
    promptEn: `Recognize — which form did you hear?`,
    audioUtterance: target.written,
    options: choices,
    correctOptionId: target.written,
    hintEn: `Listen again — look-alikes and near-sounds are distractors. Answer: ${target.written}.`,
    skillIds: skills,
  };
}

function makeSay(lesson: LearningLesson, target: ReturnType<typeof primaryWritten>): PathExercise {
  const skills = [...new Set([...skillIdsFor(lesson), "speak-compare"])];
  return {
    id: `${lesson.id}-loop-say`,
    type: "speak-compare",
    stepRole: "repeat",
    promptEn: `Say ${target.written} — Deepgram match when configured (not a pronunciation score).`,
    audioUtterance: target.written,
    targetWritten: target.written,
    targetGlossEn: target.glossEn,
    hintEn:
      "Listen to the reference, record yourself, then replay both. Deepgram match when configured — never a fake pronunciation score.",
    skillIds: skills,
  };
}

function makeRecall(
  lesson: LearningLesson,
  target: ReturnType<typeof primaryWritten>,
): PathExercise {
  const skills = [...new Set([...skillIdsFor(lesson), "listen-discriminate"])];
  return {
    id: `${lesson.id}-loop-recall`,
    type: "listen-type",
    stepRole: "recall",
    promptEn: `Recall — type ${target.written.length <= 4 ? "what you hear" : "the word"} (no peeking).`,
    audioUtterance: target.written,
    targetWritten: target.written,
    targetGlossEn: target.glossEn,
    hintEn: "Play audio, then type with diacritics. Use the Vietnamese helper keys if needed.",
    skillIds: skills,
  };
}

const MAX_EXERCISES = 8;

/**
 * Ensure every playable lesson exposes Hear → Recognize → Say → Recall.
 * Removes mandatory write-trace (handwriting stays under Practice).
 * Idempotent on stable loop ids.
 */
export function ensureHearRecognizeSayRecall(lesson: LearningLesson): LearningLesson {
  if (!lesson.playable) return lesson;

  // Handwriting is optional Practice — never part of the mandatory loop.
  // Normalize legacy "review" roles onto Recognize for the product loop.
  let exercises = lesson.exercises
    .filter((e) => e.type !== "write-trace")
    .map((e) => (e.stepRole === "review" ? { ...e, stepRole: "recognize" as const } : e));

  const coverage = (() => {
    const c: Record<LoopPhase, boolean> = {
      hear: false,
      recognize: false,
      say: false,
      recall: false,
    };
    for (const ex of exercises) {
      const phase = exerciseLoopPhase(ex);
      if (phase) c[phase] = true;
    }
    return c;
  })();

  if (coverage.hear && coverage.recognize && coverage.say && coverage.recall) {
    return { ...lesson, exercises };
  }

  const target = primaryWritten({ ...lesson, exercises });

  if (!coverage.hear) {
    exercises = [makeHear(lesson, target), ...exercises];
  }
  if (!coverage.recognize) {
    const hearIdx = exercises.findIndex((e) => exerciseLoopPhase(e) === "hear");
    const insertAt = hearIdx >= 0 ? hearIdx + 1 : 0;
    exercises = [
      ...exercises.slice(0, insertAt),
      makeRecognize(lesson, target),
      ...exercises.slice(insertAt),
    ];
  }
  if (!coverage.say) {
    const recallIdx = exercises.findIndex((e) => exerciseLoopPhase(e) === "recall");
    const insertAt = recallIdx >= 0 ? recallIdx : exercises.length;
    exercises = [
      ...exercises.slice(0, insertAt),
      makeSay(lesson, target),
      ...exercises.slice(insertAt),
    ];
  }
  if (!coverage.recall) {
    exercises = [...exercises, makeRecall(lesson, target)];
  }

  while (exercises.length > MAX_EXERCISES) {
    const dropIdx = exercises.findIndex((e) => exerciseLoopPhase(e) == null);
    if (dropIdx < 0) break;
    exercises.splice(dropIdx, 1);
  }

  // Canonical order: Hear → Recognize → (middle) → Say → Recall
  exercises = orderLoopExercises(exercises);

  return { ...lesson, exercises };
}

function orderLoopExercises(exercises: PathExercise[]): PathExercise[] {
  const hear: PathExercise[] = [];
  const recognize: PathExercise[] = [];
  const say: PathExercise[] = [];
  const recall: PathExercise[] = [];
  const middle: PathExercise[] = [];
  for (const e of exercises) {
    const phase = exerciseLoopPhase(e);
    if (phase === "hear") hear.push(e);
    else if (phase === "recognize") recognize.push(e);
    else if (phase === "say") say.push(e);
    else if (phase === "recall") recall.push(e);
    else middle.push(e);
  }
  return [...hear, ...recognize, ...middle, ...say, ...recall];
}

/** @deprecated Use {@link ensureHearRecognizeSayRecall}. */
export const ensureHearWriteSayReview = ensureHearRecognizeSayRecall;

/** Phases completed up to (and including) the current exercise index. */
export function completedLoopPhases(
  lesson: LearningLesson,
  currentIndex: number,
): Set<LoopPhase> {
  const done = new Set<LoopPhase>();
  for (let i = 0; i <= currentIndex && i < lesson.exercises.length; i++) {
    const phase = exerciseLoopPhase(lesson.exercises[i]!);
    if (phase) done.add(phase);
  }
  return done;
}
