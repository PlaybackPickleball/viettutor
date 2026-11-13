export type ErrorDimension =
  | "tone"
  | "vowel"
  | "final"
  | "timing"
  | "unscoreable"
  | "ok";

export type ScoreRequest = {
  letterId: string;
  grapheme: string;
  /** Duration of recording in ms — used by mock for unscoreable gate */
  durationMs: number;
  /** Attempt index for this letter (0-based) */
  attemptIndex: number;
};

export type ScoreResult = {
  /** Always true for MVP mock path */
  simulated: true;
  dimension: ErrorDimension;
  /** Plain-language teacher cue — one primary tip */
  tip: string;
  /** Soft pass for mastery loop; false for unscoreable / clear miss */
  passed: boolean;
  /** Optional light evidence note (not a percentage score) */
  evidence?: string;
};

export interface PronunciationScorer {
  score(request: ScoreRequest): Promise<ScoreResult>;
}
