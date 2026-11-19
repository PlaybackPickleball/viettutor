/**
 * Visual memory aids for Đánh Vần practice words.
 * Conversational vocab → concrete illustration; training forms → neutral abstract.
 */

export type WordArtKind = "vocab" | "training";

export type WordArtEntry = {
  /** Illustration key rendered by WordArt SVG set. */
  artId: string;
  kind: WordArtKind;
  /** Accessible label combining VI + EN when available. */
  alt: string;
};

/** Map written syllable → art. Prefer Southern conversational meanings. */
const BY_WRITTEN: Record<string, WordArtEntry> = {
  // Everyday / kinship
  ba: { artId: "dad", kind: "vocab", alt: "ba — dad / three" },
  bá: { artId: "aunt", kind: "vocab", alt: "bá — paternal aunt (regional)" },
  bà: { artId: "grandmother", kind: "vocab", alt: "bà — grandmother" },
  má: { artId: "mother", kind: "vocab", alt: "má — mother (Southern)" },
  mà: { artId: "but", kind: "vocab", alt: "mà — but / which" },
  bố: { artId: "dad", kind: "vocab", alt: "bố — dad (Southern)" },
  cha: { artId: "dad", kind: "vocab", alt: "cha — father (Southern)" },
  cô: { artId: "aunt", kind: "vocab", alt: "cô — aunt / Miss" },
  em: { artId: "sibling", kind: "vocab", alt: "em — younger sibling" },
  anh: { artId: "brother", kind: "vocab", alt: "anh — older brother / you" },
  tôi: { artId: "self", kind: "vocab", alt: "tôi — I" },
  ta: { artId: "self", kind: "vocab", alt: "ta — we / I" },
  // Home / daily
  nhà: { artId: "house", kind: "vocab", alt: "nhà — house / home" },
  ăn: { artId: "eat", kind: "vocab", alt: "ăn — to eat" },
  học: { artId: "study", kind: "vocab", alt: "học — to study" },
  vui: { artId: "happy", kind: "vocab", alt: "vui — happy" },
  mang: { artId: "carry", kind: "vocab", alt: "mang — to carry" },
  nghe: { artId: "listen", kind: "vocab", alt: "nghe — to listen" },
  ghi: { artId: "write", kind: "vocab", alt: "ghi — to write / note" },
  // Nature / objects
  lá: { artId: "leaf", kind: "vocab", alt: "lá — leaf" },
  la: { artId: "leaf", kind: "vocab", alt: "la — leaf / to be" },
  cá: { artId: "fish", kind: "vocab", alt: "cá — fish" },
  ca: { artId: "sing", kind: "vocab", alt: "ca — to sing" },
  gà: { artId: "chicken", kind: "vocab", alt: "gà — chicken" },
  cân: { artId: "scale", kind: "vocab", alt: "cân — scale / balance" },
  phá: { artId: "break", kind: "vocab", alt: "phá — to break" },
  khá: { artId: "gauge", kind: "vocab", alt: "khá — rather / fairly" },
  mê: { artId: "heart", kind: "vocab", alt: "mê — fond of" },
  mơ: { artId: "dream", kind: "vocab", alt: "mơ — to dream" },
  từ: { artId: "word", kind: "vocab", alt: "từ — word / from" },
  cứ: { artId: "arrow", kind: "vocab", alt: "cứ — keep on" },
  // Training / abstract — neutral art only
  ma: { artId: "abstract-wave", kind: "training", alt: "ma — sound training" },
  mả: { artId: "abstract-tone", kind: "training", alt: "mả — tone training" },
  mã: { artId: "abstract-tone", kind: "training", alt: "mã — tone training" },
  mạ: { artId: "abstract-dot", kind: "training", alt: "mạ — tone training" },
  bả: { artId: "abstract-tone", kind: "training", alt: "bả — tone training" },
  bã: { artId: "abstract-wave", kind: "training", alt: "bã — tone training" },
  bạ: { artId: "abstract-dot", kind: "training", alt: "bạ — tone training" },
  na: { artId: "abstract-circle", kind: "training", alt: "na — sound training" },
  ha: { artId: "abstract-circle", kind: "training", alt: "ha — sound training" },
  ka: { artId: "abstract-circle", kind: "training", alt: "ka — spelling training" },
  ná: { artId: "abstract-tone", kind: "training", alt: "ná — tone training" },
  tà: { artId: "abstract-tone", kind: "training", alt: "tà — tone training" },
  há: { artId: "abstract-tone", kind: "training", alt: "há — tone training" },
  an: { artId: "abstract-wave", kind: "training", alt: "an — final-n training" },
  án: { artId: "abstract-tone", kind: "training", alt: "án — tone training" },
  ban: { artId: "abstract-wave", kind: "training", alt: "ban — closed training" },
  man: { artId: "abstract-wave", kind: "training", alt: "man — closed training" },
  ang: { artId: "abstract-wave", kind: "training", alt: "ang — final-ng training" },
  bang: { artId: "abstract-wave", kind: "training", alt: "bang — closed training" },
  nha: { artId: "abstract-circle", kind: "training", alt: "nha — digraph training" },
  chá: { artId: "abstract-tone", kind: "training", alt: "chá — tone training" },
  chi: { artId: "abstract-circle", kind: "training", alt: "chi — digraph training" },
  chí: { artId: "abstract-tone", kind: "training", alt: "chí — tone training" },
  tha: { artId: "abstract-circle", kind: "training", alt: "tha — digraph training" },
  thá: { artId: "abstract-tone", kind: "training", alt: "thá — tone training" },
  pha: { artId: "abstract-circle", kind: "training", alt: "pha — digraph training" },
  kha: { artId: "abstract-circle", kind: "training", alt: "kha — digraph training" },
  nga: { artId: "abstract-circle", kind: "training", alt: "nga — digraph training" },
  âm: { artId: "abstract-wave", kind: "training", alt: "âm — vowel training" },
  bê: { artId: "abstract-circle", kind: "training", alt: "bê — vowel training" },
  cơ: { artId: "abstract-circle", kind: "training", alt: "cơ — vowel training" },
};

export function resolveWordArt(written?: string | null): WordArtEntry | null {
  if (!written) return null;
  const key = written.trim();
  return BY_WRITTEN[key] ?? null;
}

export function wordArtCoverage() {
  const entries = Object.entries(BY_WRITTEN);
  return {
    total: entries.length,
    vocab: entries.filter(([, e]) => e.kind === "vocab").length,
    training: entries.filter(([, e]) => e.kind === "training").length,
  };
}
