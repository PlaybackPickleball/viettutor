import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LATIN_LETTERS } from "./alphabet";
import { interpretOcr, splitWords, teachGate } from "./ocrGate";
import { BEGINNER_SONG, wordSyncClaimed } from "./song";

describe("English OCR gate", () => {
  it("does not replace an OCR error or an empty read with practice text", () => {
    expect(interpretOcr(null, "tesseract failed").status).toBe("error");
    expect(interpretOcr("   ", null).status).toBe("empty");
    const ready = interpretOcr("Hello  my name", null);
    expect(ready.status).toBe("needs_confirm");
    if (ready.status === "needs_confirm") {
      expect(ready.text).toBe("Hello my name");
      expect(teachGate(ready.text, false).ok).toBe(false);
      expect(teachGate(ready.text, true).ok).toBe(true);
    }
    expect(splitWords("Hello, my name!")).toEqual(["Hello", "my", "name"]);
  });
});

describe("beginner song", () => {
  it("is original and does not claim word sync", () => {
    expect(BEGINNER_SONG.original).toBe(true);
    expect(BEGINNER_SONG.copyrighted).toBe(false);
    expect(wordSyncClaimed(BEGINNER_SONG)).toBe(false);
    const text = BEGINNER_SONG.lines.map((line) => line.en.toLowerCase()).join(" ");
    expect(text).toMatch(/hello/);
    expect(text).toMatch(/how are you/);
    expect(text).toMatch(/my name is/);
    expect(text).toMatch(/thank you/);
    expect(text).toMatch(/goodbye/);
    expect(BEGINNER_SONG.wordSync.noteVi).toMatch(/Chưa khớp từng từ/);
  });
});

describe("Latin handwriting", () => {
  it("does not claim letter recognition", () => {
    expect(LATIN_LETTERS).toHaveLength(26);
    expect(LATIN_LETTERS.every((letter) => letter.recognition === "unavailable")).toBe(true);
    const a = LATIN_LETTERS.find((letter) => letter.grapheme === "a");
    expect(a?.strokes.length).toBeGreaterThan(0);
    expect(a?.exampleEn).toBe("cat");
  });
});

describe("English screens stay on buttons", () => {
  it("does not navigate the new course with a swipe handler", () => {
    const files = readdirSync("src/components/english").filter((name) => name.endsWith(".tsx"));
    expect(files.length).toBeGreaterThan(0);
    for (const name of files) {
      const source = readFileSync(`src/components/english/${name}`, "utf8");
      expect(source).not.toMatch(/onTouch(Start|Move|End)/);
      expect(source).not.toMatch(/đếm ngược|countdown/i);
    }
  });
});
