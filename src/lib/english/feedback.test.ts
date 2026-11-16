import { describe, expect, it } from "vitest";
import {
  assessFromTranscript,
  feedbackFromServiceFailure,
  fromAzure,
  resolveEnglishAssessment,
} from "./feedback";
import { reduceRecording, recordUnlocked } from "./recording";
import { dueReviews, emptyEnglishProgress, recordAttempt, scheduleReview, summarizeAttempts, upsertReview } from "./progress";

describe("honest English feedback", () => {
  it("does not turn a transcript into a pronunciation score", () => {
    const heard = assessFromTranscript("Hello", "hello");
    expect(heard.providerScore).toBeNull();
    expect(heard.phonemeScoringAvailable).toBe(false);
    expect(heard.category).toBe("very_good");
    expect(heard.categoryLabel).toBe("Rất tốt");
    expect(heard.observationVi).toMatch(/không phải điểm từng âm/);
    expect(JSON.stringify(heard)).not.toMatch(/accuracyScore|fluencyScore|pronunciationScore/);

    const partial = assessFromTranscript("How much is it", "how much is");
    expect(partial.category).toBe("fairly_good");
    expect(partial.providerScore).toBeNull();

    const weak = assessFromTranscript("Can you help me", "hello");
    expect(weak.category).toBe("needs_practice");
    expect(weak.allowPraise).toBe(false);
  });

  it("withholds praise when recognition or the service fails", () => {
    for (const heard of [null, "", "   "]) {
      const result = assessFromTranscript("Hello", heard);
      expect(result.failed).toBe(true);
      expect(result.category).toBeNull();
      expect(result.allowPraise).toBe(false);
      expect(result.providerScore).toBeNull();
    }
    const failure = feedbackFromServiceFailure();
    expect(failure.failed).toBe(true);
    expect(failure.allowPraise).toBe(false);
    expect(failure.categoryLabel).toBeNull();
  });

  it("uses provider phonemes only when the payload includes them", async () => {
    const scored = fromAzure("Hello", true, {
      RecognitionStatus: "Success",
      NBest: [
        {
          Display: "Hello",
          PronunciationAssessment: { PronScore: 86, AccuracyScore: 88 },
          Words: [
            {
              Word: "hello",
              Phonemes: [
                { Phoneme: "h", PronunciationAssessment: { AccuracyScore: 90 } },
                { Phoneme: "oʊ", PronunciationAssessment: { AccuracyScore: 54 } },
              ],
            },
          ],
        },
      ],
    });
    expect(scored.phonemeScoringAvailable).toBe(true);
    expect(scored.providerScore).toBe(86);
    expect(scored.category).toBe("very_good");
    expect(scored.observationVi).toMatch(/oʊ/);

    const noPhoneme = fromAzure("Hello", true, {
      RecognitionStatus: "Success",
      NBest: [
        {
          Display: "Hello",
          PronunciationAssessment: { AccuracyScore: 70 },
          Words: [{ Word: "Hello" }],
        },
      ],
    });
    expect(noPhoneme.phonemeScoringAvailable).toBe(false);
    expect(noPhoneme.category).toBe("fairly_good");
    expect(noPhoneme.observationVi).toMatch(/chưa có điểm từng âm/);

    const down = await resolveEnglishAssessment({
      expected: "Hello",
      transcript: "hello",
      mime: "audio/wav",
      phonemeConfigured: true,
      callProvider: async () => {
        throw new Error("network");
      },
    });
    expect(down.phonemeScoringAvailable).toBe(false);
    expect(down.providerScore).toBeNull();
    expect(down.observationVi).toMatch(/bị lỗi/);
    expect(down.category).toBe("very_good");

    const noTranscript = await resolveEnglishAssessment({
      expected: "Hello",
      transcript: null,
      mime: "audio/webm",
      phonemeConfigured: true,
    });
    expect(noTranscript.failed).toBe(true);
    expect(noTranscript.allowPraise).toBe(false);
    expect(noTranscript.providerScore).toBeNull();
  });
});

describe("recording states", () => {
  it("moves through permission, speech, and failure without a timer", () => {
    expect(recordUnlocked(false)).toBe(false);
    expect(recordUnlocked(true)).toBe(true);
    let phase = reduceRecording("idle", { type: "ask" });
    expect(phase).toBe("requesting");
    phase = reduceRecording(phase, { type: "denied" });
    expect(phase).toBe("denied");
    phase = reduceRecording(phase, { type: "use_listen_only" });
    expect(phase).toBe("listening_only");

    phase = reduceRecording("recording", { type: "no_speech" });
    expect(phase).toBe("no_speech");
    phase = reduceRecording("recording", { type: "captured" });
    phase = reduceRecording(phase, { type: "assess_failed" });
    expect(phase).toBe("service_failed");
    phase = reduceRecording("assessing", { type: "assessed" });
    expect(phase).toBe("result");
  });
});

describe("review schedule", () => {
  it("keeps missed items due soon and does not average the speaking check", () => {
    const today = "2026-11-15";
    let progress = emptyEnglishProgress();
    progress.dailyMinutes = 10;
    progress = upsertReview(
      progress,
      { en: "Hello", vi: "Xin chào", lessonId: "d01", category: "needs_practice" },
      today,
    );
    expect(progress.review[0].due).toBe("2026-11-16");
    expect(dueReviews(progress, today)).toHaveLength(0);
    expect(dueReviews(progress, "2026-11-16")).toHaveLength(1);

    const good = scheduleReview(progress.review[0], "very_good", "2026-11-16");
    expect(good.due > "2026-11-16").toBe(true);

    progress = recordAttempt(progress, {
      lessonId: "d30",
      phrase: "Hello",
      source: "none",
      category: null,
      failed: true,
      phonemeScoringAvailable: false,
      observationVi: "Không chấm được",
      recognizedText: null,
    });
    progress = recordAttempt(progress, {
      lessonId: "d30",
      phrase: "Thank you.",
      source: "transcript",
      category: "very_good",
      failed: false,
      phonemeScoringAvailable: false,
      observationVi: "Nghe đủ các từ",
      recognizedText: "thank you",
    });
    const summary = summarizeAttempts(progress.attempts, ["Hello", "Thank you."]);
    expect(summary).toEqual([
      { phrase: "Hello", label: "Chưa chấm được" },
      { phrase: "Thank you.", label: "Rất tốt" },
    ]);
    expect(summary).not.toHaveProperty("average");
  });
});
