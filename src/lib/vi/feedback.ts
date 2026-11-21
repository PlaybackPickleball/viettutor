/**
 * Vietnamese speech feedback from Deepgram transcription vs expected text.
 * Never invents pronunciation / tone / accuracy numerical scores.
 * Transcription confidence is never presented as pronunciation accuracy.
 */

export type ViAssessStatus =
  | "match"
  | "mismatch"
  | "unavailable"
  | "silence"
  | "noise"
  | "recognition_failed"
  | "format_unsupported"
  | "low_confidence";

export type ViPronunciationFeedback = {
  status: ViAssessStatus;
  provider: "deepgram" | "none";
  /** Always false — we do not claim pronunciation accuracy scores. */
  scoringAvailable: false;
  suitableForAutoGrade: boolean;
  /** Always null — not a pronunciation score. */
  overallScore: null;
  /** Always null — not a pronunciation score. */
  accuracyScore: null;
  fluencyScore: null;
  /** Exact expected reference (diacritics preserved). */
  expectedText: string | null;
  recognizedText: string | null;
  /** Word match after NFC + Vietnamese lowercasing (diacritics kept). */
  match: boolean | null;
  tip: string;
  experimentalLabel?: string;
  /** Always null until a specialized tone model is validated. */
  toneScore: null;
  toneStatus: "not_validated" | "unavailable";
};

/** NFC + vi locale lower — keeps tone marks; strips outer whitespace. */
export function normalizeViWord(raw: string): string {
  return raw.normalize("NFC").trim().toLocaleLowerCase("vi");
}

/** First whitespace-separated token (Deepgram may return a short phrase). */
export function primaryViToken(raw: string): string {
  const normalized = normalizeViWord(raw);
  if (!normalized) return "";
  return normalized.split(/\s+/)[0] ?? "";
}

export function wordsMatch(expected: string, recognized: string): boolean {
  const a = primaryViToken(expected);
  const b = primaryViToken(recognized);
  if (!a || !b) return false;
  return a === b;
}

export function feedbackUnavailable(
  tip: string,
  status: ViAssessStatus = "unavailable",
  expectedText: string | null = null,
): ViPronunciationFeedback {
  return {
    status,
    provider: "none",
    scoringAvailable: false,
    suitableForAutoGrade: false,
    overallScore: null,
    accuracyScore: null,
    fluencyScore: null,
    expectedText,
    recognizedText: null,
    match: null,
    tip,
    experimentalLabel: "Transcription unavailable",
    toneScore: null,
    toneStatus: "not_validated",
  };
}

export function tipFromMatch(matched: boolean, expected: string, recognized: string): string {
  if (matched) {
    return `Match — heard “${recognized}” for “${expected}”. Listen once more to lock the tone.`;
  }
  return `No match — expected “${expected}”, heard “${recognized}”. Play the native take, then try again.`;
}

/**
 * Build feedback from a Deepgram transcript.
 * Low confidence → unreliable (no match claim). Confidence is never a score.
 */
export function fromDeepgramTranscript(args: {
  expected: string;
  httpOk: boolean;
  transcript: string | null;
  confidence: number | null;
}): ViPronunciationFeedback {
  const expected = args.expected.trim();
  if (!args.httpOk) {
    return feedbackUnavailable(
      "Unable to assess reliably — the speech service did not return a result.",
      "unavailable",
      expected,
    );
  }

  const recognized = args.transcript?.trim() || null;
  if (!recognized) {
    return feedbackUnavailable(
      "Unable to assess reliably — that take was too quiet or unclear. Try again.",
      "silence",
      expected,
    );
  }

  // Gate only: do not show confidence as accuracy. Very low → withhold match.
  if (args.confidence != null && args.confidence < 0.35) {
    return {
      status: "low_confidence",
      provider: "deepgram",
      scoringAvailable: false,
      suitableForAutoGrade: false,
      overallScore: null,
      accuracyScore: null,
      fluencyScore: null,
      expectedText: expected,
      recognizedText: recognized,
      match: null,
      tip: "Unable to assess reliably — please try again (clearer, closer to the mic).",
      experimentalLabel: "Low transcription confidence (not a pronunciation score)",
      toneScore: null,
      toneStatus: "not_validated",
    };
  }

  const matched = wordsMatch(expected, recognized);
  return {
    status: matched ? "match" : "mismatch",
    provider: "deepgram",
    scoringAvailable: false,
    suitableForAutoGrade: matched,
    overallScore: null,
    accuracyScore: null,
    fluencyScore: null,
    expectedText: expected,
    recognizedText: primaryViToken(recognized) || recognized,
    match: matched,
    tip: tipFromMatch(matched, primaryViToken(expected) || expected, primaryViToken(recognized) || recognized),
    experimentalLabel: "Deepgram transcription match (not a pronunciation score)",
    toneScore: null,
    toneStatus: "not_validated",
  };
}
