import type { LyricLine, LyricToken, SingSong } from "./types";

/** Deterministic active line from audio time (source of truth). */
export function findLineAt(lines: LyricLine[], t: number): LyricLine | null {
  if (!lines.length) return null;
  return lines.find((l) => t >= l.start && t < l.end) ?? null;
}

export function findTokenAt(
  lines: LyricLine[],
  t: number,
): { line: LyricLine; token: LyricToken } | null {
  for (const line of lines) {
    const token = line.tokens.find((x) => t >= x.start && t < x.end);
    if (token) return { line, token };
  }
  return null;
}

export function clampTime(song: SingSong, sec: number): number {
  return Math.max(0, Math.min(song.durationSec || 0, sec));
}

export function lineIndex(song: SingSong, lineId: string): number {
  return song.lines.findIndex((l) => l.id === lineId);
}
