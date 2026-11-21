import { assessVietnamesePronunciation } from "@/lib/vi/assessClient";
import { recordPronunciationAttempt } from "@/lib/vi/assessmentProgress";
import { assessPronunciation } from "@/lib/services/speechService";
import type { PronunciationScorer, ScoreRequest, ScoreResult } from "./types";

/**
 * Product default: Azure vi-VN when audio + keys exist; else compare/replay tips.
 * Never invents quality scores.
 */
export class HonestCompareScorer implements PronunciationScorer {
  async score(request: ScoreRequest): Promise<ScoreResult> {
    const tooShort = request.durationMs < 280;
    const expected = (request.expectedText ?? request.grapheme).trim();

    if (request.audioBlob && request.audioBlob.size > 400 && !tooShort) {
      const feedback = await assessVietnamesePronunciation({
        expected,
        mime: request.mime || request.audioBlob.type || "audio/webm",
        audio: request.audioBlob,
        itemId: request.letterId,
        dialect: request.dialect ?? "southern",
      });

      recordPronunciationAttempt({
        itemId: request.letterId,
        expectedText: expected,
        dialect: request.dialect ?? "southern",
        accuracyScore: feedback.accuracyScore,
        overallScore: feedback.overallScore,
        toneScore: feedback.toneScore,
        status: feedback.status,
      });

      const quality = feedback.scoringAvailable
        ? (feedback.overallScore ?? feedback.accuracyScore)
        : null;

      return {
        simulated: false,
        scoringAvailable: feedback.scoringAvailable && quality != null,
        dimension: feedback.status === "scored" ? "ok" : "unscoreable",
        tip: feedback.tip,
        passed: !tooShort && (feedback.status === "scored" ? (quality ?? 0) >= 60 : true),
        quality,
        accuracyScore: feedback.accuracyScore,
        experimentalLabel: feedback.experimentalLabel,
        toneScore: null,
        assessStatus: feedback.status,
        evidence:
          feedback.recognizedText != null
            ? `Heard: ${feedback.recognizedText}`
            : undefined,
      };
    }

    const assessment = await assessPronunciation({
      expectedText: expected,
      durationMs: request.durationMs,
      lessonId: request.letterId,
      dialect: request.dialect ?? "southern",
      attemptNumber: request.attemptIndex + 1,
    });

    return {
      simulated: false,
      scoringAvailable: false,
      dimension: tooShort ? "unscoreable" : "ok",
      tip:
        assessment.practiceTip ||
        "Listen to the teacher, play your take, and compare by ear.",
      passed: !tooShort && assessment.provider !== "playback-only",
      quality: null,
      accuracyScore: null,
      experimentalLabel: assessment.experimentalLabel ?? "Scoring unavailable",
      toneScore: null,
      evidence: tooShort ? "Take was too short to practice." : undefined,
    };
  }
}

export const honestCompareScorer: PronunciationScorer = new HonestCompareScorer();
