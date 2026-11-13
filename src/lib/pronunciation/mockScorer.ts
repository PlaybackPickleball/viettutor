import type {
  ErrorDimension,
  PronunciationScorer,
  ScoreRequest,
  ScoreResult,
} from "./types";

const TIPS: Record<Exclude<ErrorDimension, "ok">, string[]> = {
  tone: [
    "Your voice dropped too early — keep the pitch steady to the end.",
    "Lift a little at the end — this sound stays level in Southern speech.",
  ],
  vowel: [
    "The middle sound was too closed — open your mouth a bit more.",
    "That vowel was a little off — match the teacher’s mouth shape, not English.",
  ],
  final: [
    "The ending was cut short — finish the sound cleanly.",
    "Don’t swallow the last bit — let the sound land gently.",
  ],
  timing: [
    "Too short — hold the sound a little longer, like the teacher.",
    "Slow down just a touch — give the vowel time to bloom.",
  ],
  unscoreable: [
    "I couldn’t hear clearly — try again in a quieter spot.",
    "The recording was too soft or clipped — hold the mic closer and try once more.",
  ],
};

const OK_TIPS = [
  "Clear and steady — that matches the teacher’s model.",
  "Nice work — your mouth shape and timing lined up.",
];

/**
 * Modular mock acoustic diagnosis — separate from any LLM tutoring.
 * Demo-friendly: first attempt shows a why-wrong cue; later attempts pass
 * so Write unlocks after one solid take (see MASTERY_SAY_STREAK).
 * UI must label Simulated scoring.
 */
export class MockPronunciationScorer implements PronunciationScorer {
  async score(request: ScoreRequest): Promise<ScoreResult> {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));

    if (request.durationMs < 280) {
      return result("unscoreable", false, request.attemptIndex, "Recording was very short.");
    }
    if (request.durationMs > 4500) {
      return result("timing", false, request.attemptIndex, "Recording ran long.");
    }

    // First scored take → actionable tip; next takes → pass for mastery.
    if (request.attemptIndex === 0) {
      return result("vowel", false, request.attemptIndex);
    }
    return result("ok", true, request.attemptIndex);
  }
}

function result(
  dimension: ErrorDimension,
  passed: boolean,
  attemptIndex: number,
  evidence?: string,
): ScoreResult {
  if (dimension === "ok") {
    return {
      simulated: true,
      dimension,
      tip: OK_TIPS[attemptIndex % OK_TIPS.length],
      passed: true,
      evidence: evidence ?? "Mock acoustic check: within expected range.",
    };
  }
  const pool = TIPS[dimension];
  return {
    simulated: true,
    dimension,
    tip: pool[attemptIndex % pool.length],
    passed,
    evidence,
  };
}

export const pronunciationScorer: PronunciationScorer =
  new MockPronunciationScorer();
