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
  /** 0–100 quality for averaging across the 10-take set */
  quality: number;
  /** Optional light evidence note */
  evidence?: string;
};

export type AverageReport = {
  count: number;
  averageQuality: number;
  passRate: number;
  dominantIssue: ErrorDimension | "ok";
  tip: string;
  qualities: number[];
  dimensions: ErrorDimension[];
};

export interface PronunciationScorer {
  score(request: ScoreRequest): Promise<ScoreResult>;
}

export function averageScores(results: ScoreResult[]): AverageReport {
  const count = results.length;
  const qualities = results.map((r) => r.quality);
  const averageQuality =
    count === 0 ? 0 : Math.round(qualities.reduce((a, b) => a + b, 0) / count);
  const passRate =
    count === 0 ? 0 : Math.round((results.filter((r) => r.passed).length / count) * 100);
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
    dominantIssue === "ok"
      ? "Across your 10 takes, the sound stayed mostly steady — keep that mouth shape."
      : `Across your 10 takes, the main pattern was ${dominantIssue}. Focus on that next set.`;

  return { count, averageQuality, passRate, dominantIssue, tip, qualities, dimensions };
}
