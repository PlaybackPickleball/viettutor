import { XIN_CHAO_BILINGUAL } from "./fixtures/xin-chao-bilingual";
import { HAT_MUA_KARAOKE, NGAY_MAI_KARAOKE } from "./fixtures/loadFixture";
import type { KaraokeSong } from "./types";

/** Approved karaoke documents only — never live AI during playback. */
const DOCS: Record<string, KaraokeSong> = {
  [XIN_CHAO_BILINGUAL.id]: XIN_CHAO_BILINGUAL,
  [NGAY_MAI_KARAOKE.id]: NGAY_MAI_KARAOKE,
  [HAT_MUA_KARAOKE.id]: HAT_MUA_KARAOKE,
};

export function getKaraokeSong(id: string): KaraokeSong | undefined {
  const doc = DOCS[id];
  if (!doc || doc.publishStatus !== "approved") return undefined;
  return doc;
}

export function listKaraokeSongs(): KaraokeSong[] {
  return Object.values(DOCS).filter((d) => d.publishStatus === "approved");
}
