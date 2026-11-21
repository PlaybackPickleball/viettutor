import { describe, expect, it } from "vitest";
import {
  feedbackUnavailable,
  fromAzureVietnamese,
  tipFromScores,
} from "./feedback";
import { analyzeToneExperimental } from "./toneExperimental";

describe("Vietnamese pronunciation feedback", () => {
  it("never invents scores when Azure fails", () => {
    const missing = fromAzureVietnamese(false, null);
    expect(missing.scoringAvailable).toBe(false);
    expect(missing.overallScore).toBeNull();
    expect(missing.accuracyScore).toBeNull();
    expect(missing.toneScore).toBeNull();
    expect(missing.tip).toMatch(/Unable to assess reliably/i);

    const silence = fromAzureVietnamese(true, {
      RecognitionStatus: "InitialSilenceTimeout",
    });
    expect(silence.status).toBe("silence");
    expect(silence.overallScore).toBeNull();

    const noise = fromAzureVietnamese(true, { RecognitionStatus: "BabbleTimeout" });
    expect(noise.status).toBe("noise");
    expect(noise.overallScore).toBeNull();
  });

  it("copies provider PronScore and AccuracyScore only when present", () => {
    const scored = fromAzureVietnamese(true, {
      RecognitionStatus: "Success",
      DisplayText: "ba",
      NBest: [
        {
          Display: "ba",
          PronunciationAssessment: {
            PronScore: 82,
            AccuracyScore: 79,
            FluencyScore: 85,
          },
        },
      ],
    });
    expect(scored.status).toBe("scored");
    expect(scored.scoringAvailable).toBe(true);
    expect(scored.overallScore).toBe(82);
    expect(scored.accuracyScore).toBe(79);
    expect(scored.fluencyScore).toBe(85);
    expect(scored.recognizedText).toBe("ba");
    expect(scored.toneScore).toBeNull();
    expect(scored.toneStatus).toBe("not_validated");
  });

  it("withholds a score when Success has no PronunciationAssessment numbers", () => {
    const empty = fromAzureVietnamese(true, {
      RecognitionStatus: "Success",
      NBest: [{ Display: "ba" }],
    });
    expect(empty.scoringAvailable).toBe(false);
    expect(empty.overallScore).toBeNull();
    expect(empty.tip).toMatch(/will not invent/i);
  });

  it("keeps tone experimental until validated", () => {
    const tone = analyzeToneExperimental({
      expectedText: "bò",
      dialect: "southern",
    });
    expect(tone.toneScore).toBeNull();
    expect(tone.status).toBe("not_validated");
  });

  it("builds tips from real scores only", () => {
    expect(tipFromScores(null, null)).toMatch(/Unable to assess reliably/i);
    expect(tipFromScores(85, 80)).toMatch(/Good pronunciation/i);
    expect(tipFromScores(65, 60)).toMatch(/Fairly clear/i);
    expect(feedbackUnavailable("x").experimentalLabel).toBe("Scoring unavailable");
  });
});
