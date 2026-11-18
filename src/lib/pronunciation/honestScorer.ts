import { assessPronunciation } from "@/lib/services/speechService";
import type { PronunciationScorer, ScoreRequest, ScoreResult } from "./types";

/**
 * Product default: record/replay tips only. Never invents quality scores.
 */
export class HonestCompareScorer implements PronunciationScorer {
  async score(request: ScoreRequest): Promise<ScoreResult> {
    const assessment = await assessPronunciation({
      expectedText: request.grapheme,
      durationMs: request.durationMs,
      lessonId: request.letterId,
      dialect: "southern",
      attemptNumber: request.attemptIndex + 1,
    });

    const tooShort = request.durationMs < 280;
    return {
      simulated: false,
      scoringAvailable: false,
      dimension: tooShort ? "unscoreable" : "ok",
      tip:
        assessment.practiceTip ||
        "Listen to the teacher, play your take, and compare by ear.",
      passed: !tooShort && assessment.provider !== "playback-only",
      quality: null,
      experimentalLabel: assessment.experimentalLabel ?? "Scoring unavailable",
      evidence: tooShort ? "Take was too short to practice." : undefined,
    };
  }
}

export const honestCompareScorer: PronunciationScorer = new HonestCompareScorer();
