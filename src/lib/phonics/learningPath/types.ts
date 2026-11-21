/**
 * Đánh Vần Learning Path schema — lesson definitions stay separate from UI.
 * Authored sequences only; Southern dialect first; no fake pronunciation scores.
 */

import type { Dialect, PhonicsStep, ToneId } from "../types";

/** Pedagogical role in the Đánh Vần 2.0 HEAR→…→REVIEW engine. */
export type StepRole =
  | "hear"
  | "repeat"
  | "blend"
  | "recognize"
  | "read"
  | "write"
  | "review";

export type ExerciseType =
  | "hear-sound" // HEAR — listen / slow / replay
  | "listen-choose" // A — HEAR/RECOGNIZE by ear
  | "build-syllable" // B — BLEND
  | "tone-detective" // C — HEAR tones
  | "sound-match" // D — RECOGNIZE sound→letter
  | "speak-compare" // E — REPEAT (ear compare, no fake score)
  | "missing-component" // F — RECOGNIZE missing piece
  | "read-without-help" // G — READ
  | "write-trace" // WRITE — Mali trace (no accuracy claim)
  | "review-challenge"; // H — REVIEW

export type SkillKind = "letter" | "tone" | "pattern" | "vocab" | "listening";

export type SkillMasteryLevel = "new" | "learning" | "familiar" | "mastered";

export type LessonMapStatus = "locked" | "available" | "completed" | "mastered";

export type PhonicsSkill = {
  id: string;
  labelEn: string;
  labelVi: string;
  kind: SkillKind;
};

export type VocabularyEntry = {
  id: string;
  written: string;
  glossEn: string;
  /** When false, treat as sound-training — do not sell as essential beginner vocab. */
  conversational: boolean;
  noteEn?: string;
};

export type SyllableDef = {
  id: string;
  written: string;
  tone: ToneId;
  dialect: Dialect;
  /** Authored Đánh Vần steps — never invented at runtime. */
  sequence: PhonicsStep[];
  vocab?: VocabularyEntry;
};

export type ExerciseOption = {
  id: string;
  label: string;
  glossEn?: string;
};

export type PathExercise = {
  id: string;
  type: ExerciseType;
  /** 2.0 pedagogical role — drives labels; defaults from `type` when omitted. */
  stepRole?: StepRole;
  promptEn: string;
  promptVi?: string;
  /** Native/TTS reference utterance. */
  audioUtterance?: string;
  /**
   * Stable audio asset id (e.g. `vi.south.vowel.a`).
   * Prefer verified native file when present; otherwise TTS placeholder — never silent “verified”.
   */
  audioAssetId?: string;
  options?: ExerciseOption[];
  correctOptionId?: string;
  /** For build / missing-component. */
  buildSteps?: PhonicsStep[];
  targetWritten?: string;
  targetGlossEn?: string;
  missingKind?: "initial" | "vowel" | "tone" | "final";
  /** Mali write target (letter or syllable). */
  traceGrapheme?: string;
  /** Optional stroke paths from alphabet curriculum; empty → Mali guide only. */
  traceStrokes?: string[];
  hintEn: string;
  skillIds: string[];
  /** When true, successful completion awards review-challenge bonus XP. */
  reviewBonus?: boolean;
};

export type LearningLesson = {
  id: string;
  worldId: string;
  order: number;
  titleEn: string;
  titleVi: string;
  summaryEn: string;
  durationMin: number;
  playable: boolean;
  prerequisiteSkillIds: string[];
  introducesSkillIds: string[];
  reviewSkillIds: string[];
  targetSyllableIds: string[];
  exercises: PathExercise[];
  /** Correct-answer ratio thresholds for stars (performance, not time). */
  starThresholds: { two: number; three: number };
};

export type LearningWorld = {
  id: string;
  order: number;
  titleEn: string;
  titleVi: string;
  summaryEn: string;
  playable: boolean;
  badgeId: string;
  lessonIds: string[];
};

export type LessonAttemptRecord = {
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestCorrectRatio: number;
  attempts: number;
  xpEarned: number;
  completedAt?: string;
};

export type SkillProgressRecord = {
  exposures: number;
  correct: number;
  incorrect: number;
  level: SkillMasteryLevel;
  nextReviewAt: string | null;
  lastSeenAt: string | null;
};

export type PathProgressState = {
  version: 1;
  dialect: "southern";
  xp: number;
  streakDays: number;
  lastPracticeDate: string | null;
  lessons: Record<string, LessonAttemptRecord>;
  skills: Record<string, SkillProgressRecord>;
  badges: string[];
  updatedAt: string;
};
