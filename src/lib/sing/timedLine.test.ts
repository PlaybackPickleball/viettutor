import { describe, expect, it } from "vitest";
import {
  lyricLineToTimedLine,
  parseTimedLyricJson,
  SAMPLE_TIMED_LINE,
  timedLineToLyricLine,
} from "./timedLine";

describe("TimedLyricLine interchange", () => {
  it("converts the sample Em yêu anh line to LyricLine tokens", () => {
    const line = timedLineToLyricLine(SAMPLE_TIMED_LINE, 0);
    expect(line.start).toBe(12.4);
    expect(line.end).toBe(14.8);
    expect(line.translationEn).toBe("I love you");
    expect(line.tokens.map((t) => t.text)).toEqual(["Em", "yêu", "anh"]);
    expect(line.tokens[1].meaningEn).toBe("love");
    expect(line.tokens[1].start).toBe(13.1);
  });

  it("round-trips through timed JSON", () => {
    const line = timedLineToLyricLine(SAMPLE_TIMED_LINE, 0);
    const back = lyricLineToTimedLine(line, "practice_001");
    expect(back.line).toBe("Em yêu anh");
    expect(back.words).toHaveLength(3);
    expect(back.words[2].english).toBe("you");
  });

  it("parses a single TimedLyricLine JSON string", () => {
    const raw = JSON.stringify(SAMPLE_TIMED_LINE);
    const parsed = parseTimedLyricJson(raw);
    expect(parsed.songId).toBe("practice_001");
    expect(parsed.lines).toHaveLength(1);
    expect(parsed.lines[0].tokens[0].text).toBe("Em");
  });
});
