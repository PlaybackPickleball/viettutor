import type { MasteryState } from "./types";

/** Hard caps for server sync — First 100 pack is 100 words; leave headroom. */
export const MAX_MASTERY_WORDS = 200;
export const MAX_MASTERY_LESSONS = 64;
export const MAX_MASTERY_LEDGER = 500;
export const MAX_MASTERY_BODY_BYTES = 256 * 1024;

export type MasteryLimitError =
  | "too_many_words"
  | "too_many_lessons"
  | "too_many_ledger"
  | "invalid_mastery_state";

export function assertMasteryStateLimits(
  state: MasteryState,
): { ok: true } | { ok: false; error: MasteryLimitError } {
  if (!state || state.version !== 1 || typeof state.words !== "object" || state.words === null) {
    return { ok: false, error: "invalid_mastery_state" };
  }
  if (!Array.isArray(state.completedLessonIds) || !Array.isArray(state.xpLedger)) {
    return { ok: false, error: "invalid_mastery_state" };
  }
  if (Object.keys(state.words).length > MAX_MASTERY_WORDS) {
    return { ok: false, error: "too_many_words" };
  }
  if (state.completedLessonIds.length > MAX_MASTERY_LESSONS) {
    return { ok: false, error: "too_many_lessons" };
  }
  if (state.xpLedger.length > MAX_MASTERY_LEDGER) {
    return { ok: false, error: "too_many_ledger" };
  }
  return { ok: true };
}
