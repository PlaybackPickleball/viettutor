import type { SpeechAssessmentRequest, SpeechAssessmentResult } from "./types";

/**
 * Modular pronunciation assessment (server or client without audio upload).
 * Prefer /api/vi/assess from the browser when a recording blob is available.
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

  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;

  if (azureKey && azureRegion && typeof window === "undefined") {
    return {
      provider: "azure",
      scoringAvailable: false,
      suitableForAutoGrade: false,
      practiceTip:
        "Azure Speech is configured on the server. Submit a recording through /api/vi/assess for vi-VN Pronunciation Assessment scores.",
      experimentalLabel: "Use assess API with audio",
    };
  }

  return {
    provider: "unavailable",
    scoringAvailable: false,
    suitableForAutoGrade: false,
    practiceTip:
      "Listen to the reference, compare your recording, and try again. Automatic scoring needs Azure Speech (vi-VN) — we will not invent a score.",
    experimentalLabel: "Scoring unavailable",
  };
}
