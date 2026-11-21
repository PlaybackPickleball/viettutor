/**
 * First-100 vocabulary native clips (male 10 + female 90).
 * Splitting is mechanical — not linguistic validation. Learner playback is
 * gated by VOCAB_PACK_AUDIO_ENABLED (enabled after Nicola approved /review/vocab-audio).
 */

import { listPackWords } from "./catalog";
import type { PackWord } from "./types";
import { VOCAB_AUDIO_DEFAULT_BOUNDS } from "./audioBounds.generated";

export type VocabAudioFlag = "short" | "silent" | "overlap" | "overlap-risk" | "wrong-sound";

export type VocabAudioVoice = "male" | "female";

export type VocabAudioClip = {
  packId: number;
  wordId: string;
  vi: string;
  en: string;
  category: string;
  voice: VocabAudioVoice;
  filename: string;
  path: string;
  sourcePath: string;
  speechStart: number;
  speechEnd: number;
  clipStart: number;
  clipEnd: number;
  speechDuration: number;
  meanVolumeDb: number | null;
  autoFlags: VocabAudioFlag[];
};

/**
 * Native First-100 clips for pack Hear / quiz / Listen-and-Type.
 * Enabled after Nicola approved `/review/vocab-audio`.
 */
export const VOCAB_PACK_AUDIO_ENABLED = true;

export const VOCAB_AUDIO_SOURCE_MALE = "/audio/vi/vocabulary/source/male-10.mp3";
export const VOCAB_AUDIO_SOURCE_FEMALE = "/audio/vi/vocabulary/source/female-90.mp3";
export const VOCAB_AUDIO_MANIFEST_PATH = "/audio/vi/vocabulary/manifest.json";

/** Spoken order in the male master → original pack IDs. */
export const VOCAB_MALE_PACK_IDS = [1, 3, 5, 6, 8, 11, 15, 51, 52, 59] as const;

const MALE_SET = new Set<number>(VOCAB_MALE_PACK_IDS);

export function vocabAudioVoiceForPackId(packId: number): VocabAudioVoice {
  return MALE_SET.has(packId) ? "male" : "female";
}

export function vocabAudioPathForPackId(packId: number): string {
  return `/audio/vi/vocabulary/v${String(packId).padStart(3, "0")}.mp3`;
}

export function vocabAudioPathForWordId(wordId: string): string | null {
  const m = /^v(\d{3})$/i.exec(wordId.trim());
  if (!m) return null;
  return vocabAudioPathForPackId(Number(m[1]));
}

function sourcePathFor(voice: VocabAudioVoice): string {
  return voice === "male" ? VOCAB_AUDIO_SOURCE_MALE : VOCAB_AUDIO_SOURCE_FEMALE;
}

export function buildVocabAudioClips(
  bounds: typeof VOCAB_AUDIO_DEFAULT_BOUNDS = VOCAB_AUDIO_DEFAULT_BOUNDS,
  words: PackWord[] = listPackWords(),
): VocabAudioClip[] {
  if (bounds.length !== 100) {
    throw new Error(`Expected 100 vocab audio bounds, got ${bounds.length}`);
  }
  const byPack = new Map(words.map((w) => [w.packId, w]));
  return bounds.map((b) => {
    const word = byPack.get(b.packId);
    if (!word) throw new Error(`Missing pack word for audio packId ${b.packId}`);
    const filename = `v${String(b.packId).padStart(3, "0")}.mp3`;
    const speechDuration = Number((b.speechEnd - b.speechStart).toFixed(4));
    return {
      packId: b.packId,
      wordId: word.id,
      vi: word.vi,
      en: word.en,
      category: word.category,
      voice: b.voice,
      filename,
      path: vocabAudioPathForPackId(b.packId),
      sourcePath: sourcePathFor(b.voice),
      speechStart: b.speechStart,
      speechEnd: b.speechEnd,
      clipStart: b.speechStart,
      clipEnd: b.speechEnd,
      speechDuration,
      meanVolumeDb: b.meanVolumeDb,
      autoFlags: [...b.autoFlags],
    };
  });
}

export const VOCAB_AUDIO_CATALOG = buildVocabAudioClips();

export function vocabAudioClipForPackId(packId: number): VocabAudioClip | undefined {
  return VOCAB_AUDIO_CATALOG.find((c) => c.packId === packId);
}

export function vocabAudioClipForWordId(wordId: string): VocabAudioClip | undefined {
  const id = wordId.trim().toLowerCase();
  return VOCAB_AUDIO_CATALOG.find((c) => c.wordId === id);
}

/**
 * Public path for learner Hear / quiz when native vocab audio is enabled.
 * Returns null when disabled or unknown.
 */
export function vocabNativePathForWord(word: Pick<PackWord, "id" | "packId">): string | null {
  if (!VOCAB_PACK_AUDIO_ENABLED) return null;
  return vocabAudioClipForWordId(word.id)?.path ?? vocabAudioPathForPackId(word.packId);
}

/** Always resolve path for review / tests (ignores enable flag). */
export function vocabPlaybackPathForWordId(wordId: string): string | null {
  return vocabAudioClipForWordId(wordId)?.path ?? null;
}

export function suspectVocabClips(
  clips: VocabAudioClip[] = VOCAB_AUDIO_CATALOG,
): VocabAudioClip[] {
  return clips.filter((c) => c.autoFlags.length > 0);
}
