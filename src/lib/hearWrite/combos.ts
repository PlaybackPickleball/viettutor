/**
 * Hear & Write curriculum — Southern Vietnamese sounds / vần from Nicola’s
 * notebook pages (IMG_0926, IMG_0927). Practice syllables (rimes + digraphs),
 * not full vocabulary sentences. Levels by grapheme length.
 */

export type HearWriteLevelId = 1 | 2 | 3 | 4;

export type HearWriteItem = {
  id: string;
  /** Written form the learner must produce. */
  written: string;
  /** TTS utterance (same as written for these drills). */
  listenText: string;
  level: HearWriteLevelId;
  /** Source notebook page tag for authorship. */
  source: "alphabet" | "notebook-0926" | "notebook-0927";
  noteEn?: string;
};

export type HearWriteLevel = {
  id: HearWriteLevelId;
  titleEn: string;
  titleVi: string;
  summaryEn: string;
};

/** Count Unicode grapheme clusters (handles ă, â, ê, ô, ơ, ư + tones if any). */
export function graphemeLength(text: string): number {
  const seg =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("vi", { granularity: "grapheme" })
      : null;
  if (seg) return [...seg.segment(text.normalize("NFC"))].length;
  return [...text.normalize("NFC")].length;
}

function item(
  written: string,
  source: HearWriteItem["source"],
  noteEn?: string,
): HearWriteItem {
  const nfc = written.normalize("NFC");
  const len = graphemeLength(nfc);
  const level = (len <= 1 ? 1 : len === 2 ? 2 : len === 3 ? 3 : 4) as HearWriteLevelId;
  return {
    id: `hw-${nfc}`,
    written: nfc,
    listenText: nfc,
    level,
    source,
    noteEn,
  };
}

/** Level 1 — single letters learners already meet on the alphabet path. */
const LEVEL_1_LETTERS = ["a", "ă", "â", "e", "ê", "i", "o", "ô", "ơ", "u", "ư", "b", "m", "n", "t", "h", "l", "c", "k", "v", "g", "p", "q", "r"];

/** IMG_0926 — digraphs + open/closed rimes (page 1). */
const NOTEBOOK_0926 = [
  "ch", "kh", "g", "gh", "ng", "ngh",
  "t", "th", "r", "tr", "nh",
  "ia", "ua", "ưa", "p", "ph", "q", "qu", "gi",
  "ao", "eo", "au", "êu", "âu", "iu", "ưu", "ai",
  "oi", "ôi", "ơi", "ui", "ưi", "ay", "ây", "ac",
  "ăc", "âc", "oc", "ôc", "uc", "ưc", "at", "ăt",
  "ât", "et", "êt", "it", "ot", "ôt", "ơt", "ut",
  "ưt", "an", "ăn", "ân", "en", "ên", "in", "on",
  "ôn", "ơn", "un", "ang", "ăng", "âng",
  "ong", "ông", "ung", "ưng", "ach",
  "êch", "ich", "am", "ăm", "âm",
];

/** IMG_0927 — more closed rimes + diphthong finals (page 2). */
const NOTEBOOK_0927 = [
  "em", "êm", "om", "ôm", "ơm",
  "im", "um", "ap", "ăp", "âp",
  "ep", "êp", "op", "ôp", "ơp",
  "ip", "up", "anh", "ênh", "inh",
  "ươu", "iêu", "yêu", "uôi", "ươi",
  "iêc", "uôc", "ươc", "iêt", "yêt",
  "uôt", "ươt", "iên", "yên", "uôn",
  "ươn", "iêng", "yêng", "uông", "ương",
  "iêm", "yêm", "uôm", "ươm", "iêp",
  "ươp",
];

function dedupe(items: HearWriteItem[]): HearWriteItem[] {
  const seen = new Set<string>();
  const out: HearWriteItem[] = [];
  for (const it of items) {
    if (seen.has(it.written)) continue;
    seen.add(it.written);
    out.push(it);
  }
  return out;
}

export const HEAR_WRITE_LEVELS: HearWriteLevel[] = [
  {
    id: 1,
    titleEn: "1 letter",
    titleVi: "1 chữ",
    summaryEn: "Hear one letter sound, then write it.",
  },
  {
    id: 2,
    titleEn: "2 letters",
    titleVi: "2 chữ",
    summaryEn: "Hear digraphs and short rimes (ch, th, an…).",
  },
  {
    id: 3,
    titleEn: "3 letters",
    titleVi: "3 chữ",
    summaryEn: "Hear longer rimes (ang, iêu, uôn…).",
  },
  {
    id: 4,
    titleEn: "4+ letters",
    titleVi: "4+ chữ",
    summaryEn: "Hear complex rimes (ươu, iêng, ương…).",
  },
];

export const HEAR_WRITE_ITEMS: HearWriteItem[] = dedupe([
  ...LEVEL_1_LETTERS.map((w) => item(w, "alphabet", "Alphabet foundations")),
  ...NOTEBOOK_0926.map((w) => item(w, "notebook-0926", "Notebook page 1")),
  ...NOTEBOOK_0927.map((w) => item(w, "notebook-0927", "Notebook page 2")),
]);

export function getHearWriteLevel(id: HearWriteLevelId): HearWriteLevel {
  return HEAR_WRITE_LEVELS.find((l) => l.id === id)!;
}

export function itemsForLevel(level: HearWriteLevelId): HearWriteItem[] {
  return HEAR_WRITE_ITEMS.filter((i) => i.level === level);
}

export function getHearWriteItem(id: string): HearWriteItem | undefined {
  return HEAR_WRITE_ITEMS.find((i) => i.id === id);
}

/** Normalize learner typing for check — NFC, trim, lowercase for Latin letters. */
export function normalizeHearWriteAnswer(raw: string): string {
  return raw.normalize("NFC").trim().toLowerCase().replace(/\s+/g, "");
}

export function answersMatch(expected: string, typed: string): boolean {
  return normalizeHearWriteAnswer(expected) === normalizeHearWriteAnswer(typed);
}
