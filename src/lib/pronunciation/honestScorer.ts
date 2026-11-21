import { assessVietnamesePronunciation } from "@/lib/vi/assessClient";
import { recordPronunciationAttempt } from "@/lib/vi/assessmentProgress";
import { assessPronunciation } from "@/lib/services/speechService";
import type { PronunciationScorer, ScoreRequest, ScoreResult } from "./types";

/**
 * Product default: Deepgram transcription match when audio + key exist.
 * Never invents pronunciation quality scores.
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
        accuracyScore: null,
        overallScore: null,
        toneScore: null,
        match: feedback.match,
        recognizedText: feedback.recognizedText,
        status: feedback.status,
      });

      return {
        simulated: false,
        // Never claim a 0–100 pronunciation score from transcription.
        scoringAvailable: false,
        dimension: feedback.match === true ? "ok" : "unscoreable",
        tip: feedback.tip,
        passed: !tooShort && feedback.match !== false,
        quality: null,
        accuracyScore: null,
        experimentalLabel: feedback.experimentalLabel,
        toneScore: null,
        assessStatus: feedback.status,
        evidence:
          feedback.recognizedText != null
            ? `Heard: ${feedback.recognizedText}${
                feedback.match == null
                  ? ""
                  : feedback.match
                    ? " · match"
                    : " · no match"
              }`
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
