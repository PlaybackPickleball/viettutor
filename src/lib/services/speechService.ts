import type { SpeechAssessmentRequest, SpeechAssessmentResult } from "./types";

/**
 * Modular pronunciation assessment.
 * Phase 1: recording + playback only unless Azure is configured.
 * Never invents phoneme/tone/accuracy scores.
 */
export async function assessPronunciation(
  req: SpeechAssessmentRequest,
): Promise<SpeechAssessmentResult> {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;

  if (azureKey && azureRegion && typeof window === "undefined") {
    // Phase 2 hook — provider wiring lives server-side only
    return {
      provider: "azure",
      scoringAvailable: false,
      suitableForAutoGrade: false,
      practiceTip:
        "Azure Speech keys are present, but Pronunciation Assessment for vi-VN is not enabled in this build yet. Recording and playback still work.",
      experimentalLabel: "Assessment pending provider validation",
    };
  }

  if (req.durationMs < 250) {
    return {
      provider: "playback-only",
      scoringAvailable: false,
      suitableForAutoGrade: false,
      practiceTip: "That take was too short — say the word clearly, then pause.",
    };
  }

  return {
    provider: "unavailable",
    scoringAvailable: false,
    suitableForAutoGrade: false,
    practiceTip:
      "Listen to the reference, compare your recording, and try again. Automatic scoring needs a validated speech provider (Azure vi-VN) — we will not invent a score.",
    experimentalLabel: "Scoring unavailable",
  };
}
