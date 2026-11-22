/**
 * Essential Sentences native clips.
 * Lesson 1 (sentence_001–010) ships individual voiceovers; other lessons stay TTS until uploaded.
 */

export const SENTENCE_NATIVE_AUDIO_ENABLED = true;

/** Bump when replacing public sentence MP3 bytes so browsers fetch fresh files. */
export const SENTENCE_AUDIO_CACHE_VERSION = "l1-20261122";

const LESSON1_NATIVE_ORDERS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

export function sentenceAudioFilename(order: number): string {
  return `sentence_${String(order).padStart(3, "0")}.mp3`;
}

export function sentenceAudioPathForOrder(order: number): string {
  return `/audio/vi/sentences/${sentenceAudioFilename(order)}?v=${SENTENCE_AUDIO_CACHE_VERSION}`;
}

export function sentenceHasNativeClip(order: number): boolean {
  return LESSON1_NATIVE_ORDERS.has(order);
}

/**
 * Public path for full-sentence Play / Slow / Speak model when native audio is enabled.
 * Returns null when disabled or no clip has shipped for this sentence.
 */
export function sentenceNativePathForOrder(order: number): string | null {
  if (!SENTENCE_NATIVE_AUDIO_ENABLED) return null;
  if (!sentenceHasNativeClip(order)) return null;
  return sentenceAudioPathForOrder(order);
}

export function sentenceNativePathForId(sentenceId: string): string | null {
  const m = /^sentence_(\d{3})$/i.exec(sentenceId.trim());
  if (!m) return null;
  return sentenceNativePathForOrder(Number(m[1]));
}
