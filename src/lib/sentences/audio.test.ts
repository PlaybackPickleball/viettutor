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
  it("enables lesson 1–2 clips (orders 1–20)", () => {
    expect(SENTENCE_NATIVE_AUDIO_ENABLED).toBe(true);
    for (let i = 1; i <= 20; i++) {
      expect(sentenceHasNativeClip(i)).toBe(true);
      expect(sentenceNativePathForOrder(i)).toBe(
        `/audio/vi/sentences/sentence_${String(i).padStart(3, "0")}.mp3?v=${SENTENCE_AUDIO_CACHE_VERSION}`,
      );
    }
    expect(sentenceHasNativeClip(21)).toBe(false);
    expect(sentenceNativePathForOrder(21)).toBeNull();
    expect(sentenceNativePathForId("sentence_011")).toContain("sentence_011.mp3");
    expect(sentenceNativePathForId("sentence_050")).toBeNull();
  });

  it("marks curriculum audioMode native for lessons 1–2 only", () => {
    for (const s of listEssentialSentences()) {
      if (s.lessonId === "s-l01" || s.lessonId === "s-l02") {
        expect(s.audioMode).toBe("native");
      } else {
        expect(s.audioMode).toBe("tts_temporary");
      }
    }
    expect(getEssentialSentence("sentence_011")?.vi).toBe("Tôi không hiểu.");
  });
});
