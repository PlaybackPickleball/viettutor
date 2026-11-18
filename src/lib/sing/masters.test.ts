import { describe, expect, it } from "vitest";
import {
  gatedAudioStreamUrl,
  isPublicSingAssetPath,
  toGatedPlaybackUrl,
} from "./masters";

describe("sing masters gating", () => {
  it("detects public /sing paths", () => {
    expect(isPublicSingAssetPath("/sing/hat-mua-vuong-van.mp3")).toBe(true);
    expect(isPublicSingAssetPath("master:hat-mua-vuong-van.mp3")).toBe(false);
    expect(isPublicSingAssetPath("/api/sing/stream?songId=x")).toBe(false);
  });

  it("rewrites public paths to the gated stream", () => {
    expect(toGatedPlaybackUrl("hat-mua-vuong-van", "/sing/hat-mua-vuong-van.mp3")).toBe(
      gatedAudioStreamUrl("hat-mua-vuong-van"),
    );
    expect(toGatedPlaybackUrl("xin-chao-moi-ngay", "master:xin-chao-moi-ngay.wav")).toBe(
      gatedAudioStreamUrl("xin-chao-moi-ngay"),
    );
  });
});
