import { describe, expect, it } from "vitest";
import {
  LEARN_LINE_AUDIO_CACHE_VERSION,
  LEARN_LINE_AUDIO_ENABLED,
  learnLineNativePath,
  ngayMaiLearnLineCount,
  songHasLearnLineAudio,
} from "./learnLineAudio";

describe("learn line native audio", () => {
  it("resolves Ngày Mai line paths by index", () => {
    expect(LEARN_LINE_AUDIO_ENABLED).toBe(true);
    expect(songHasLearnLineAudio("ngay-mai-nguoi-ta-lay-chong")).toBe(true);
    expect(songHasLearnLineAudio("hat-mua-vuong-van")).toBe(false);
    expect(ngayMaiLearnLineCount()).toBe(37);
    expect(learnLineNativePath("ngay-mai-nguoi-ta-lay-chong", 0)).toBe(
      `/audio/vi/karaoke/ngay-mai-nguoi-ta-lay-chong/line_01.mp3?v=${LEARN_LINE_AUDIO_CACHE_VERSION}`,
    );
    expect(learnLineNativePath("ngay-mai-nguoi-ta-lay-chong", 36)).toContain(
      "line_37.mp3",
    );
    expect(learnLineNativePath("ngay-mai-nguoi-ta-lay-chong", 37)).toBeNull();
  });
});
