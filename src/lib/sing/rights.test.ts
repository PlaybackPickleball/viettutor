import { describe, expect, it } from "vitest";
import { getSong } from "./catalog";
import {
  allowsUse,
  canPlayAudio,
  canShowLyrics,
  gateSongAsset,
  rightsAllowLyrics,
  rightsAllowPlayback,
} from "./rights";

describe("sing rights", () => {
  it("allows original demo audio + lyrics via gated stream URL", () => {
    const song = getSong("xin-chao-moi-ngay")!;
    expect(canPlayAudio(song)).toBe(true);
    expect(canShowLyrics(song)).toBe(true);
    const gate = gateSongAsset(song, "audio_original");
    expect(gate.ok).toBe(true);
    if (gate.ok) {
      expect(gate.url).toContain("/api/sing/stream?");
      expect(gate.url).not.toMatch(/^\/sing\//);
    }
  });

  it("treats licensed free-to-use ballads as Production-eligible", () => {
    const male = getSong("ngay-mai-nguoi-ta-lay-chong")!;
    const female = getSong("hat-mua-vuong-van")!;
    expect(male.rights.status).toBe("approved");
    expect(female.rights.status).toBe("approved");
    expect(rightsAllowPlayback(male)).toBe(true);
    expect(rightsAllowPlayback(female)).toBe(true);
    expect(rightsAllowLyrics(male)).toBe(true);
    expect(canPlayAudio(male)).toBe(true);
    expect(canPlayAudio(female)).toBe(true);
    const maleGate = gateSongAsset(male, "audio_original");
    const femaleGate = gateSongAsset(female, "audio_original");
    expect(maleGate.ok).toBe(true);
    expect(femaleGate.ok).toBe(true);
    if (maleGate.ok) expect(maleGate.url).toContain("/api/sing/stream?");
    if (femaleGate.ok) expect(femaleGate.url).toContain("/api/sing/stream?");
    // Catalog lines empty until timed — lyrics gate needs lines, rights still allow
    expect(canShowLyrics(male)).toBe(false);
    expect(allowsUse(male.rights, "lyrics_display")).toBe(true);
  });

  it("denies unknown songs", () => {
    const gate = gateSongAsset(undefined, "audio_original");
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.status).toBe(404);
  });
});
