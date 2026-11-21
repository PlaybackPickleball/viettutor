/**
 * Vietnamese speech-check attempt history (local).
 * Stores transcription match outcomes — never invents pronunciation scores.
 * Tone scores stay null until a specialized model is validated.
 */

import type { ViAssessStatus } from "./feedback";

export type AssessmentConfidence = ViAssessStatus | "scored";

export type PronunciationAttempt = {
  userId: string;
  itemId: string;
  expectedText: string;
  dialect: "southern" | "northern";
  attemptedAt: string;
  /** Always null for Deepgram path — not a pronunciation score. */
  accuracyScore: number | null;
  /** Always null for Deepgram path — not a pronunciation score. */
  overallScore: number | null;
  toneScore: number | null;
  match: boolean | null;
  recognizedText: string | null;
  status: AssessmentConfidence;
  bestPreviousOverall: number | null;
};

export type ItemPronunciationSummary = {
  itemId: string;
  expectedText: string;
  dialect: "southern" | "northern";
  latest: PronunciationAttempt | null;
  bestOverall: number | null;
  bestAccuracy: number | null;
  attemptCount: number;
  matchCount: number;
  improvement: number | null;
};

const STORAGE_KEY = "ami-lingua.vi-pronunciation.v1";

type Store = {
  userId: string;
  attempts: PronunciationAttempt[];
};

function emptyStore(userId = "local"): Store {
  return { userId, attempts: [] };
}

export function loadAssessmentStore(userId = "local"): Store {
  if (typeof window === "undefined") return emptyStore(userId);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore(userId);
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      userId: parsed.userId || userId,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    };
  } catch {
    return emptyStore(userId);
  }
}

function saveStore(store: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function recordPronunciationAttempt(args: {
  userId?: string;
  itemId: string;
  expectedText: string;
  dialect?: "southern" | "northern";
  accuracyScore: number | null;
  overallScore: number | null;
  toneScore?: number | null;
  match?: boolean | null;
  recognizedText?: string | null;
  status: AssessmentConfidence;
}): PronunciationAttempt {
  const userId = args.userId ?? "local";
  const store = loadAssessmentStore(userId);
  const prior = store.attempts.filter((a) => a.itemId === args.itemId);
  const scored = prior
    .map((a) => a.overallScore)
    .filter((n): n is number => typeof n === "number");
  const bestPreviousOverall = scored.length ? Math.max(...scored) : null;

  const attempt: PronunciationAttempt = {
    userId,
    itemId: args.itemId,
    expectedText: args.expectedText,
    dialect: args.dialect ?? "southern",
    attemptedAt: new Date().toISOString(),
    accuracyScore: args.accuracyScore,
    overallScore: args.overallScore,
    toneScore: args.toneScore ?? null,
    match: args.match ?? null,
    recognizedText: args.recognizedText ?? null,
    status: args.status,
    bestPreviousOverall,
  };

  const next: Store = {
    userId,
    attempts: [...store.attempts, attempt].slice(-500),
  };
  saveStore(next);
  return attempt;
}

export function summarizeItem(
  itemId: string,
  userId = "local",
): ItemPronunciationSummary {
  const store = loadAssessmentStore(userId);
  const attempts = store.attempts.filter((a) => a.itemId === itemId);
  const latest = attempts[attempts.length - 1] ?? null;
  const overalls = attempts
    .map((a) => a.overallScore)
    .filter((n): n is number => typeof n === "number");
  const accuracies = attempts
    .map((a) => a.accuracyScore)
    .filter((n): n is number => typeof n === "number");
  const matchCount = attempts.filter((a) => a.match === true).length;
  const bestOverall = overalls.length ? Math.max(...overalls) : null;
  const bestAccuracy = accuracies.length ? Math.max(...accuracies) : null;
  const first = overalls[0] ?? null;
  const improvement =
    first != null && latest?.overallScore != null
      ? latest.overallScore - first
      : null;

  return {
    itemId,
    expectedText: latest?.expectedText ?? "",
    dialect: latest?.dialect ?? "southern",
    latest,
    bestOverall,
    bestAccuracy,
    attemptCount: attempts.length,
    matchCount,
    improvement,
  };
}
