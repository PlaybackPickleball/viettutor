/**
 * Learn-the-Lyrics native sentence clips (spoken VO, not the karaoke master).
 * Ngày Mai Người Ta Lấy Chồng: Quang Toan ElevenLabs split into 37 line MP3s.
 */

export const LEARN_LINE_AUDIO_ENABLED = true;

/** Bump when replacing public learn-line MP3 bytes. */
export const LEARN_LINE_AUDIO_CACHE_VERSION = "ngaymai-qt-20261122";

const NGAY_MAI_SONG_ID = "ngay-mai-nguoi-ta-lay-chong";
const NGAY_MAI_LINE_COUNT = 37;

export type LearnLineClipRef = {
  songId: string;
  /** 1-based line index in karaoke JSON order. */
  lineIndex: number;
  path: string;
};

function pathForNgayMaiLine(lineIndex: number): string {
  const file = `line_${String(lineIndex).padStart(2, "0")}.mp3`;
  return `/audio/vi/karaoke/${NGAY_MAI_SONG_ID}/${file}?v=${LEARN_LINE_AUDIO_CACHE_VERSION}`;
}

/** True when this song has shipped learn-line native clips. */
export function songHasLearnLineAudio(songId: string): boolean {
  return LEARN_LINE_AUDIO_ENABLED && songId === NGAY_MAI_SONG_ID;
}

/**
 * Resolve native path for Learn-the-Lyrics Listen / Slow.
 * `lineIndex` is 0-based position in `song.lines`.
 */
export function learnLineNativePath(
  songId: string,
  lineIndex: number,
): string | null {
  if (!LEARN_LINE_AUDIO_ENABLED) return null;
  if (songId !== NGAY_MAI_SONG_ID) return null;
  const oneBased = lineIndex + 1;
  if (oneBased < 1 || oneBased > NGAY_MAI_LINE_COUNT) return null;
  return pathForNgayMaiLine(oneBased);
}

export function ngayMaiLearnLineCount(): number {
  return NGAY_MAI_LINE_COUNT;
}
