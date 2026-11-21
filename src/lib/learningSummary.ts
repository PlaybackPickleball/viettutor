/**
 * Aggregated learning progress across alphabet, Đánh Vần, vocab, and Sing.
 * Honest signals only — no invented tone/pronunciation accuracy %.
 */

import { ALL_LETTERS, LEVELS } from "@/lib/letters";
import {
  isLevelComplete,
  loadProgress,
  masteryCounts,
  practiceStreak,
  type ProgressState,
} from "@/lib/progress";
import { loadPhonicsProgress, phonicsMastery } from "@/lib/phonics";
import { loadPathProgress, pathMastery } from "@/lib/phonics/learningPath";
import { listKaraokeSongs } from "@/lib/karaoke/catalog";
import { getLearnLyricsProgress } from "@/lib/sing/learnLyrics/progress";
import {
  loadPracticeHistory,
  loadSingProgress,
  modeSlotCountForSong,
  modesCompletedDisplayCount,
} from "@/lib/sing/progress";
import { loadVocab } from "@/lib/vocab/store";
import {
  buildLastNDayActivity,
  countPracticedDays,
  type DayActivity,
} from "@/lib/practiceActivity";

export type ProgressSummary = {
  streakDays: number;
  minutesToday: number;
  practiceDates: string[];
  /** Last 7 UTC days — practiced if alphabet, Đánh Vần, or Sing history touched that day. */
  last7Days: DayActivity[];
  daysPracticedLast7: number;
  alphabet: {
    mastered: number;
    inProgress: number;
    total: number;
    levelsComplete: number;
    levelsTotal: number;
    saySetsFinished: number;
  };
  phonics: { completed: number; total: number; pct: number };
  vocab: { wordsSaved: number };
  sing: {
    songsTouched: number;
    modesCompletedTotal: number;
    modeSlots: number;
    vocabSaved: number;
  };
  learnLyrics: {
    songs: { songId: string; title: string; completed: number; total: number }[];
    sentencesCompleted: number;
    sentencesTotal: number;
  };
  pronunciation: {
    compareAttempts: number;
    lettersWithSayPractice: number;
    saySetsFinished: number;
    phonicsAttempts: number;
    note: string;
  };
};

export function buildProgressSummary(
  alphabetState?: ProgressState,
): ProgressSummary {
  const progress = alphabetState ?? loadProgress();
  const counts = masteryCounts(progress);
  const phonicsState = loadPhonicsProgress();
  const pathState = loadPathProgress();
  const vocab = loadVocab();
  const sing = loadSingProgress();
  const karaoke = listKaraokeSongs();

  let modesCompletedTotal = 0;
  let modeSlots = 0;
  let vocabSaved = 0;
  let songsTouched = 0;
  for (const [songId, p] of Object.entries(sing)) {
    if (!(p.modesCompleted?.length || p.vocabSaved)) continue;
    songsTouched += 1;
    modesCompletedTotal += modesCompletedDisplayCount(songId, p);
    modeSlots += modeSlotCountForSong(songId);
    vocabSaved += p.vocabSaved ?? 0;
  }

  const learnSongs = karaoke.map((s) => {
    const lp = getLearnLyricsProgress(s.id);
    return {
      songId: s.id,
      title: s.title,
      completed: lp.completedLineIds.length,
      total: s.lines.length,
    };
  });
  const sentencesCompleted = learnSongs.reduce((a, s) => a + s.completed, 0);
  const sentencesTotal = learnSongs.reduce((a, s) => a + s.total, 0);

  let saySetsFinished = 0;
  let compareAttempts = 0;
  let lettersWithSayPractice = 0;
  for (const letter of ALL_LETTERS) {
    const p = progress.letters[letter.id];
    if (!p) continue;
    if (p.sayMastered) saySetsFinished += 1;
    compareAttempts += p.attempts ?? 0;
    if ((p.attempts ?? 0) > 0 || (p.sayQualities?.length ?? 0) > 0) {
      lettersWithSayPractice += 1;
    }
  }

  const levelsComplete = LEVELS.filter((l) => isLevelComplete(progress, l.id)).length;
  const classicAttempts = Object.values(phonicsState.attemptsByLesson ?? {}).reduce(
    (a, n) => a + (typeof n === "number" ? n : 0),
    0,
  );
  const pathAttempts = Object.values(pathState.lessons ?? {}).reduce(
    (a, rec) => a + (rec.attempts ?? 0),
    0,
  );
  const phonicsAttempts = classicAttempts + pathAttempts;

  const pathDays = pathState.lastPracticeDate ? [pathState.lastPracticeDate] : [];
  const singHistoryDays = loadPracticeHistory().map((h) => h.at);
  const last7Days = buildLastNDayActivity([
    progress.practiceDates,
    phonicsState.practiceDates ?? [],
    pathDays,
    singHistoryDays,
  ]);

  const pathPhonics = pathMastery(pathState);
  const phonics =
    pathPhonics.total > 0 ? pathPhonics : phonicsMastery(phonicsState);

  return {
    streakDays: Math.max(practiceStreak(progress), pathState.streakDays),
    minutesToday: progress.minutesToday,
    practiceDates: progress.practiceDates,
    last7Days,
    daysPracticedLast7: countPracticedDays(last7Days),
    alphabet: {
      mastered: counts.mastered,
      inProgress: counts.inProgress,
      total: counts.total,
      levelsComplete,
      levelsTotal: LEVELS.length,
      saySetsFinished,
    },
    phonics,
    vocab: { wordsSaved: vocab.length },
    sing: {
      songsTouched,
      modesCompletedTotal,
      modeSlots,
      vocabSaved,
    },
    learnLyrics: {
      songs: learnSongs,
      sentencesCompleted,
      sentencesTotal,
    },
    pronunciation: {
      compareAttempts,
      lettersWithSayPractice,
      saySetsFinished,
      phonicsAttempts,
      note: "Compare/replay attempts only — Deepgram match when configured; no invented pronunciation score.",
    },
  };
}
