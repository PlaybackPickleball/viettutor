/**
 * Southern Vietnamese audio asset registry for Đánh Vần 2.0.
 * Prefer verified native recordings when `status === "native"`.
 * Placeholders use TTS utterance — never claim silent/fake verified audio.
 */

export type AudioAssetStatus = "native" | "tts-placeholder";

export type AudioAsset = {
  id: string;
  /** Spoken text for TTS / display. */
  utterance: string;
  dialect: "southern";
  status: AudioAssetStatus;
  /** Relative path under /public when a native file ships. */
  nativePath?: string;
  noteEn?: string;
};

/** Pilot asset IDs used by Foundations (w0) lessons. */
export const AUDIO_ASSETS: Record<string, AudioAsset> = {
  "vi.south.vowel.a": {
    id: "vi.south.vowel.a",
    utterance: "a",
    dialect: "southern",
    status: "native",
    nativePath: "/audio/vi/alphabet/alphabet_01_a.mp3",
    noteEn: "Open ah vowel — alphabet letter clip",
  },
  "vi.south.letter.b": {
    id: "vi.south.letter.b",
    utterance: "bờ",
    dialect: "southern",
    status: "tts-placeholder",
    nativePath: "/audio/vi/south/letter/b.mp3",
    noteEn: "Teaching sound for b (not letter-name clip)",
  },
  "vi.south.syllable.ba": {
    id: "vi.south.syllable.ba",
    utterance: "ba",
    dialect: "southern",
    status: "tts-placeholder",
    nativePath: "/audio/vi/south/syllable/ba.mp3",
    noteEn: "ba — dad / three (Southern context)",
  },
  "vi.south.vowel.o": {
    id: "vi.south.vowel.o",
    utterance: "o",
    dialect: "southern",
    status: "native",
    nativePath: "/audio/vi/alphabet/alphabet_17_o.mp3",
    noteEn: "Round aw vowel — alphabet letter clip",
  },
  "vi.south.syllable.bo": {
    id: "vi.south.syllable.bo",
    utterance: "bo",
    dialect: "southern",
    status: "tts-placeholder",
    nativePath: "/audio/vi/south/syllable/bo.mp3",
    noteEn: "bo — practice syllable (level tone)",
  },
  "vi.south.syllable.bo-huyen": {
    id: "vi.south.syllable.bo-huyen",
    utterance: "bò",
    dialect: "southern",
    status: "tts-placeholder",
    nativePath: "/audio/vi/south/syllable/bo-huyen.mp3",
    noteEn: "bò — cow (huyền)",
  },
};

export function getAudioAsset(id: string): AudioAsset | undefined {
  return AUDIO_ASSETS[id];
}

/** Resolve playable utterance: prefer asset registry, fall back to raw text. */
export function resolveAudioUtterance(assetId?: string, fallback?: string): string | undefined {
  if (assetId) {
    const asset = getAudioAsset(assetId);
    if (asset) return asset.utterance;
  }
  return fallback;
}
