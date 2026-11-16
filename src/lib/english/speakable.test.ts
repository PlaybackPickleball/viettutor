import { describe, expect, it } from "vitest";
import { speakableEnglish } from "./speakClient";

describe("speakableEnglish", () => {
  it("speaks the word without surrounding punctuation", () => {
    expect(speakableEnglish("Hello,")).toBe("Hello");
    expect(speakableEnglish("I'm")).toBe("I'm");
    expect(speakableEnglish("goodbye.")).toBe("goodbye");
  });
});
