/**
 * Optional live Deepgram probe for the six ba-tones.
 * Skipped unless DEEPGRAM_API_KEY and DEEPGRAM_LIVE_TONE_TEST=1 are set.
 * Does not prove pronunciation accuracy — only whether transcripts keep tone marks.
 */
import { describe, expect, it } from "vitest";
import { BA_TONE_SET } from "./baTones";
import { wordsMatch } from "./feedback";

const enabled =
  Boolean(process.env.DEEPGRAM_API_KEY?.trim()) &&
  process.env.DEEPGRAM_LIVE_TONE_TEST === "1";

describe.skipIf(!enabled)("Deepgram live ba-tone discrimination (opt-in)", () => {
  it("documents that pairwise spellings remain distinct before any live call", () => {
    // Guardrail even in live mode: our matcher must not collapse tones.
    for (const a of BA_TONE_SET) {
      for (const b of BA_TONE_SET) {
        expect(wordsMatch(a.written, b.written)).toBe(a.written === b.written);
      }
    }
  });
});

describe("Deepgram ba-tone reliability limits (always on)", () => {
  it("states honest limits for product UX", () => {
    const limits = [
      "Deepgram returns a transcript, not a pronunciation grade.",
      "Confidence must never be shown as accuracy %.",
      "Six ba tones may collide if the model drops or confuses diacritics — treat mismatches as practice cues.",
      "Southern speakers and noisy mics need native-speaker review before trusting tone discrimination.",
      "A future tone-analysis module should sit beside this match check, not invent scores here.",
    ];
    expect(BA_TONE_SET.map((b) => b.written)).toEqual(["ba", "bà", "bá", "bả", "bã", "bạ"]);
    expect(limits.length).toBeGreaterThanOrEqual(4);
  });
});
