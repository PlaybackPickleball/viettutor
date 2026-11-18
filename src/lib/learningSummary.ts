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
import { listKaraokeSongs } from "@/lib/karaoke/catalog";
import { getLearnLyricsProgress } from "@/lib/sing/learnLyrics/progress";
import { loadSingProgress, MODE_COUNT } from "@/lib/sing/progress";
import { loadVocab } from "@/lib/vocab/store";

export type ProgressSummary = {
  streakDays: number;
  minutesToday: number;
  practiceDates: string[];
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
  const vocab = loadVocab();
  const sing = loadSingProgress();
  const karaoke = listKaraokeSongs();

  let modesCompletedTotal = 0;
  let vocabSaved = 0;
  let songsTouched = 0;
  for (const p of Object.values(sing)) {
    if (p.modesCompleted?.length || p.vocabSaved) songsTouched += 1;
    modesCompletedTotal += p.modesCompleted?.length ?? 0;
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
  const phonicsAttempts = Object.values(phonicsState.attemptsByLesson ?? {}).reduce(
    (a, n) => a + (typeof n === "number" ? n : 0),
    0,
  );

  return {
    streakDays: practiceStreak(progress),
    minutesToday: progress.minutesToday,
    practiceDates: progress.practiceDates,
    alphabet: {
      mastered: counts.mastered,
      inProgress: counts.inProgress,
      total: counts.total,
      levelsComplete,
      levelsTotal: LEVELS.length,
      saySetsFinished,
    },
    phonics: phonicsMastery(phonicsState),
    vocab: { wordsSaved: vocab.length },
    sing: {
      songsTouched,
      modesCompletedTotal,
      modeSlots: Math.max(MODE_COUNT, songsTouched * MODE_COUNT),
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
      note: "Compare/replay attempts only — no automatic accuracy score until Azure is validated.",
    },
  };
}
