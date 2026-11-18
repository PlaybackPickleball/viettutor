import { getKaraokeSong } from "@/lib/karaoke/catalog";
import { normalizeStoredMode } from "./modes";
import type { PracticeHistoryEntry, SingMode, SingProgress } from "./types";

const KEY = "ami-lingua.sing-progress.v1";
const HISTORY_KEY = "ami-lingua.sing-history.v1";
const SAVED_KEY = "ami-lingua.sing-saved.v1";

export function loadSingProgress(): Record<string, SingProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, SingProgress>;
    for (const p of Object.values(raw)) {
      p.modesCompleted = (p.modesCompleted || [])
        .map((m) => normalizeStoredMode(m)!)
        .filter(Boolean) as SingMode[];
      if (p.lastMode) p.lastMode = normalizeStoredMode(p.lastMode);
    }
    return raw;
  } catch {
    return {};
  }
}

export function getSongProgress(songId: string): SingProgress | null {
  return loadSingProgress()[songId] ?? null;
}

export function markSingMode(songId: string, mode: SingMode, extra?: Partial<SingProgress>) {
  if (typeof window === "undefined") return;
  const all = loadSingProgress();
  const prev = all[songId] ?? {
    songId,
    modesCompleted: [],
    vocabSaved: 0,
    updatedAt: new Date().toISOString(),
  };
  const modes = prev.modesCompleted.includes(mode)
    ? prev.modesCompleted
    : [...prev.modesCompleted, mode];
  all[songId] = {
    ...prev,
    ...extra,
    modesCompleted: modes,
    lastMode: mode,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function bumpSingVocab(songId: string) {
  const prev = getSongProgress(songId);
  markSingMode(songId, prev?.lastMode ?? "listen", {
    vocabSaved: (prev?.vocabSaved ?? 0) + 1,
  });
}

export function saveSongFavorite(songId: string, saved: boolean) {
  if (typeof window === "undefined") return;
  const ids = new Set(loadSavedSongIds());
  if (saved) ids.add(songId);
  else ids.delete(songId);
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
  markSingMode(songId, getSongProgress(songId)?.lastMode ?? "listen", { saved });
}

export function loadSavedSongIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function pushPracticeHistory(entry: Omit<PracticeHistoryEntry, "id" | "at">) {
  if (typeof window === "undefined") return;
  const list = loadPracticeHistory();
  list.unshift({
    ...entry,
    id: `ph-${Date.now()}`,
    at: new Date().toISOString(),
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 40)));
}

export function loadPracticeHistory(): PracticeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as PracticeHistoryEntry[];
  } catch {
    return [];
  }
}

/** Legacy SingPlayerClient tabs (non-karaoke / local). */
export const MODE_COUNT = 5;

/** KaraokeSongShell surfaces: Learn → Sing → Practice (stamped as understand/sing/speak). */
export const KARAOKE_MODE_COUNT = 3;
export const KARAOKE_MODE_IDS: SingMode[] = ["understand", "sing", "speak"];

export function isKaraokeCatalogSong(songId: string): boolean {
  return Boolean(getKaraokeSong(songId));
}

export function modeSlotCountForSong(songId: string): number {
  return isKaraokeCatalogSong(songId) ? KARAOKE_MODE_COUNT : MODE_COUNT;
}

/** Count only the karaoke Learn/Sing/Practice stamps for a song. */
export function karaokeModesCompletedCount(progress: SingProgress | null | undefined): number {
  if (!progress?.modesCompleted?.length) return 0;
  const set = new Set(progress.modesCompleted);
  return KARAOKE_MODE_IDS.filter((id) => set.has(id)).length;
}

export function modesCompletedDisplayCount(
  songId: string,
  progress: SingProgress | null | undefined,
): number {
  if (!progress) return 0;
  if (isKaraokeCatalogSong(songId)) return karaokeModesCompletedCount(progress);
  return progress.modesCompleted?.length ?? 0;
}

export function isSongModesComplete(
  songId: string,
  progress: SingProgress | null | undefined,
): boolean {
  return modesCompletedDisplayCount(songId, progress) >= modeSlotCountForSong(songId);
}
