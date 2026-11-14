import type { SingMode, SingProgress } from "./types";

const KEY = "ami-lingua.sing-progress.v1";

export function loadSingProgress(): Record<string, SingProgress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, SingProgress>;
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
