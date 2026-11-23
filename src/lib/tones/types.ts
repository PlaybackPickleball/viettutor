/** Vietnamese Tones (Dấu Thanh) — dedicated module types. */

export type ToneId = "ngang" | "sac" | "huyen" | "hoi" | "nga" | "nang";

export type ToneDialect = "northern" | "southern";

export type ToneLessonPhase = "listen" | "view" | "trace" | "say" | "quiz";

export type ToneQuizKind = "listen-choose" | "select-mark" | "type-form" | "trace-stamp";

export type ToneCard = {
  id: ToneId;
  journeyLessonId: string;
  order: number;
  nameVi: string;
  nameEn: string;
  /** Written syllable used for teaching (ma family). */
  written: string;
  /** Gloss — native-reviewed training senses. */
  meaningEn: string;
  meaningVi?: string;
  /** Spoken utterance for ListenControls / TTS fallback. */
  utterance: string;
  markChar: string;
  markNameEn: string;
  /** How to draw the written mark (mnemonic — not the pitch path). */
  strokeGuideEn: string;
  /** Pitch contour teaching hint (animated separately). */
  contourHintEn: string;
  /** Short voice cue for overview rows (mockup-style). */
  voiceCueEn: string;
  /** SVG path in 0..100 viewBox for pitch animation. */
  pitchPath: string;
  /** SVG path for mark stroke practice (viewBox 0 0 100 100). Empty for ngang. */
  markStrokePath: string;
  northernNoteEn: string;
  southernNoteEn: string;
  /** Soft row tint + accent for overview cards (ÁMi palette). */
  rowClass: string;
  accentClass: string;
  /** Skill id for path SRS / Daily Review. */
  skillId: string;
};

export type ToneQuizQuestion = {
  id: string;
  kind: ToneQuizKind;
  promptEn: string;
  toneId: ToneId;
  audioUtterance?: string;
  options?: { id: string; label: string; glossEn?: string }[];
  correctOptionId?: string;
  /** For type-form */
  expectedWritten?: string;
  /** Southern hỏi/ngã listening may accept either id. */
  acceptOptionIds?: string[];
  hintEn: string;
};

export type ToneLessonRecord = {
  completed: boolean;
  bestQuizRatio: number;
  mastered: boolean;
  attempts: number;
  lastCompletedAt: string | null;
};

export type ToneProgressState = {
  version: 1;
  dialect: ToneDialect;
  /** Learner finished the marks fundamentals intro. */
  fundamentalsDone: boolean;
  lessons: Record<string, ToneLessonRecord>;
  masteryTest: {
    attempts: number;
    bestRatio: number;
    passed: boolean;
    lastAttemptAt: string | null;
  };
  updatedAt: string;
};
