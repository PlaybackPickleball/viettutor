/** Authored Đánh Vần lesson types — sequences are never invented at runtime. */

export type Dialect = "southern" | "northern";

export type PhonicsStepKind =
  | "initial"
  | "vowel"
  | "final"
  | "combine"
  | "tone"
  | "syllable";

export type PhonicsStep = {
  /** Written form shown to the learner (letter, tone mark, or syllable). */
  display: string;
  /** Conventional Đánh Vần spoken form (e.g. bờ, sắc). */
  utterance: string;
  kind: PhonicsStepKind;
  /** Optional English gloss for this step alone. */
  glossEn?: string;
};

export type ToneId = "ngang" | "sac" | "huyen" | "hoi" | "nga" | "nang";

export type ToneCard = {
  id: ToneId;
  /** Written syllable with tone. */
  written: string;
  nameVi: string;
  nameEn: string;
  /** Authored vocabulary gloss for this written form (Southern-first contexts). */
  meaningEn?: string;
  /** Contour hint for Southern dialect viz (not a score). */
  contourHint: string;
  utterance: string;
};

export type LessonKind =
  | "build"
  | "tone-family"
  | "recognition"
  | "listen-tone"
  | "free-build"
  | "read"
  | "review";

export type PhonicsLesson = {
  id: string;
  order: number;
  kind: LessonKind;
  titleEn: string;
  titleVi: string;
  explanationEn: string;
  explanationVi: string;
  /** Target written form when the lesson centers on one syllable. */
  target?: string;
  meaningEn?: string;
  dialect: Dialect;
  /** Authored step sequence for build lessons. */
  steps?: PhonicsStep[];
  /** Six-tone family cards. */
  toneFamily?: ToneCard[];
  /** Recognition / quiz options (written forms). */
  options?: string[];
  /** Short words to read. */
  readWords?: { vi: string; en: string }[];
  /** Linked verified lesson ids for review packs. */
  reviewOf?: string[];
};

export type PhonicsProgressState = {
  dialect: "southern";
  completedLessonIds: string[];
  attemptsByLesson: Record<string, number>;
  lastLessonId: string | null;
  practiceDates: string[];
  updatedAt: string;
};
