/** Bilingual karaoke engine — integer milliseconds internally */

export type ReviewStatus = "draft" | "needs_review" | "approved" | "rejected";

export type KaraokeMode = "learn" | "sing" | "practice";

export type ToneLabel =
  | "ngang"
  | "huyền"
  | "sắc"
  | "hỏi"
  | "ngã"
  | "nặng"
  | "unknown";

export type LyricToken = {
  id: string;
  lineId: string;
  text: string;
  /** Inclusive start in ms */
  startMs: number;
  /** Exclusive-ish end in ms (may stretch across beats) */
  endMs: number;
  contextualEnglish: string;
  toneMetadata: {
    label: ToneLabel;
    note?: string;
  };
  phraseGroupId?: string;
  alignmentConfidence?: number;
  reviewStatus?: ReviewStatus;
};

export type LyricLine = {
  id: string;
  songId: string;
  textVi: string;
  /** Natural full-line English translation */
  translationEn: string;
  startMs: number;
  endMs: number;
  tokens: LyricToken[];
  displayOrder: number;
  alignmentConfidence?: number;
  reviewStatus?: ReviewStatus;
};

export type Translation = {
  id: string;
  songId: string;
  lineId?: string;
  tokenId?: string;
  kind: "line" | "token" | "phrase" | "vocab";
  textEn: string;
  explanation?: string;
  reviewStatus: ReviewStatus;
};

export type AlignmentReview = {
  id: string;
  songId: string;
  targetType: "line" | "token" | "translation";
  targetId: string;
  flag: "timing_uncertain" | "translation_uncertain" | "diacritic" | "other";
  note: string;
  status: ReviewStatus;
  createdAt: string;
};

export type KaraokeSong = {
  id: string;
  title: string;
  artist: string;
  language: "vi";
  audioUrl: string;
  durationMs: number;
  lines: LyricLine[];
  translations: Translation[];
  reviews: AlignmentReview[];
  /** Published karaoke uses only approved preprocessing output */
  publishStatus: ReviewStatus;
  pipelineVersion?: string;
};

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** progress = clamp((currentTime - wordStart) / (wordEnd - wordStart), 0, 1) */
export function wordFillProgress(currentMs: number, startMs: number, endMs: number): number {
  const span = Math.max(1, endMs - startMs);
  return clamp01((currentMs - startMs) / span);
}

export function secToMs(sec: number): number {
  return Math.round(sec * 1000);
}

export function msToSec(ms: number): number {
  return ms / 1000;
}
