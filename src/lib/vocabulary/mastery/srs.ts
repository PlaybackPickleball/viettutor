import {
  SRS_INTERVALS_DAYS,
  type MasteryStatus,
  type SkillKind,
  type WordMasteryRecord,
} from "./types";

function utcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysUtc(isoDate: string, days: number): string {
  const [y, m, day] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateString(d);
}

export function todayUtc(now = new Date()): string {
  return utcDateString(now);
}

export function defaultWordRecord(vocabularyId: string): WordMasteryRecord {
  return {
    vocabularyId,
    introducedAt: null,
    lessonCompletedAt: null,
    attempts: 0,
    correctFirstAttempts: 0,
    typingAttempts: 0,
    typingCorrect: 0,
    listeningAttempts: 0,
    listeningCorrect: 0,
    recognitionAttempts: 0,
    recognitionCorrect: 0,
    pronunciationAttempts: 0,
    pronunciationCorrect: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    reviewIntervalDays: 0,
    consecutiveSuccesses: 0,
    masteryStatus: "New",
  };
}

export function deriveMasteryStatus(rec: WordMasteryRecord): MasteryStatus {
  if (rec.attempts === 0 && !rec.lessonCompletedAt) return "New";
  if (rec.reviewIntervalDays >= 30 && rec.consecutiveSuccesses >= 4) return "Mastered";
  if (rec.reviewIntervalDays >= 7 || rec.consecutiveSuccesses >= 2) return "Familiar";
  if (rec.attempts > 0 || rec.lessonCompletedAt) return "Learning";
  return "New";
}

function bumpSkill(rec: WordMasteryRecord, skill: SkillKind, correct: boolean): void {
  const attKey = `${skill}Attempts` as const;
  const corKey = `${skill}Correct` as const;
  // Map skill → field names
  if (skill === "typing") {
    rec.typingAttempts += 1;
    if (correct) rec.typingCorrect += 1;
  } else if (skill === "listening") {
    rec.listeningAttempts += 1;
    if (correct) rec.listeningCorrect += 1;
  } else if (skill === "recognition") {
    rec.recognitionAttempts += 1;
    if (correct) rec.recognitionCorrect += 1;
  } else {
    rec.pronunciationAttempts += 1;
    if (correct) rec.pronunciationCorrect += 1;
  }
  void attKey;
  void corKey;
}

/**
 * Apply one graded attempt. On success: advance SRS ladder.
 * On miss: shorten interval (halve, min 1 day) and reset consecutive successes.
 */
export function applyReviewResult(
  rec: WordMasteryRecord,
  correct: boolean,
  skill: SkillKind,
  now = new Date(),
): WordMasteryRecord {
  const next: WordMasteryRecord = { ...rec };
  const wasFirst = next.attempts === 0;
  next.attempts += 1;
  if (correct && wasFirst) next.correctFirstAttempts += 1;
  bumpSkill(next, skill, correct);

  const today = todayUtc(now);
  next.lastReviewedAt = now.toISOString();

  if (correct) {
    next.consecutiveSuccesses += 1;
    const ladder = SRS_INTERVALS_DAYS;
    let idx = ladder.findIndex((d) => d > next.reviewIntervalDays);
    if (idx < 0) idx = ladder.length - 1;
    // First success from 0 → 1 day
    if (next.reviewIntervalDays === 0) idx = 0;
    else if (next.reviewIntervalDays >= ladder[ladder.length - 1]) idx = ladder.length - 1;
    else {
      const cur = ladder.findIndex((d) => d === next.reviewIntervalDays);
      idx = cur >= 0 ? Math.min(cur + 1, ladder.length - 1) : idx;
    }
    next.reviewIntervalDays = ladder[idx]!;
    next.nextReviewAt = addDaysUtc(today, next.reviewIntervalDays);
  } else {
    next.consecutiveSuccesses = 0;
    next.reviewIntervalDays = Math.max(1, Math.floor(next.reviewIntervalDays / 2) || 1);
    next.nextReviewAt = addDaysUtc(today, next.reviewIntervalDays);
  }

  next.masteryStatus = deriveMasteryStatus(next);
  return next;
}

/** Words due for review: nextReviewAt <= today, and introduced/completed. */
export function isDue(rec: WordMasteryRecord, today = todayUtc()): boolean {
  if (!rec.nextReviewAt) return false;
  return rec.nextReviewAt <= today;
}

export function markIntroduced(rec: WordMasteryRecord, now = new Date()): WordMasteryRecord {
  if (rec.introducedAt) return rec;
  return {
    ...rec,
    introducedAt: now.toISOString(),
    masteryStatus: deriveMasteryStatus({ ...rec, introducedAt: now.toISOString() }),
  };
}

export function markLessonCompleted(rec: WordMasteryRecord, now = new Date()): WordMasteryRecord {
  const today = todayUtc(now);
  const next = {
    ...rec,
    lessonCompletedAt: rec.lessonCompletedAt ?? now.toISOString(),
    introducedAt: rec.introducedAt ?? now.toISOString(),
  };
  if (!next.nextReviewAt) {
    next.reviewIntervalDays = SRS_INTERVALS_DAYS[0];
    next.nextReviewAt = addDaysUtc(today, next.reviewIntervalDays);
  }
  next.masteryStatus = deriveMasteryStatus(next);
  return next;
}
