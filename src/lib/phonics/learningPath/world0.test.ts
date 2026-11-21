import { describe, expect, it } from "vitest";
import { AUDIO_ASSETS } from "./audioAssets";
import { getPathLesson, getSyllable } from "./index";
import { resolveStepRole } from "./exerciseBuilders";

describe("Đánh Vần 2.0 Foundations (w0)", () => {
  it("authors bo and bò syllables with Southern sequences", () => {
    const bo = getSyllable("bo");
    const boHuyen = getSyllable("bo-huyen");
    expect(bo?.written).toBe("bo");
    expect(bo?.tone).toBe("ngang");
    expect(boHuyen?.written).toBe("bò");
    expect(boHuyen?.tone).toBe("huyen");
    expect(boHuyen?.vocab?.glossEn.toLowerCase()).toContain("cow");
  });

  it("registers pilot audio asset IDs as TTS placeholders", () => {
    for (const id of [
      "vi.south.vowel.a",
      "vi.south.letter.b",
      "vi.south.syllable.ba",
      "vi.south.vowel.o",
      "vi.south.syllable.bo",
      "vi.south.syllable.bo-huyen",
    ]) {
      expect(AUDIO_ASSETS[id]?.status).toBe("tts-placeholder");
      expect(AUDIO_ASSETS[id]?.utterance.length).toBeGreaterThan(0);
    }
  });

  it("maps pilot exercises onto HEAR→…→REVIEW roles", () => {
    const lesson = getPathLesson("w0-l01");
    expect(lesson).toBeTruthy();
    const roles = lesson!.exercises.map((e) => resolveStepRole(e));
    expect(roles).toContain("hear");
    expect(roles).toContain("repeat");
    expect(roles).toContain("write");
    expect(roles).toContain("review");
  });

  it("attaches audio asset ids on Foundations hear/speak steps", () => {
    const l2 = getPathLesson("w0-l02");
    const hear = l2?.exercises.find((e) => e.type === "hear-sound");
    expect(hear?.audioAssetId).toBe("vi.south.letter.b");
    const blend = l2?.exercises.find((e) => e.type === "build-syllable");
    expect(blend?.targetWritten).toBe("ba");
  });
});
