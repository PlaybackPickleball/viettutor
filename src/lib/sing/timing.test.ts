import { describe, expect, it } from "vitest";
import { getSong } from "./catalog";
import { findLineAt, findTokenAt } from "./timing";

describe("karaoke timing", () => {
  const song = getSong("xin-chao-moi-ngay")!;

  it("finds the active line from audio time", () => {
    expect(findLineAt(song.lines, 0)?.id).toBe("l1");
    expect(findLineAt(song.lines, 3)?.id).toBe("l2");
    expect(findLineAt(song.lines, 100)).toBeNull();
  });

  it("finds the active syllable token", () => {
    const hit = findTokenAt(song.lines, 0.2);
    expect(hit?.token.text).toBe("Xin");
    const hit2 = findTokenAt(song.lines, 4.5);
    expect(hit2?.token.text).toBe("Việt");
  });

  it("recalculates after seek into a later line", () => {
    const line = findLineAt(song.lines, 18.2);
    expect(line?.id).toBe("l8");
    expect(findTokenAt(song.lines, 18.2)?.token.text).toBe("Hát");
  });
});
