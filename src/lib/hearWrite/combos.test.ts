import { describe, expect, it } from "vitest";
import { alphabetPlaybackPathForGrapheme } from "@/lib/alphabetAudio";
import {
  HEAR_WRITE_ITEMS,
  answersMatch,
  graphemeLength,
  itemsForLevel,
} from "./combos";

describe("hear-write combos", () => {
  it("includes notebook digraphs and long rimes", () => {
    const written = new Set(HEAR_WRITE_ITEMS.map((i) => i.written));
    expect(written.has("ch")).toBe(true);
    expect(written.has("ngh")).toBe(true);
    expect(written.has("ươp")).toBe(true);
    expect(written.has("iêng")).toBe(true);
    expect(written.has("a")).toBe(true);
  });

  it("levels by grapheme length", () => {
    expect(graphemeLength("a")).toBe(1);
    expect(graphemeLength("ch")).toBe(2);
    expect(graphemeLength("ang")).toBe(3);
    expect(graphemeLength("iêng")).toBe(4);
    expect(itemsForLevel(1).every((i) => i.level === 1)).toBe(true);
    expect(graphemeLength("ươu")).toBe(3);
    expect(itemsForLevel(4).some((i) => i.written === "iêng")).toBe(true);
  });

  it("matches answers with NFC / case fold", () => {
    expect(answersMatch("Âng", "âng")).toBe(true);
    expect(answersMatch("ch", " ch ")).toBe(true);
    expect(answersMatch("ơi", "oi")).toBe(false);
  });

  it("maps every level-1 letter to an ElevenLabs alphabet clip path", () => {
    const level1 = itemsForLevel(1);
    expect(level1.length).toBeGreaterThan(0);
    for (const item of level1) {
      const path = alphabetPlaybackPathForGrapheme(item.listenText);
      expect(path, item.listenText).toMatch(/^\/audio\/vi\/alphabet\/alphabet_\d{2}_.+\.mp3$/);
    }
  });
});
