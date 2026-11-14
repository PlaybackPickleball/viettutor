import { promises as fs } from "fs";
import path from "path";
import type { KaraokeSong } from "./types";
import { assertSafeSongId, parseSafeSongId } from "./safeId";

const ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "karaoke");
export const APPROVED_DIR = path.join(/* turbopackIgnore: true */ ROOT, "approved");
export const UPLOAD_DIR = path.join(/* turbopackIgnore: true */ ROOT, "uploads");
export const ALIGN_DIR = path.join(/* turbopackIgnore: true */ ROOT, "align");
export const STEMS_DIR = path.join(/* turbopackIgnore: true */ ROOT, "stems");

/** Resolve a path under `root`; rejects any escape via `..` or absolute segments. */
export function resolveUnderRoot(root: string, ...segments: string[]): string {
  const rootResolved = path.resolve(root);
  for (const seg of segments) {
    if (!seg || seg.includes("\0") || seg.includes("/") || seg.includes("\\") || seg === ".." || seg.includes("..")) {
      throw new Error("path_escape");
    }
  }
  const resolved = path.resolve(rootResolved, ...segments);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    throw new Error("path_escape");
  }
  return resolved;
}

export function approvedPath(songId: string): string {
  const id = assertSafeSongId(songId);
  return resolveUnderRoot(APPROVED_DIR, `${id}.json`);
}

export function uploadPath(songId: string, ext: string): string {
  const id = assertSafeSongId(songId);
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!["mp3", "wav", "m4a", "ogg"].includes(safeExt)) {
    throw new Error("unsupported_audio");
  }
  return resolveUnderRoot(UPLOAD_DIR, `${id}.${safeExt}`);
}

export function alignArtifactPath(songId: string, name: string): string {
  const id = assertSafeSongId(songId);
  if (!/^[a-z0-9._-]+$/i.test(name) || name.includes("..")) {
    throw new Error("path_escape");
  }
  return resolveUnderRoot(ALIGN_DIR, `${id}.${name}`);
}

export async function ensureKaraokeDirs(): Promise<void> {
  await fs.mkdir(APPROVED_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(ALIGN_DIR, { recursive: true });
  await fs.mkdir(STEMS_DIR, { recursive: true });
}

export async function readApprovedSong(songId: string): Promise<KaraokeSong | null> {
  const id = parseSafeSongId(songId);
  if (!id) return null;
  try {
    const raw = await fs.readFile(approvedPath(id), "utf8");
    return JSON.parse(raw) as KaraokeSong;
  } catch {
    return null;
  }
}

export async function writeApprovedSong(song: KaraokeSong): Promise<string> {
  const id = assertSafeSongId(song.id);
  await ensureKaraokeDirs();
  const file = approvedPath(id);
  const payload = { ...song, id };
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
  return file;
}

export async function listApprovedSongIds(): Promise<string[]> {
  try {
    const files = await fs.readdir(APPROVED_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .filter((id) => Boolean(parseSafeSongId(id)));
  } catch {
    return [];
  }
}
