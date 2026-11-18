import type { KaraokeSong } from "./types";

/**
 * Seeded demo clock shifts for licensed karaoke fixtures.
 * Highlight clock = audio.currentTimeMs − globalOffsetMs
 * (positive = delay highlights; negative = advance).
 *
 * Measured from masters under data/sing/masters with a 250–4000 Hz band
 * energy rise at the first lyric window (see demoOffsets.test.ts).
 */
export const LICENSED_DEMO_GLOBAL_OFFSET_MS: Record<string, number> = {
  /** First sung onset ~30750 ms vs lyric start 31340 → advance ~500 ms. */
  "hat-mua-vuong-van": -500,
  /** First lyric window already tracks the HP energy rise (~41800). */
  "ngay-mai-nguoi-ta-lay-chong": 0,
  /** Short lead-in before the first syllable on the 30s demo. */
  "xin-chao-moi-ngay": 120,
};

export function licensedDemoOffsetMs(songId: string): number | undefined {
  return LICENSED_DEMO_GLOBAL_OFFSET_MS[songId];
}

/** Apply the seeded demo offset (does not invent per-word timings). */
export function withLicensedDemoOffset<T extends KaraokeSong>(song: T): T {
  const offset = licensedDemoOffsetMs(song.id);
  if (offset === undefined) return song;
  if (song.globalOffsetMs === offset) return song;
  return { ...song, globalOffsetMs: offset };
}
