import type { LyricLine, LyricToken } from "./types";

/**
 * Interchange format for a single timed karaoke line (user/agent supplied).
 * Example:
 * {
 *   "songId": "practice_001",
 *   "line": "Em yêu anh",
 *   "translation": "I love you",
 *   "start": 12.4,
 *   "end": 14.8,
 *   "words": [
 *     { "text": "Em", "english": "I", "start": 12.4, "end": 13.1 },
 *     { "text": "yêu", "english": "love", "start": 13.1, "end": 13.8 },
 *     { "text": "anh", "english": "you", "start": 13.8, "end": 14.8 }
 *   ]
 * }
 */
export type TimedWord = {
  text: string;
  english?: string;
  start: number;
  end: number;
};

export type TimedLyricLine = {
  songId: string;
  line: string;
  translation?: string;
  start: number;
  end: number;
  words: TimedWord[];
};

export type TimedLyricDocument = {
  songId: string;
  lines: TimedLyricLine[];
};

export function isTimedLyricLine(v: unknown): v is TimedLyricLine {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.songId === "string" &&
    typeof o.line === "string" &&
    typeof o.start === "number" &&
    typeof o.end === "number" &&
    Array.isArray(o.words)
  );
}

export function timedLineToLyricLine(tl: TimedLyricLine, index = 0): LyricLine {
  const tokens: LyricToken[] = (tl.words.length ? tl.words : [{ text: tl.line, start: tl.start, end: tl.end }]).map(
    (w, j) => ({
      id: `tl-${index}-${j}`,
      text: w.text,
      start: w.start,
      end: w.end,
      meaningEn: w.english || "",
    }),
  );
  return {
    id: `tl-${index}`,
    start: tl.start,
    end: tl.end,
    translationEn: tl.translation || "",
    tokens,
  };
}

export function lyricLineToTimedLine(line: LyricLine, songId: string): TimedLyricLine {
  return {
    songId,
    line: line.tokens.map((t) => t.text).join(" "),
    translation: line.translationEn,
    start: line.start,
    end: line.end,
    words: line.tokens.map((t) => ({
      text: t.text,
      english: t.meaningEn || undefined,
      start: t.start,
      end: t.end,
    })),
  };
}

/** Accept a single TimedLyricLine or { songId, lines: TimedLyricLine[] }. */
export function parseTimedLyricJson(raw: string): {
  songId: string;
  lines: LyricLine[];
  timed: TimedLyricLine[];
} {
  const data = JSON.parse(raw) as unknown;
  let timed: TimedLyricLine[] = [];
  let songId = "";

  if (Array.isArray(data)) {
    timed = data.filter(isTimedLyricLine);
    songId = timed[0]?.songId ?? "";
  } else if (isTimedLyricLine(data)) {
    timed = [data];
    songId = data.songId;
  } else if (data && typeof data === "object") {
    const doc = data as TimedLyricDocument & { songId?: string };
    if (Array.isArray(doc.lines)) {
      timed = doc.lines.filter(isTimedLyricLine);
      songId = doc.songId || timed[0]?.songId || "";
    }
  }

  if (!timed.length) {
    throw new Error("No timed lyric lines found in JSON");
  }

  return {
    songId,
    timed,
    lines: timed.map((tl, i) => timedLineToLyricLine(tl, i)),
  };
}

/** Sample practice line (original educational text — not from a commercial song). */
export const SAMPLE_TIMED_LINE: TimedLyricLine = {
  songId: "practice_001",
  line: "Em yêu anh",
  translation: "I love you",
  start: 12.4,
  end: 14.8,
  words: [
    { text: "Em", english: "I", start: 12.4, end: 13.1 },
    { text: "yêu", english: "love", start: 13.1, end: 13.8 },
    { text: "anh", english: "you", start: 13.8, end: 14.8 },
  ],
};
