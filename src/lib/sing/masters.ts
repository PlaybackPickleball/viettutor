import { promises as fs } from "fs";
import path from "path";
import { parseSafeSongId } from "@/lib/karaoke/safeId";
import { resolveUnderRoot } from "@/lib/karaoke/store";
import type { SingSong } from "./types";

/** Non-public catalog masters — never place licensed audio under public/. */
export const MASTERS_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "sing",
  "masters",
);

const AUDIO_EXT = ["mp3", "wav", "m4a", "ogg"] as const;

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

function contentTypeFor(ext: string): string {
  if (ext === "wav") return "audio/wav";
  if (ext === "m4a") return "audio/mp4";
  if (ext === "ogg") return "audio/ogg";
  return "audio/mpeg";
}

function filenameFromAudioUrl(audioUrl: string | undefined): string | null {
  if (!audioUrl) return null;
  if (audioUrl.startsWith("master:")) {
    const name = audioUrl.slice("master:".length);
    return name.includes("/") || name.includes("..") ? null : name;
  }
  if (isPublicSingAssetPath(audioUrl)) {
    const base = audioUrl.split("?")[0]?.split("/").pop() ?? "";
    return base.includes("..") ? null : base || null;
  }
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*\.(mp3|wav|m4a|ogg)$/i.test(audioUrl)) {
    return audioUrl;
  }
  return null;
}

/** Resolve a catalog master file under data/sing/masters (no path escape). */
export async function resolveMasterFile(
  song: Pick<SingSong, "id" | "audioUrl">,
): Promise<{ absolutePath: string; contentType: string; filename: string } | null> {
  const songId = parseSafeSongId(song.id);
  if (!songId) return null;

  const candidates: string[] = [];
  const fromUrl = filenameFromAudioUrl(song.audioUrl);
  if (fromUrl) candidates.push(fromUrl);
  for (const ext of AUDIO_EXT) {
    candidates.push(`${songId}.${ext}`);
  }

  const seen = new Set<string>();
  for (const name of candidates) {
    if (seen.has(name)) continue;
    seen.add(name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(mp3|wav|m4a|ogg)$/i.test(name)) continue;
    try {
      const absolutePath = resolveUnderRoot(MASTERS_DIR, name);
      await fs.access(absolutePath);
      const ext = name.split(".").pop()!.toLowerCase();
      return { absolutePath, contentType: contentTypeFor(ext), filename: name };
    } catch {
      // try next
    }
  }
  return null;
}
