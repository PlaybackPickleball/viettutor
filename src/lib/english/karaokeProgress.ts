import type { KeyValueStore } from "@/lib/experience/store";
import type { SingMode } from "@/lib/sing/types";

export const ENGLISH_KARAOKE_KEY = "ami-lingua.en-karaoke.v1";

export type EnglishKaraokeState = {
  savedIds: string[];
  modes: Record<string, SingMode[]>;
};

const EMPTY: EnglishKaraokeState = { savedIds: [], modes: {} };

export function loadEnglishKaraoke(store: KeyValueStore): EnglishKaraokeState {
  try {
    const raw = store.getItem(ENGLISH_KARAOKE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<EnglishKaraokeState>;
    return {
      savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds.filter((id) => typeof id === "string") : [],
      modes: parsed.modes && typeof parsed.modes === "object" ? (parsed.modes as EnglishKaraokeState["modes"]) : {},
    };
  } catch {
    return EMPTY;
  }
}

export function saveEnglishKaraoke(store: KeyValueStore, state: EnglishKaraokeState) {
  store.setItem(ENGLISH_KARAOKE_KEY, JSON.stringify(state));
}

export function toggleSavedSong(store: KeyValueStore, songId: string): EnglishKaraokeState {
  const state = loadEnglishKaraoke(store);
  const savedIds = state.savedIds.includes(songId)
    ? state.savedIds.filter((id) => id !== songId)
    : [...state.savedIds, songId];
  const next = { ...state, savedIds };
  saveEnglishKaraoke(store, next);
  return next;
}

export function markKaraokeMode(store: KeyValueStore, songId: string, mode: SingMode): EnglishKaraokeState {
  const state = loadEnglishKaraoke(store);
  const prev = state.modes[songId] ?? [];
  const modes = prev.includes(mode) ? prev : [...prev, mode];
  const next = { ...state, modes: { ...state.modes, [songId]: modes } };
  saveEnglishKaraoke(store, next);
  return next;
}
