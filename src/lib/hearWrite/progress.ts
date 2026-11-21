import {
  HEAR_WRITE_LEVELS,
  itemsForLevel,
  type HearWriteLevelId,
} from "./combos";

const KEY = "ami-lingua.hear-write.v1";

export type HearWriteItemRecord = {
  correct: number;
  attempts: number;
  mastered: boolean;
  lastAt?: string;
};

export type HearWriteProgressState = {
  version: 1;
  /** Highest unlocked level (1–4). */
  unlockedLevel: HearWriteLevelId;
  items: Record<string, HearWriteItemRecord>;
  updatedAt: string;
};

export function defaultHearWriteProgress(): HearWriteProgressState {
  return {
    version: 1,
    unlockedLevel: 1,
    items: {},
    updatedAt: new Date().toISOString(),
  };
}

export function loadHearWriteProgress(): HearWriteProgressState {
  if (typeof window === "undefined") return defaultHearWriteProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultHearWriteProgress();
    const parsed = JSON.parse(raw) as Partial<HearWriteProgressState>;
    return {
      ...defaultHearWriteProgress(),
      ...parsed,
      version: 1,
      unlockedLevel: (parsed.unlockedLevel ?? 1) as HearWriteLevelId,
      items: parsed.items ?? {},
    };
  } catch {
    return defaultHearWriteProgress();
  }
}

export function saveHearWriteProgress(state: HearWriteProgressState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(next));
}

function recomputeUnlock(state: HearWriteProgressState): HearWriteLevelId {
  let unlocked: HearWriteLevelId = 1;
  for (const level of HEAR_WRITE_LEVELS) {
    if (level.id === 1) {
      unlocked = 1;
      continue;
    }
    const prev = itemsForLevel((level.id - 1) as HearWriteLevelId);
    const mastered = prev.filter((i) => state.items[i.id]?.mastered).length;
    const need = Math.max(3, Math.ceil(prev.length * 0.35));
    if (mastered >= need) unlocked = level.id;
    else break;
  }
  return unlocked;
}

/** Record a check. One correct answer masters the combo (dictation stamp). */
export function recordHearWriteAttempt(
  state: HearWriteProgressState,
  itemId: string,
  correct: boolean,
): HearWriteProgressState {
  const prev = state.items[itemId] ?? {
    correct: 0,
    attempts: 0,
    mastered: false,
  };
  const nextRec: HearWriteItemRecord = {
    correct: prev.correct + (correct ? 1 : 0),
    attempts: prev.attempts + 1,
    mastered: prev.mastered || correct,
    lastAt: new Date().toISOString(),
  };

  const next: HearWriteProgressState = {
    ...state,
    items: { ...state.items, [itemId]: nextRec },
  };
  next.unlockedLevel = recomputeUnlock(next);
  saveHearWriteProgress(next);
  return next;
}

export function levelMasteryCounts(state: HearWriteProgressState, level: HearWriteLevelId) {
  const items = itemsForLevel(level);
  const mastered = items.filter((i) => state.items[i.id]?.mastered).length;
  return { mastered, total: items.length };
}
