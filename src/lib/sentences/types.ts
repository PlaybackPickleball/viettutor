/** 100 Essential Sentences — content vs progress (MVP = first 50). */

export type ContentStatus = "pending_review" | "approved";
export type AudioMode = "native" | "tts_temporary";

export type SentenceWord =
  | { surface: string; kind: "punct" }
  | {
      surface: string;
      kind: "word";
      /** Top 100 pack id when linked (e.g. v001). */
      packWordId?: string | null;
      glossEn?: string | null;
    };

export type EssentialSentence = {
  id: string;
  order: number;
  lessonId: string;
  vi: string;
  en: string;
  dialect: "southern";
  contentStatus: ContentStatus;
  audioMode: AudioMode;
  imageSrc: string | null;
  words: SentenceWord[];
};

export type EssentialLesson = {
  id: string;
  order: number;
  titleEn: string;
  titleVi: string;
  sentenceIds: string[];
};

export type SentenceStage =
  | "look-listen"
  | "words"
  | "danh-van"
  | "speak"
  | "apply";

export const SENTENCE_STAGES: SentenceStage[] = [
  "look-listen",
  "words",
  "danh-van",
  "speak",
  "apply",
];

export type SentenceProgress = {
  stagesDone: Partial<Record<SentenceStage, boolean>>;
  completedAt?: string;
  spokenAt?: string;
  updatedAt: string;
};

export type SentencesProgressState = {
  version: 1;
  completedLessonIds: string[];
  sentences: Record<string, SentenceProgress>;
  /** Idempotent XP keys. */
  xpKeys: string[];
  totalXp: number;
  updatedAt: string;
};

export const SENTENCE_XP = {
  sentenceComplete: 10,
  lessonComplete: 25,
} as const;
