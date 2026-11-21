/**
 * Phase 2 — experimental Vietnamese tone analysis (Southern-first).
 * Not validated for numerical scores. Never invents tone grades.
 */

export type ToneAnalysisResult = {
  status: "not_validated" | "unavailable" | "unreliable";
  toneScore: null;
  tip: string;
  experimentalLabel: string;
};

/**
 * Placeholder for F0 contour extract → normalize → align → compare.
 * Until native-speaker validation, always withhold numerical tone scores.
 */
export function analyzeToneExperimental(_args: {
  referenceAudio?: ArrayBuffer;
  studentAudio?: ArrayBuffer;
  expectedText: string;
  dialect: "southern" | "northern";
}): ToneAnalysisResult {
  return {
    status: "not_validated",
    toneScore: null,
    tip: "Tone contour analysis is experimental and not shown as a score yet.",
    experimentalLabel: "Tone assessment pending validation",
  };
}
