import type { SpeechAssessmentRequest, SpeechAssessmentResult } from "./types";

/**
 * Modular speech assessment (server or client without audio upload).
 * Prefer /api/vi/assess (Deepgram transcription match) when a recording blob is available.
 * Never invents phoneme/tone/accuracy scores.
 */
export async function assessPronunciation(
  req: SpeechAssessmentRequest,
): Promise<SpeechAssessmentResult> {
  if (req.durationMs < 250) {
    return {
      provider: "playback-only",
      scoringAvailable: false,
      suitableForAutoGrade: false,
      practiceTip: "That take was too short — say the word clearly, then pause.",
    };
  }

  const deepgramKey = process.env.DEEPGRAM_API_KEY;

  if (deepgramKey && typeof window === "undefined") {
    return {
      provider: "unavailable",
      scoringAvailable: false,
      suitableForAutoGrade: false,
      practiceTip:
        "Deepgram is configured on the server. Submit a recording through /api/vi/assess for Vietnamese transcription match (not a pronunciation score).",
      experimentalLabel: "Use assess API with audio",
    };
  }

  return {
    provider: "unavailable",
    scoringAvailable: false,
    suitableForAutoGrade: false,
    practiceTip:
      "Listen to the reference, compare your recording, and try again. Automatic checks need Deepgram transcription — we will not invent a pronunciation score.",
    experimentalLabel: "Scoring unavailable",
  };
}
