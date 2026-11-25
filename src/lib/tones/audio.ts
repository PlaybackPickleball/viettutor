/**
 * Native tone recordings — paths under /public/audio/vi/tones/{dialect}/.
 * Missing files fall back to TTS via ListenControls / speakVietnamese.
 * Recording wishlist (3× each, male+female, N/S): tone names, ma-family,
 * vowel practice a–ạ, sequence, comparisons, vowel diacritics, combined marks.
 */

import type { ToneDialect, ToneId } from "./types";

export type ToneAudioKind =
  | "tone-name"
  | "syllable"
  | "vowel"
  | "sequence"
  | "compare"
  | "diacritic"
  | "combined";

/** Relative path helper — verified native takes land here later. */
export function toneAudioPath(
  dialect: ToneDialect,
  kind: ToneAudioKind,
  slug: string,
): string {
  return `/audio/vi/tones/${dialect}/${kind}/${slug}.mp3`;
}

export function syllableAudioPath(dialect: ToneDialect, written: string): string {
  const slug = encodeURIComponent(written.normalize("NFC"));
  return toneAudioPath(dialect, "syllable", slug);
}

/** Compare-pair slug e.g. ma-ma-grave → ma-mà */
export function compareAudioPath(
  dialect: ToneDialect,
  left: string,
  right: string,
): string {
  const slug = `${left.normalize("NFC")}_${right.normalize("NFC")}`;
  return toneAudioPath(dialect, "compare", encodeURIComponent(slug));
}

export const TONE_RECORDING_WISHLIST = [
  { kind: "tone-name" as const, items: ["ngang", "sac", "huyen", "hoi", "nga", "nang"] },
  { kind: "syllable" as const, items: ["ma", "má", "mà", "mả", "mã", "mạ"] },
  { kind: "vowel" as const, items: ["a", "á", "à", "ả", "ã", "ạ"] },
  { kind: "sequence" as const, items: ["ma-family"] },
  { kind: "compare" as const, items: ["má-mà", "ma-mà", "má-mạ"] },
  { kind: "diacritic" as const, items: ["a", "ă", "â", "e", "ê", "o", "ô", "ơ", "u", "ư"] },
  { kind: "combined" as const, items: ["ắ", "ầ", "ế", "ộ", "ớ", "ữ"] },
] as const;

export function toneIdToSlug(id: ToneId): string {
  return id;
}
