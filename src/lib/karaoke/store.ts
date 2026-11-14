import { promises as fs } from "fs";
import path from "path";
import type { KaraokeSong } from "./types";

const ROOT = path.join(process.cwd(), "data", "karaoke");
export const APPROVED_DIR = path.join(ROOT, "approved");
export const UPLOAD_DIR = path.join(ROOT, "uploads");
export const ALIGN_DIR = path.join(ROOT, "align");

export function approvedPath(songId: string): string {
  return path.join(APPROVED_DIR, `${songId}.json`);
}

export async function ensureKaraokeDirs(): Promise<void> {
  await fs.mkdir(APPROVED_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(ALIGN_DIR, { recursive: true });
  await fs.mkdir(path.join(ROOT, "stems"), { recursive: true });
}

export async function readApprovedSong(songId: string): Promise<KaraokeSong | null> {
  try {
    const raw = await fs.readFile(approvedPath(songId), "utf8");
    return JSON.parse(raw) as KaraokeSong;
  } catch {
    return null;
  }
}

export async function writeApprovedSong(song: KaraokeSong): Promise<string> {
  await ensureKaraokeDirs();
  const file = approvedPath(song.id);
  await fs.writeFile(file, JSON.stringify(song, null, 2), "utf8");
  return file;
}

export async function listApprovedSongIds(): Promise<string[]> {
  try {
    const files = await fs.readdir(APPROVED_DIR);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}
