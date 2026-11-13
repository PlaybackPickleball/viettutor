import { compoundKeysLongestFirst } from "./lexicon";
import type { TextSegment } from "./types";

/**
 * Vietnamese-aware light segmenter:
 * - Prefer known multi-syllable expressions (cà phê, nước dừa)
 * - Otherwise treat space-separated tokens as syllables
 * - Keep punctuation as its own chip
 */
export function segmentVietnamese(text: string): TextSegment[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const compounds = compoundKeysLongestFirst();
  const segments: TextSegment[] = [];
  let i = 0;
  let id = 0;

  const push = (raw: string, kind: TextSegment["kind"], expression: string, start: number) => {
    const end = start + raw.length;
    segments.push({
      id: `seg-${id++}`,
      text: raw,
      kind,
      expression,
      start,
      end,
    });
  };

  while (i < normalized.length) {
    const ch = normalized[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/[.,!?;:…""''()[\]{}]/.test(ch)) {
      push(ch, "punct", ch, i);
      i += 1;
      continue;
    }

    const restLower = normalized.slice(i).toLowerCase();
    let matched: string | null = null;
    for (const compound of compounds) {
      if (restLower.startsWith(compound)) {
        const after = restLower[compound.length];
        if (!after || /\s|[.,!?;:…""''()[\]{}]/.test(after)) {
          matched = normalized.slice(i, i + compound.length);
          break;
        }
      }
    }

    if (matched) {
      push(matched, "word", matched.replace(/[.,!?;:…]+$/g, "").trim(), i);
      i += matched.length;
      continue;
    }

    // Consume until whitespace or punctuation
    let j = i;
    while (j < normalized.length && !/\s|[.,!?;:…""''()[\]{}]/.test(normalized[j])) j += 1;
    const token = normalized.slice(i, j);
    push(token, "syllable", token, i);
    i = j;
  }

  return segments;
}

export function sentenceTranslationHint(text: string): string | null {
  const t = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (t.includes("tôi muốn uống nước dừa")) return "I want to drink coconut water.";
  if (t.includes("xin chào")) return "Hello.";
  if (t.includes("cảm ơn")) return "Thank you.";
  if (t.includes("tôi muốn")) return "I want…";
  return null;
}
