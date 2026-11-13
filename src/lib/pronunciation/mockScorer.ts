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
    "Almost there — open your mouth slightly wider and shorten the sound.",
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

/** Varied mock qualities across a 10-take set so averages look realistic. */
const DEMO_SEQUENCE: { dimension: ErrorDimension; quality: number }[] = [
  { dimension: "vowel", quality: 58 },
  { dimension: "timing", quality: 62 },
  { dimension: "ok", quality: 78 },
  { dimension: "vowel", quality: 66 },
  { dimension: "ok", quality: 84 },
  { dimension: "final", quality: 70 },
  { dimension: "ok", quality: 88 },
  { dimension: "tone", quality: 72 },
  { dimension: "ok", quality: 90 },
  { dimension: "ok", quality: 86 },
];

/**
 * Modular mock acoustic diagnosis — separate from any LLM tutoring.
 * Scores each take so a 10-rep set can be averaged. Label Simulated scoring in UI.
 */
export class MockPronunciationScorer implements PronunciationScorer {
  async score(request: ScoreRequest): Promise<ScoreResult> {
    await new Promise((r) => setTimeout(r, 320 + Math.random() * 280));

    if (request.durationMs < 280) {
      return result("unscoreable", false, 35, request.attemptIndex, "Recording was very short.");
    }
    if (request.durationMs > 4500) {
      return result("timing", false, 48, request.attemptIndex, "Recording ran long.");
    }

    const step = DEMO_SEQUENCE[request.attemptIndex % DEMO_SEQUENCE.length];
    const jitter = Math.round((Math.random() - 0.5) * 6);
    const quality = Math.max(30, Math.min(98, step.quality + jitter));
    const passed = step.dimension === "ok" && quality >= 75;
    return result(step.dimension, passed || step.dimension === "ok", quality, request.attemptIndex);
  }
}

function result(
  dimension: ErrorDimension,
  passed: boolean,
  quality: number,
  attemptIndex: number,
  evidence?: string,
): ScoreResult {
  if (dimension === "ok") {
    return {
      simulated: true,
      dimension,
      tip: OK_TIPS[attemptIndex % OK_TIPS.length],
      passed: true,
      quality,
      evidence: evidence ?? "Mock acoustic check: within expected range.",
    };
  }
  const pool = TIPS[dimension];
  return {
    simulated: true,
    dimension,
    tip: pool[attemptIndex % pool.length],
    passed,
    quality,
    evidence,
  };
}

export const pronunciationScorer: PronunciationScorer =
  new MockPronunciationScorer();
