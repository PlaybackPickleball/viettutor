import type { KaraokeSong, LyricLine, LyricToken } from "./types";
import { wordFillProgress } from "./types";

export function findLineAtMs(lines: LyricLine[], tMs: number): LyricLine | null {
  if (!lines.length) return null;
  const hit = lines.find((l) => tMs >= l.startMs && tMs < l.endMs);
  if (hit) return hit;
  // Instrumental / pause: stay on last started line until the next begins
  let last: LyricLine | null = null;
  for (const l of lines) {
    if (tMs >= l.startMs) last = l;
    else break;
  }
  return last;
}

export function findLineIndex(lines: LyricLine[], lineId: string | undefined): number {
  if (!lineId) return -1;
  return lines.findIndex((l) => l.id === lineId);
}

/**
 * Phrase to repeat for practice:
 * - If playhead is well into the current line → that line
 * - If still near the line start → previous line (so “last sentence” rewinds)
 */
export function phraseForRewind(
  lines: LyricLine[],
  tMs: number,
  nearStartMs = 500,
): LyricLine | null {
  const current = findLineAtMs(lines, tMs);
  if (!current) return lines[0] ?? null;
  const idx = findLineIndex(lines, current.id);
  if (idx < 0) return current;
  if (tMs - current.startMs < nearStartMs && idx > 0) {
    return lines[idx - 1] ?? current;
  }
  return current;
}

export function adjacentLine(
  lines: LyricLine[],
  lineId: string | undefined,
  delta: -1 | 1,
): LyricLine | null {
  const idx = findLineIndex(lines, lineId);
  if (idx < 0) return null;
  return lines[idx + delta] ?? null;
}

export function findTokenAtMs(
  lines: LyricLine[],
  tMs: number,
): { line: LyricLine; token: LyricToken } | null {
  for (const line of lines) {
    const token = line.tokens.find((x) => tMs >= x.startMs && tMs < x.endMs);
    if (token) return { line, token };
  }
  return null;
}

export function activeFill(
  song: KaraokeSong,
  tMs: number,
): {
  line: LyricLine | null;
  token: LyricToken | null;
  progress: number;
} {
  const hit = findTokenAtMs(song.lines, tMs);
  if (!hit) {
    return { line: findLineAtMs(song.lines, tMs), token: null, progress: 0 };
  }
  return {
    line: hit.line,
    token: hit.token,
    progress: wordFillProgress(tMs, hit.token.startMs, hit.token.endMs),
  };
}

/** Phrase-level English: group consecutive tokens sharing phraseGroupId. */
export function phraseGlosses(line: LyricLine): { id: string; textEn: string; tokenIds: string[] }[] {
  const out: { id: string; textEn: string; tokenIds: string[] }[] = [];
  let i = 0;
  while (i < line.tokens.length) {
    const tok = line.tokens[i];
    if (tok.phraseGroupId) {
      const groupId = tok.phraseGroupId;
      const members = [tok];
      let j = i + 1;
      while (j < line.tokens.length && line.tokens[j].phraseGroupId === groupId) {
        members.push(line.tokens[j]);
        j++;
      }
      out.push({
        id: groupId,
        textEn: members[0].contextualEnglish,
        tokenIds: members.map((m) => m.id),
      });
      i = j;
    } else {
      out.push({
        id: tok.id,
        textEn: tok.contextualEnglish,
        tokenIds: [tok.id],
      });
      i++;
    }
  }
  return out;
}
