import { describe, expect, it } from "vitest";
import {
  ALL_LETTERS,
  DIGRAPH_GRAPHEMES,
  LETTER_PHONETIC_HINTS,
} from "./letters";

describe("digraph phonetic hints", () => {
  it("defines TTS cues for every Level 4–8 digraph", () => {
    for (const g of DIGRAPH_GRAPHEMES) {
      expect(LETTER_PHONETIC_HINTS[g]?.length).toBeGreaterThan(20);
    }
  });

  it("wires phoneticHint onto each digraph letter lesson", () => {
    for (const g of DIGRAPH_GRAPHEMES) {
      const letter = ALL_LETTERS.find((l) => l.grapheme === g);
      expect(letter, `missing letter for ${g}`).toBeTruthy();
      expect(letter?.phoneticHint).toBe(LETTER_PHONETIC_HINTS[g]);
    }
  });
});
