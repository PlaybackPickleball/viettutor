import { describe, expect, it } from "vitest";
import { getSong } from "./catalog";
import {
  allowsUse,
  canPlayAudio,
  canShowLyrics,
  gateSongAsset,
} from "./rights";

describe("sing rights deny-by-default", () => {
  it("allows original demo audio + lyrics", () => {
    const song = getSong("xin-chao-moi-ngay")!;
    expect(canPlayAudio(song)).toBe(true);
    expect(canShowLyrics(song)).toBe(true);
    expect(gateSongAsset(song, "audio_original").ok).toBe(true);
  });

  it("blocks pending commercial song audio and lyrics", () => {
    const male = getSong("ngay-mai-nguoi-ta-lay-chong")!;
    const female = getSong("hat-mua-vuong-van")!;
    expect(male.rights.status).toBe("pending");
    expect(female.rights.status).toBe("pending");
    expect(canPlayAudio(male)).toBe(false);
    expect(canShowLyrics(male)).toBe(false);
    expect(canPlayAudio(female)).toBe(false);
    expect(canShowLyrics(female)).toBe(false);
    expect(gateSongAsset(male, "audio_original").ok).toBe(false);
    expect(gateSongAsset(female, "lyric_timing").ok).toBe(false);
    expect(allowsUse(male.rights, "metadata")).toBe(true);
    expect(allowsUse(male.rights, "external_link")).toBe(true);
  });

  it("denies unknown songs", () => {
    const gate = gateSongAsset(undefined, "audio_original");
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.status).toBe(404);
  });
});
