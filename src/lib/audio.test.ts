import { describe, expect, it } from "vitest";
import { resolvePhoneticHintForSpeech } from "./audio";

describe("resolvePhoneticHintForSpeech", () => {
  it("keeps digraph cues for known digraphs", () => {
    expect(resolvePhoneticHintForSpeech("ph")).toMatch(/phở|f/i);
    expect(resolvePhoneticHintForSpeech("ch")).toMatch(/chó|ch/i);
    expect(resolvePhoneticHintForSpeech("ng")).toMatch(/ngỗng|ng/i);
  });

  it("keeps letter cues for look-alike vowels", () => {
    expect(resolvePhoneticHintForSpeech("ă")).toMatch(/breve/i);
    expect(resolvePhoneticHintForSpeech("ơ")).toMatch(/horn/i);
  });

  it("does not invent digraph cues for two-letter syllables like ba / bò", () => {
    expect(resolvePhoneticHintForSpeech("ba")).toBeUndefined();
    expect(resolvePhoneticHintForSpeech("bò")).toBeUndefined();
    expect(resolvePhoneticHintForSpeech("bo")).toBeUndefined();
    expect(resolvePhoneticHintForSpeech("ma")).toBeUndefined();
    expect(resolvePhoneticHintForSpeech("bờ")).toBeUndefined();
  });

  it("honors an explicit phoneticHint override", () => {
    expect(resolvePhoneticHintForSpeech("ba", "custom cue")).toBe("custom cue");
  });
});
