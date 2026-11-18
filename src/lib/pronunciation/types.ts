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
  /**
   * True only for the legacy mock path (default off in product UI).
   * Honest compare/replay sets this false.
   */
  simulated: boolean;
  /** False until Azure / validated acoustics are wired. */
  scoringAvailable: boolean;
  dimension: ErrorDimension;
  /** Plain-language teacher cue — one primary tip */
  tip: string;
  /**
   * For compare/replay: true when the take was long enough to practice.
   * Not an accuracy grade.
   */
  passed: boolean;
  /** 0–100 only when scoringAvailable; otherwise null */
  quality: number | null;
  /** Optional light evidence note */
  evidence?: string;
  experimentalLabel?: string;
};

export type AverageReport = {
  count: number;
  averageQuality: number | null;
  passRate: number | null;
  dominantIssue: ErrorDimension | "ok";
  tip: string;
  qualities: number[];
  dimensions: ErrorDimension[];
  scoringAvailable: boolean;
};

export interface PronunciationScorer {
  score(request: ScoreRequest): Promise<ScoreResult>;
}

export function averageScores(results: ScoreResult[]): AverageReport {
  const count = results.length;
  const scored = results.filter((r) => r.scoringAvailable && typeof r.quality === "number");
  const qualities = scored.map((r) => r.quality as number);
  const averageQuality =
    scored.length === 0
      ? null
      : Math.round(qualities.reduce((a, b) => a + b, 0) / scored.length);
  const passRate =
    scored.length === 0
      ? null
      : Math.round((scored.filter((r) => r.passed).length / scored.length) * 100);
  const dimensions = results.map((r) => r.dimension);

  const issueCounts = new Map<ErrorDimension, number>();
  for (const r of results) {
    if (r.dimension === "ok" || r.dimension === "unscoreable") continue;
    issueCounts.set(r.dimension, (issueCounts.get(r.dimension) ?? 0) + 1);
  }
  let dominantIssue: ErrorDimension | "ok" = "ok";
  let best = 0;
  for (const [dim, n] of issueCounts) {
    if (n > best) {
      best = n;
      dominantIssue = dim;
    }
  }

  const tip =
    scored.length === 0
      ? `You finished ${count} compare cycles. Listen to the teacher, play your take, and try again — automatic scoring needs a validated provider.`
      : dominantIssue === "ok"
        ? "Across your takes, the sound stayed mostly steady — keep that mouth shape."
        : `Across your takes, the main pattern was ${dominantIssue}. Focus on that next set.`;

  return {
    count,
    averageQuality,
    passRate,
    dominantIssue,
    tip,
    qualities,
    dimensions,
    scoringAvailable: scored.length > 0,
  };
}
