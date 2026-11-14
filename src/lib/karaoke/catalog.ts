import { XIN_CHAO_BILINGUAL } from "./fixtures/xin-chao-bilingual";
import { HAT_MUA_KARAOKE, NGAY_MAI_KARAOKE } from "./fixtures/loadFixture";
import type { KaraokeSong } from "./types";

/** Bundled fixtures — overridable at runtime by data/karaoke/approved/*.json */
const FIXTURES: Record<string, KaraokeSong> = {
  [XIN_CHAO_BILINGUAL.id]: XIN_CHAO_BILINGUAL,
  [NGAY_MAI_KARAOKE.id]: NGAY_MAI_KARAOKE,
  [HAT_MUA_KARAOKE.id]: HAT_MUA_KARAOKE,
};

/** Runtime overrides registered from approved API responses (client) or server load. */
const runtimeOverrides: Record<string, KaraokeSong> = {};

export function getFixtureKaraokeSong(id: string): KaraokeSong | undefined {
  return FIXTURES[id];
}

export function registerKaraokeOverride(song: KaraokeSong): void {
  runtimeOverrides[song.id] = song;
}

export function clearKaraokeOverride(id: string): void {
  delete runtimeOverrides[id];
}

export function getKaraokeSong(id: string): KaraokeSong | undefined {
  const doc = runtimeOverrides[id] ?? FIXTURES[id];
  if (!doc || doc.publishStatus !== "approved") return undefined;
  return doc;
}

export function listKaraokeSongs(): KaraokeSong[] {
  const ids = new Set([...Object.keys(FIXTURES), ...Object.keys(runtimeOverrides)]);
  return [...ids]
    .map((id) => getKaraokeSong(id))
    .filter((d): d is KaraokeSong => Boolean(d));
}

export function listFixtureKaraokeSongs(): KaraokeSong[] {
  return Object.values(FIXTURES).filter((d) => d.publishStatus === "approved");
}
