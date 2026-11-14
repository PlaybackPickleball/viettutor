import type { LyricLine, LyricToken } from "./types";

const KEY = "ami-lingua.sing-local-lyrics.v1";

export type LocalLyricDraft = {
  songId: string;
  /** User-supplied Vietnamese text (one line per lyric line) */
  rawVi: string;
  /** Optional English (one line per lyric line) */
  rawEn: string;
  lines: LyricLine[];
  updatedAt: string;
};

function loadAll(): Record<string, LocalLyricDraft> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, LocalLyricDraft>;
  } catch {
    return {};
  }
}

function saveAll(all: Record<string, LocalLyricDraft>) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getLocalLyrics(songId: string): LocalLyricDraft | null {
  return loadAll()[songId] ?? null;
}

export function saveLocalLyrics(draft: LocalLyricDraft) {
  const all = loadAll();
  all[draft.songId] = { ...draft, updatedAt: new Date().toISOString() };
  saveAll(all);
}

export function clearLocalLyrics(songId: string) {
  const all = loadAll();
  delete all[songId];
  saveAll(all);
}

/**
 * Build unsynced lines from user-supplied text.
 * Tokens = space-separated syllables/words; timings start at 0 until marked.
 */
export function parseUserLyricText(
  rawVi: string,
  rawEn: string,
  durationSec = 0,
): LyricLine[] {
  const viLines = rawVi
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const enLines = rawEn
    .split(/\r?\n/)
    .map((l) => l.trim());

  if (!viLines.length) return [];

  const n = viLines.length;
  const slot = durationSec > 0 ? durationSec / n : 2;

  return viLines.map((text, i) => {
    const start = i * slot;
    const end = (i + 1) * slot;
    const parts = text.split(/\s+/).filter(Boolean);
    const tokDur = parts.length ? (end - start) / parts.length : end - start;
    const tokens: LyricToken[] = parts.map((p, j) => ({
      id: `u-${i}-${j}`,
      text: p,
      start: start + j * tokDur,
      end: start + (j + 1) * tokDur,
      meaningEn: "",
    }));
    return {
      id: `ul-${i}`,
      start,
      end,
      translationEn: enLines[i] || "",
      tokens: tokens.length
        ? tokens
        : [
            {
              id: `u-${i}-0`,
              text,
              start,
              end,
              meaningEn: "",
            },
          ],
    };
  });
}

/** Redistribute token timings evenly within a line after start/end change. */
export function redistributeTokens(line: LyricLine): LyricLine {
  const tokens = line.tokens;
  if (!tokens.length) return line;
  const span = Math.max(0.05, line.end - line.start);
  const step = span / tokens.length;
  return {
    ...line,
    tokens: tokens.map((t, i) => ({
      ...t,
      start: line.start + i * step,
      end: line.start + (i + 1) * step,
    })),
  };
}

export function markLineStart(lines: LyricLine[], lineId: string, t: number): LyricLine[] {
  return lines.map((l) => {
    if (l.id !== lineId) return l;
    const end = Math.max(t + 0.2, l.end);
    return redistributeTokens({ ...l, start: Math.max(0, t), end });
  });
}

export function markLineEnd(lines: LyricLine[], lineId: string, t: number): LyricLine[] {
  return lines.map((l) => {
    if (l.id !== lineId) return l;
    const end = Math.max(l.start + 0.2, t);
    return redistributeTokens({ ...l, end });
  });
}

export function updateTokenMeaning(
  lines: LyricLine[],
  tokenId: string,
  meaningEn: string,
): LyricLine[] {
  return lines.map((l) => ({
    ...l,
    tokens: l.tokens.map((t) => (t.id === tokenId ? { ...t, meaningEn } : t)),
  }));
}
