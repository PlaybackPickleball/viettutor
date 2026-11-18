/**
 * Client-safe Sing master helpers (no Node fs).
 * Server file resolution lives in masters.server.ts.
 */

export function gatedAudioStreamUrl(
  songId: string,
  type: "audio_original" | "audio_instrumental" = "audio_original",
): string {
  return `/api/sing/stream?songId=${encodeURIComponent(songId)}&type=${type}`;
}

/** True if a URL is a static public path that must not be returned to clients. */
export function isPublicSingAssetPath(url: string | undefined | null): boolean {
  if (!url) return false;
  return /^\/sing\//i.test(url) || /^https?:\/\/[^/]+\/sing\//i.test(url);
}

/**
 * Rewrite any public /sing/* audio URL to the gated stream endpoint.
 * Safe for karaoke fixtures and approved JSON that still carry old paths.
 */
export function toGatedPlaybackUrl(songId: string, audioUrl?: string): string {
  if (!audioUrl || isPublicSingAssetPath(audioUrl) || audioUrl.startsWith("master:")) {
    return gatedAudioStreamUrl(songId, "audio_original");
  }
  if (audioUrl.startsWith("/api/sing/stream")) return audioUrl;
  if (audioUrl.startsWith("/api/sing/media/")) return audioUrl;
  // Relative filename / internal key → stream
  if (!audioUrl.startsWith("http") && !audioUrl.startsWith("blob:")) {
    return gatedAudioStreamUrl(songId, "audio_original");
  }
  return audioUrl;
}
