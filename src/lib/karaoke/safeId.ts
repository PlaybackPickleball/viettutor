/** Safe karaoke song ids: lowercase slug only (no path separators or `..`). */
const SONG_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseSafeSongId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toLowerCase();
  if (!id || id.length > 80) return null;
  if (!SONG_ID_RE.test(id)) return null;
  return id;
}

export function assertSafeSongId(raw: unknown): string {
  const id = parseSafeSongId(raw);
  if (!id) throw new Error("invalid_song_id");
  return id;
}
