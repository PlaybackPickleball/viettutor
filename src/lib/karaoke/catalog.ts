import { XIN_CHAO_BILINGUAL } from "./fixtures/xin-chao-bilingual";
import type { KaraokeSong } from "./types";

/** Approved karaoke documents only — never live AI during playback. */
const DOCS: Record<string, KaraokeSong> = {
  [XIN_CHAO_BILINGUAL.id]: XIN_CHAO_BILINGUAL,
};

export function getKaraokeSong(id: string): KaraokeSong | undefined {
  const doc = DOCS[id];
  if (!doc || doc.publishStatus !== "approved") return undefined;
  return doc;
}

export function listKaraokeSongs(): KaraokeSong[] {
  return Object.values(DOCS).filter((d) => d.publishStatus === "approved");
}
