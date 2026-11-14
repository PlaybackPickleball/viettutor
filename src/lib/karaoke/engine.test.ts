import { describe, expect, it } from "vitest";
import { XIN_CHAO_BILINGUAL } from "./fixtures/xin-chao-bilingual";
import { activeFill, findTokenAtMs, phraseGlosses } from "./engine";
import { wordFillProgress } from "./types";

describe("bilingual karaoke engine", () => {
  it("computes progressive word fill", () => {
    expect(wordFillProgress(0, 0, 1000)).toBe(0);
    expect(wordFillProgress(500, 0, 1000)).toBe(0.5);
    expect(wordFillProgress(1000, 0, 1000)).toBe(1);
    expect(wordFillProgress(-10, 0, 1000)).toBe(0);
  });

  it("finds tokens by millisecond clock", () => {
    const hit = findTokenAtMs(XIN_CHAO_BILINGUAL.lines, 4000);
    expect(hit?.token.text).toBe("tiếng");
  });

  it("groups phrase glosses for tiếng Việt", () => {
    const line = XIN_CHAO_BILINGUAL.lines[1];
    const glosses = phraseGlosses(line);
    const phrase = glosses.find((g) => g.id === "pg-tieng-viet");
    expect(phrase?.textEn).toBe("Vietnamese language");
    expect(phrase?.tokenIds).toEqual(["t7", "t8"]);
  });

  it("returns active fill for the fixture", () => {
    const fill = activeFill(XIN_CHAO_BILINGUAL, 800);
    expect(fill.token?.text).toBe("chào");
    expect(fill.progress).toBeGreaterThan(0);
    expect(fill.progress).toBeLessThan(1);
  });
});
