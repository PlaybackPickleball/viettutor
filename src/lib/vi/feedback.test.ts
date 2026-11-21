import { describe, expect, it } from "vitest";
import {
  fromDeepgramTranscript,
  normalizeViWord,
  primaryViToken,
  tipFromMatch,
  wordsMatch,
} from "./feedback";
import { analyzeToneExperimental } from "./toneExperimental";
import { BA_TONE_SET } from "./baTones";

describe("Vietnamese Deepgram match feedback", () => {
  it("preserves diacritics when normalizing and matching", () => {
    expect(normalizeViWord("  Bá ")).toBe("bá");
    expect(wordsMatch("bá", "Bá")).toBe(true);
    expect(wordsMatch("ba", "bà")).toBe(false);
    expect(wordsMatch("bả", "bã")).toBe(false);
    expect(primaryViToken("bá nhé")).toBe("bá");
  });

  it("treats the six ba-tone spellings as pairwise distinct", () => {
    for (let i = 0; i < BA_TONE_SET.length; i++) {
      for (let j = 0; j < BA_TONE_SET.length; j++) {
        const a = BA_TONE_SET[i]!.written;
        const b = BA_TONE_SET[j]!.written;
        expect(wordsMatch(a, b), `${a} vs ${b}`).toBe(i === j);
      }
    }
  });

  it("never invents numerical pronunciation scores from a transcript", () => {
    const matched = fromDeepgramTranscript({
      expected: "bá",
      httpOk: true,
      transcript: "bá",
      confidence: 0.92,
    });
    expect(matched.status).toBe("match");
    expect(matched.match).toBe(true);
    expect(matched.scoringAvailable).toBe(false);
    expect(matched.overallScore).toBeNull();
    expect(matched.accuracyScore).toBeNull();
    expect(matched.toneScore).toBeNull();
    expect(matched.tip).not.toMatch(/\b\d{1,3}\b/);

    const miss = fromDeepgramTranscript({
      expected: "ba",
      httpOk: true,
      transcript: "bà",
      confidence: 0.88,
    });
    expect(miss.status).toBe("mismatch");
    expect(miss.match).toBe(false);
    expect(miss.overallScore).toBeNull();
  });

  it("withholds a match claim when confidence is very low (not a score)", () => {
    const low = fromDeepgramTranscript({
      expected: "ba",
      httpOk: true,
      transcript: "ba",
      confidence: 0.2,
    });
    expect(low.status).toBe("low_confidence");
    expect(low.match).toBeNull();
    expect(low.scoringAvailable).toBe(false);
    expect(low.tip).toMatch(/Unable to assess reliably/i);
  });

  it("handles silence / empty transcript without inventing a match", () => {
    const empty = fromDeepgramTranscript({
      expected: "ba",
      httpOk: true,
      transcript: null,
      confidence: null,
    });
    expect(empty.status).toBe("silence");
    expect(empty.match).toBeNull();
    expect(empty.recognizedText).toBeNull();
  });

  it("keeps tone experimental until validated", () => {
    const tone = analyzeToneExperimental({
      expectedText: "bò",
      dialect: "southern",
    });
    expect(tone.toneScore).toBeNull();
    expect(tone.status).toBe("not_validated");
  });

  it("builds tips from match only", () => {
    expect(tipFromMatch(true, "ba", "ba")).toMatch(/Match/i);
    expect(tipFromMatch(false, "ba", "bà")).toMatch(/No match/i);
  });
});
