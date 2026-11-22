import { describe, expect, it } from "vitest";
import {
  SENTENCE_AUDIO_CACHE_VERSION,
  SENTENCE_NATIVE_AUDIO_ENABLED,
  sentenceHasNativeClip,
  sentenceNativePathForId,
  sentenceNativePathForOrder,
} from "./audio";
import { getEssentialSentence, listEssentialSentences } from "./catalog";

describe("essential sentence native audio", () => {
  it("enables lesson 1 clips only", () => {
    expect(SENTENCE_NATIVE_AUDIO_ENABLED).toBe(true);
    for (let i = 1; i <= 10; i++) {
      expect(sentenceHasNativeClip(i)).toBe(true);
      expect(sentenceNativePathForOrder(i)).toBe(
        `/audio/vi/sentences/sentence_${String(i).padStart(3, "0")}.mp3?v=${SENTENCE_AUDIO_CACHE_VERSION}`,
      );
    }
    expect(sentenceHasNativeClip(11)).toBe(false);
    expect(sentenceNativePathForOrder(11)).toBeNull();
    expect(sentenceNativePathForId("sentence_001")).toContain("sentence_001.mp3");
    expect(sentenceNativePathForId("sentence_050")).toBeNull();
  });

  it("marks curriculum audioMode native for lesson 1 only", () => {
    for (const s of listEssentialSentences()) {
      if (s.lessonId === "s-l01") {
        expect(s.audioMode).toBe("native");
      } else {
        expect(s.audioMode).toBe("tts_temporary");
      }
    }
    expect(getEssentialSentence("sentence_001")?.vi).toBe("Xin chào.");
  });
});
