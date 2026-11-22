import { sql } from "@/lib/db";
import { assertMasteryStateLimits } from "./limits";
import type { MasteryState, MasteryStatus, WordMasteryRecord, XpLedgerEntry } from "./types";

type WordRow = {
  vocabulary_id: string;
  introduced_at: string | null;
  lesson_completed_at: string | null;
  attempts: number;
  correct_first_attempts: number;
  typing_attempts: number;
  typing_correct: number;
  listening_attempts: number;
  listening_correct: number;
  recognition_attempts: number;
  recognition_correct: number;
  pronunciation_attempts: number;
  pronunciation_correct: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  review_interval_days: number;
  consecutive_successes: number;
  mastery_status: string;
};

type MetaRow = {
  completed_lesson_ids: unknown;
  total_xp: number;
  updated_at: string;
};

type LedgerRow = {
  event_key: string;
  amount: number;
  reason: string;
  created_at: string;
};

function rowToWord(r: WordRow): WordMasteryRecord {
  return {
    vocabularyId: r.vocabulary_id,
    introducedAt: r.introduced_at,
    lessonCompletedAt: r.lesson_completed_at,
    attempts: r.attempts,
    correctFirstAttempts: r.correct_first_attempts,
    typingAttempts: r.typing_attempts,
    typingCorrect: r.typing_correct,
    listeningAttempts: r.listening_attempts,
    listeningCorrect: r.listening_correct,
    recognitionAttempts: r.recognition_attempts,
    recognitionCorrect: r.recognition_correct,
    pronunciationAttempts: r.pronunciation_attempts,
    pronunciationCorrect: r.pronunciation_correct,
    lastReviewedAt: r.last_reviewed_at,
    nextReviewAt: r.next_review_at ? String(r.next_review_at).slice(0, 10) : null,
    reviewIntervalDays: r.review_interval_days,
    consecutiveSuccesses: r.consecutive_successes,
    masteryStatus: (r.mastery_status as MasteryStatus) || "New",
  };
}

export async function loadMasteryForUser(userId: string): Promise<MasteryState> {
  const [words, metaRows, ledger] = await Promise.all([
    sql<WordRow>(`select * from vocab_word_mastery where user_id = $1`, [userId]),
    sql<MetaRow>(`select completed_lesson_ids, total_xp, updated_at from vocab_user_meta where user_id = $1`, [
      userId,
    ]),
    sql<LedgerRow>(`select event_key, amount, reason, created_at from vocab_xp_ledger where user_id = $1`, [
      userId,
    ]),
  ]);

  const meta = metaRows[0];
  const completedLessonIds = Array.isArray(meta?.completed_lesson_ids)
    ? (meta!.completed_lesson_ids as string[])
    : typeof meta?.completed_lesson_ids === "string"
      ? (JSON.parse(meta.completed_lesson_ids) as string[])
      : [];

  const wordMap: Record<string, WordMasteryRecord> = {};
  for (const r of words) wordMap[r.vocabulary_id] = rowToWord(r);

  const xpLedger: XpLedgerEntry[] = ledger.map((e) => ({
    eventKey: e.event_key,
    amount: e.amount,
    reason: e.reason,
    createdAt: e.created_at,
  }));

  return {
    version: 1,
    words: wordMap,
    completedLessonIds,
    xpLedger,
    totalXp: meta?.total_xp ?? xpLedger.reduce((s, e) => s + e.amount, 0),
    updatedAt: meta?.updated_at ?? new Date(0).toISOString(),
  };
}

export async function saveMasteryForUser(userId: string, state: MasteryState): Promise<void> {
  const limits = assertMasteryStateLimits(state);
  if (!limits.ok) {
    throw new Error(`mastery_limits:${limits.error}`);
  }

  await sql(
    `insert into vocab_user_meta (user_id, completed_lesson_ids, total_xp, updated_at)
     values ($1, $2::jsonb, $3, $4)
     on conflict (user_id) do update set
       completed_lesson_ids = excluded.completed_lesson_ids,
       total_xp = excluded.total_xp,
       updated_at = excluded.updated_at`,
    [userId, JSON.stringify(state.completedLessonIds), state.totalXp, state.updatedAt],
  );

  for (const rec of Object.values(state.words)) {
    await sql(
      `insert into vocab_word_mastery (
        user_id, vocabulary_id, introduced_at, lesson_completed_at,
        attempts, correct_first_attempts,
        typing_attempts, typing_correct, listening_attempts, listening_correct,
        recognition_attempts, recognition_correct, pronunciation_attempts, pronunciation_correct,
        last_reviewed_at, next_review_at, review_interval_days, consecutive_successes,
        mastery_status, updated_at
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )
      on conflict (user_id, vocabulary_id) do update set
        introduced_at = excluded.introduced_at,
        lesson_completed_at = excluded.lesson_completed_at,
        attempts = excluded.attempts,
        correct_first_attempts = excluded.correct_first_attempts,
        typing_attempts = excluded.typing_attempts,
        typing_correct = excluded.typing_correct,
        listening_attempts = excluded.listening_attempts,
        listening_correct = excluded.listening_correct,
        recognition_attempts = excluded.recognition_attempts,
        recognition_correct = excluded.recognition_correct,
        pronunciation_attempts = excluded.pronunciation_attempts,
        pronunciation_correct = excluded.pronunciation_correct,
        last_reviewed_at = excluded.last_reviewed_at,
        next_review_at = excluded.next_review_at,
        review_interval_days = excluded.review_interval_days,
        consecutive_successes = excluded.consecutive_successes,
        mastery_status = excluded.mastery_status,
        updated_at = excluded.updated_at`,
      [
        userId,
        rec.vocabularyId,
        rec.introducedAt,
        rec.lessonCompletedAt,
        rec.attempts,
        rec.correctFirstAttempts,
        rec.typingAttempts,
        rec.typingCorrect,
        rec.listeningAttempts,
        rec.listeningCorrect,
        rec.recognitionAttempts,
        rec.recognitionCorrect,
        rec.pronunciationAttempts,
        rec.pronunciationCorrect,
        rec.lastReviewedAt,
        rec.nextReviewAt,
        rec.reviewIntervalDays,
        rec.consecutiveSuccesses,
        rec.masteryStatus,
        state.updatedAt,
      ],
    );
  }

  for (const entry of state.xpLedger) {
    await sql(
      `insert into vocab_xp_ledger (user_id, event_key, amount, reason, created_at)
       values ($1, $2, $3, $4, $5)
       on conflict (user_id, event_key) do nothing`,
      [userId, entry.eventKey, entry.amount, entry.reason, entry.createdAt],
    );
  }
}
