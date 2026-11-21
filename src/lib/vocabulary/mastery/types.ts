/** Vocabulary Mastery status machine + persisted shapes (plan §3–§4). */

export type MasteryStatus = "New" | "Learning" | "Familiar" | "Mastered";

export type SkillKind = "recognition" | "typing" | "listening" | "pronunciation";

export type WordMasteryRecord = {
  vocabularyId: string;
  introducedAt: string | null;
  lessonCompletedAt: string | null;
  attempts: number;
  correctFirstAttempts: number;
  typingAttempts: number;
  typingCorrect: number;
  listeningAttempts: number;
  listeningCorrect: number;
  recognitionAttempts: number;
  recognitionCorrect: number;
  pronunciationAttempts: number;
  pronunciationCorrect: number;
  lastReviewedAt: string | null;
  /** ISO date YYYY-MM-DD (UTC calendar day). */
  nextReviewAt: string | null;
  reviewIntervalDays: number;
  consecutiveSuccesses: number;
  masteryStatus: MasteryStatus;
};

export type XpLedgerEntry = {
  eventKey: string;
  amount: number;
  reason: string;
  createdAt: string;
};

export type MasteryState = {
  version: 1;
  words: Record<string, WordMasteryRecord>;
  completedLessonIds: string[];
  xpLedger: XpLedgerEntry[];
  totalXp: number;
  updatedAt: string;
};

export type TypingGrade =
  | { ok: true; exact: true }
  | { ok: false; reason: "empty" | "wrong_base" | "wrong_diacritics"; hint: string };

export type QuizQuestionKind = "image" | "listening" | "typing";

export type QuizQuestion = {
  id: string;
  kind: QuizQuestionKind;
  vocabularyId: string;
  promptEn: string;
  /** For image / listening MC; empty for typing. */
  choices: string[];
  correctVi: string;
};

export type QuizResult = {
  lessonId: string;
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  answers: Array<{ questionId: string; vocabularyId: string; correct: boolean; kind: QuizQuestionKind }>;
};

export const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
export const QUIZ_PASS_PERCENT = 80;
export const QUIZ_TARGET_QUESTIONS = 8;

export const XP = {
  lessonComplete: 10,
  quizPass: 20,
  /** First-attempt typed correct (per word, once). */
  firstAttemptTyped: 5,
  /** Daily Review session complete (once per day). */
  dailyReviewComplete: 15,
} as const;
