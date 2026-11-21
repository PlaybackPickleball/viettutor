/**
 * Vietnamese pronunciation feedback from Azure only.
 * Never invents accuracy / overall / tone scores.
 */

export type ViAssessStatus =
  | "scored"
  | "unavailable"
  | "silence"
  | "noise"
  | "recognition_failed"
  | "format_unsupported";

export type ViPronunciationFeedback = {
  status: ViAssessStatus;
  scoringAvailable: boolean;
  suitableForAutoGrade: boolean;
  /** Provider PronScore 0–100 when present. */
  overallScore: number | null;
  /** Provider AccuracyScore 0–100 when present. */
  accuracyScore: number | null;
  fluencyScore: number | null;
  recognizedText: string | null;
  tip: string;
  experimentalLabel?: string;
  /** Phase 2 — always null until tone model is validated. */
  toneScore: number | null;
  toneStatus: "not_validated" | "unavailable";
};

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

function clampScore(n: number | null): number | null {
  if (n == null) return null;
  return Math.max(0, Math.min(100, n));
}

type AzureNBest = {
  Display?: string;
  PronunciationAssessment?: {
    AccuracyScore?: number;
    FluencyScore?: number;
    CompletenessScore?: number;
    PronScore?: number;
  };
};

type AzureBody = {
  RecognitionStatus?: string;
  DisplayText?: string;
  NBest?: AzureNBest[];
};

export function feedbackUnavailable(
  tip: string,
  status: ViAssessStatus = "unavailable",
): ViPronunciationFeedback {
  return {
    status,
    scoringAvailable: false,
    suitableForAutoGrade: false,
    overallScore: null,
    accuracyScore: null,
    fluencyScore: null,
    recognizedText: null,
    tip,
    experimentalLabel: "Scoring unavailable",
    toneScore: null,
    toneStatus: "not_validated",
  };
}

export function tipFromScores(overall: number | null, accuracy: number | null): string {
  const score = overall ?? accuracy;
  if (score == null) {
    return "Unable to assess reliably — please try again.";
  }
  if (score >= 80) {
    return "Good pronunciation! Listen once more and keep that mouth shape.";
  }
  if (score >= 60) {
    return "Fairly clear — listen to the native take, then match the vowel length.";
  }
  return "Keep practicing — listen to the native recording, then try again slowly.";
}

/**
 * Parse Azure pronunciation-assessment JSON for vi-VN.
 * If the body has no provider score, do not invent one.
 */
export function fromAzureVietnamese(
  httpOk: boolean,
  body: unknown,
): ViPronunciationFeedback {
  if (!httpOk || !body || typeof body !== "object") {
    return feedbackUnavailable(
      "Unable to assess reliably — the speech service did not return a result.",
      "unavailable",
    );
  }

  const payload = body as AzureBody;
  const status = payload.RecognitionStatus;
  if (status === "InitialSilenceTimeout" || status === "BabbleTimeout") {
    return feedbackUnavailable(
      "Unable to assess reliably — that take was too quiet or noisy. Try again in a quieter place.",
      status === "InitialSilenceTimeout" ? "silence" : "noise",
    );
  }
  if (status !== "Success") {
    return feedbackUnavailable(
      "Unable to assess reliably — please try again.",
      "recognition_failed",
    );
  }

  const best = payload.NBest?.[0];
  const assessment = best?.PronunciationAssessment;
  const overallScore = clampScore(
    asNumber(assessment?.PronScore) ?? asNumber(assessment?.AccuracyScore),
  );
  const accuracyScore = clampScore(asNumber(assessment?.AccuracyScore));
  const fluencyScore = clampScore(asNumber(assessment?.FluencyScore));
  const recognizedText = (best?.Display || payload.DisplayText || "").trim() || null;

  if (overallScore == null && accuracyScore == null) {
    return feedbackUnavailable(
      "Unable to assess reliably — the service returned no score. We will not invent one.",
      "unavailable",
    );
  }

  return {
    status: "scored",
    scoringAvailable: true,
    suitableForAutoGrade: true,
    overallScore: overallScore ?? accuracyScore,
    accuracyScore,
    fluencyScore,
    recognizedText,
    tip: tipFromScores(overallScore, accuracyScore),
    toneScore: null,
    toneStatus: "not_validated",
  };
}
