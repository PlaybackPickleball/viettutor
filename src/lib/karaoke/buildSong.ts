import type { KaraokeSong, LyricLine, LyricToken, ToneLabel } from "./types";

export type AlignTokenIn = {
  text: string;
  start: number;
  end: number;
  confidence?: number;
};

export type AlignLineIn = {
  textVi: string;
  start: number;
  end: number;
  tokens: AlignTokenIn[];
  translationEn?: string;
};

export type AlignResultIn = {
  lines: AlignLineIn[];
  durationMs: number;
  pipelineVersion?: string;
  demucsUsed?: boolean;
};

function toneFor(word: string): ToneLabel {
  if (/[àằầèềìòồờùừỳ]/.test(word)) return "huyền";
  if (/[áắấéếíóốớúứý]/.test(word)) return "sắc";
  if (/[ảẳẩẻểỉỏổởủửỷ]/.test(word)) return "hỏi";
  if (/[ãẵẫẽễĩõỗỡũữỹ]/.test(word)) return "ngã";
  if (/[ạặậẹệịọộợụựỵ]/.test(word)) return "nặng";
  return "ngang";
}

/** Preserve existing EN glosses/translations when re-aligning the same VI text. */
export function buildKaraokeSongFromAlign(opts: {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  align: AlignResultIn;
  previous?: KaraokeSong | null;
  globalOffsetMs?: number;
  publishStatus?: KaraokeSong["publishStatus"];
}): KaraokeSong {
  const prevByVi = new Map((opts.previous?.lines ?? []).map((l) => [l.textVi, l]));
  const prevTokEn = new Map<string, string>();
  for (const l of opts.previous?.lines ?? []) {
    for (const t of l.tokens) {
      prevTokEn.set(`${l.textVi}::${t.text}`, t.contextualEnglish);
    }
  }

  const lines: LyricLine[] = opts.align.lines.map((ln, i) => {
    const prev = prevByVi.get(ln.textVi);
    const lineId = `l${i}`;
    const tokens: LyricToken[] = ln.tokens.map((t, j) => {
      const startMs = Math.round(t.start * 1000);
      const endMs = Math.max(startMs + 40, Math.round(t.end * 1000));
      const conf = t.confidence ?? 0.85;
      return {
        id: `t${i}-${j}`,
        lineId,
        text: t.text,
        startMs,
        endMs,
        contextualEnglish:
          prevTokEn.get(`${ln.textVi}::${t.text}`) ||
          prev?.tokens[j]?.contextualEnglish ||
          ln.translationEn ||
          t.text,
        toneMetadata: { label: toneFor(t.text) },
        alignmentConfidence: conf,
        reviewStatus: conf < 0.75 ? "needs_review" : "approved",
      };
    });
    return {
      id: lineId,
      songId: opts.id,
      textVi: ln.textVi,
      translationEn: ln.translationEn || prev?.translationEn || "",
      startMs: tokens[0]?.startMs ?? Math.round(ln.start * 1000),
      endMs: tokens[tokens.length - 1]?.endMs ?? Math.round(ln.end * 1000),
      tokens,
      displayOrder: i,
      alignmentConfidence:
        tokens.reduce((s, t) => s + (t.alignmentConfidence ?? 0.8), 0) / Math.max(1, tokens.length),
      reviewStatus: "needs_review",
    };
  });

  return {
    id: opts.id,
    title: opts.title,
    artist: opts.artist,
    language: "vi",
    audioUrl: opts.audioUrl,
    durationMs: opts.align.durationMs,
    lines,
    translations: opts.previous?.translations ?? [],
    reviews: [],
    publishStatus: opts.publishStatus ?? "needs_review",
    pipelineVersion: opts.align.pipelineVersion ?? "demucs-stable-whisper-align-v1",
    globalOffsetMs: opts.globalOffsetMs ?? opts.previous?.globalOffsetMs ?? 0,
  };
}
