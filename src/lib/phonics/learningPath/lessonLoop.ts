/**
 * Hear → Write → Say → Review loop helpers for Đánh Vần path lessons.
 * Injects missing core steps with stable ids — does not invent pronunciation scores.
 */

import { getLetter } from "@/lib/letters";
import { resolveStepRole } from "./exerciseBuilders";
import { getSyllable } from "./syllables";
import type { LearningLesson, PathExercise, StepRole } from "./types";

export const LOOP_PHASES = ["hear", "write", "say", "review"] as const;
export type LoopPhase = (typeof LOOP_PHASES)[number];

export const LOOP_PHASE_LABEL: Record<LoopPhase, string> = {
  hear: "Hear",
  write: "Write",
  say: "Say",
  review: "Review",
};

/** Map pedagogical step roles onto the product loop. */
export function stepRoleToLoopPhase(role: StepRole): LoopPhase | null {
  if (role === "hear") return "hear";
  if (role === "write") return "write";
  if (role === "repeat") return "say";
  if (role === "review") return "review";
  return null;
}

export function exerciseLoopPhase(exercise: PathExercise): LoopPhase | null {
  return stepRoleToLoopPhase(resolveStepRole(exercise));
}

export function lessonLoopCoverage(lesson: LearningLesson): Record<LoopPhase, boolean> {
  const coverage: Record<LoopPhase, boolean> = {
    hear: false,
    write: false,
    say: false,
    review: false,
  };
  for (const ex of lesson.exercises) {
    const phase = exerciseLoopPhase(ex);
    if (phase) coverage[phase] = true;
  }
  return coverage;
}

export function lessonHasFullLoop(lesson: LearningLesson): boolean {
  const c = lessonLoopCoverage(lesson);
  return c.hear && c.write && c.say && c.review;
}

function primaryWritten(lesson: LearningLesson): { written: string; glossEn?: string; letterId?: string } {
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

function makeWrite(lesson: LearningLesson, target: ReturnType<typeof primaryWritten>): PathExercise {
  const letter = target.letterId ? getLetter(target.letterId) : getLetter(target.written);
  const skills = [...new Set([...skillIdsFor(lesson), "write-trace"])];
  return {
    id: `${lesson.id}-loop-write`,
    type: "write-trace",
    stepRole: "write",
    promptEn: `Write ${target.written} — Mali guide (shape practice only).`,
    targetWritten: target.written,
    targetGlossEn: target.glossEn,
    traceGrapheme: target.written,
    traceStrokes: letter?.strokes ?? [],
    hintEn: "Trace the Mali model — practice the shape; we do not grade handwriting accuracy.",
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

function makeReview(lesson: LearningLesson, target: ReturnType<typeof primaryWritten>): PathExercise {
  const skills = skillIdsFor(lesson);
  const distractors = lesson.targetSyllableIds
    .map((id) => getSyllable(id)?.written)
    .filter((w): w is string => Boolean(w) && w !== target.written)
    .slice(0, 2);
  while (distractors.length < 2) {
    const pad = ["ba", "ma", "bo", "a", "o"].find(
      (w) => w !== target.written && !distractors.includes(w),
    );
    if (!pad) break;
    distractors.push(pad);
  }
  const choices = [
    { id: target.written, label: target.written, glossEn: target.glossEn },
    ...distractors.map((w) => ({ id: w, label: w })),
  ];
  return {
    id: `${lesson.id}-loop-review`,
    type: "review-challenge",
    stepRole: "review",
    promptEn: `Review — which form is ${target.written}?`,
    audioUtterance: target.written,
    options: choices,
    correctOptionId: target.written,
    hintEn: `Listen again — the answer is ${target.written}.`,
    skillIds: skills.length ? skills : ["listen-discriminate"],
    reviewBonus: true,
  };
}

const MAX_EXERCISES = 8;

/**
 * Ensure every playable lesson exposes Hear → Write → Say → Review.
 * Preserves existing middle steps (blend / read / tone). Idempotent on stable loop ids.
 */
export function ensureHearWriteSayReview(lesson: LearningLesson): LearningLesson {
  if (!lesson.playable) return lesson;

  const coverage = lessonLoopCoverage(lesson);
  if (coverage.hear && coverage.write && coverage.say && coverage.review) {
    return lesson;
  }

  const target = primaryWritten(lesson);
  let exercises = [...lesson.exercises];

  if (!coverage.hear) {
    exercises = [makeHear(lesson, target), ...exercises];
  }
  if (!coverage.write) {
    const hearIdx = exercises.findIndex((e) => exerciseLoopPhase(e) === "hear");
    const insertAt = hearIdx >= 0 ? hearIdx + 1 : 0;
    exercises = [
      ...exercises.slice(0, insertAt),
      makeWrite(lesson, target),
      ...exercises.slice(insertAt),
    ];
  }
  if (!coverage.say) {
    const reviewIdx = exercises.findIndex((e) => exerciseLoopPhase(e) === "review");
    const insertAt = reviewIdx >= 0 ? reviewIdx : exercises.length;
    exercises = [
      ...exercises.slice(0, insertAt),
      makeSay(lesson, target),
      ...exercises.slice(insertAt),
    ];
  }
  if (!coverage.review) {
    exercises = [...exercises, makeReview(lesson, target)];
  }

  // Prefer dropping optional middle roles if we exceed the catalog cap.
  while (exercises.length > MAX_EXERCISES) {
    const dropIdx = exercises.findIndex((e) => {
      const phase = exerciseLoopPhase(e);
      return phase == null;
    });
    if (dropIdx < 0) break;
    exercises.splice(dropIdx, 1);
  }

  return { ...lesson, exercises };
}

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
