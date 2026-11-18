"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { usePracticeClock } from "@/hooks/usePracticeClock";
import { buildProgressSummary, type ProgressSummary } from "@/lib/learningSummary";
import { loadViOnboarding } from "@/lib/viOnboarding";

export function ProgressClient() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  usePracticeClock(true);

  useEffect(() => {
    setSummary(buildProgressSummary());
    setDailyGoal(loadViOnboarding().dailyMinutes ?? null);
    const id = window.setInterval(() => setSummary(buildProgressSummary()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  if (!summary) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading progress…</p>
      </div>
    );
  }

  const lyricPct =
    summary.learnLyrics.sentencesTotal === 0
      ? 0
      : Math.round(
          (summary.learnLyrics.sentencesCompleted / summary.learnLyrics.sentencesTotal) * 100,
        );

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Your learning</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Progress</h1>
        </div>
        <Link href="/" className="teacher-btn-secondary px-4 py-2 text-sm">
          Home
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat value={`${summary.streakDays}d`} label="Streak" />
        <Stat value={`${summary.minutesToday}m`} label="Active today" />
        <Stat value={String(summary.vocab.wordsSaved)} label="Words saved" />
      </section>
      {summary.vocab.wordsSaved > 0 ? (
        <p className="mt-2 text-center text-sm">
          <Link href="/vocab" className="font-medium text-coral underline-offset-2 hover:underline">
            Review song & scan words
          </Link>
        </p>
      ) : null}
      <p className="mt-2 text-center text-[11px] text-ink/40">
        Active today is wall-clock practice while you stay on a lesson — not a tap counter.
        {dailyGoal != null ? ` Goal from setup: ${dailyGoal}m.` : null}
      </p>

      <section className="ami-card mt-6 px-4 py-4">
        <p className="quiet-label">Alphabet</p>
        <p className="mt-1 font-display text-xl text-ink">
          {summary.alphabet.mastered}/{summary.alphabet.total} sounds
        </p>
        <p className="text-sm text-ink/55">
          {summary.alphabet.levelsComplete}/{summary.alphabet.levelsTotal} levels ·{" "}
          {summary.alphabet.saySetsFinished} say sets finished
        </p>
        <Link href="/" className="teacher-btn-secondary mt-3 w-full text-center text-sm">
          Continue alphabet
        </Link>
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Đánh Vần</p>
        <p className="mt-1 font-display text-xl text-ink">
          {summary.phonics.completed}/{summary.phonics.total} lessons
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral"
            style={{ width: `${summary.phonics.pct}%` }}
          />
        </div>
        <Link href="/danh-van" className="teacher-btn-secondary mt-3 w-full text-center text-sm">
          Open Đánh Vần
        </Link>
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Learn the Lyrics</p>
        <p className="mt-1 font-display text-xl text-ink">
          {summary.learnLyrics.sentencesCompleted}/{summary.learnLyrics.sentencesTotal} sentences
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-coral" style={{ width: `${lyricPct}%` }} />
        </div>
        <ul className="mt-3 space-y-1 text-sm text-ink/60">
          {summary.learnLyrics.songs.map((s) => (
            <li key={s.songId} className="flex justify-between gap-2" lang="vi">
              <Link href={`/sing/${s.songId}`} className="text-coral underline-offset-2 hover:underline">
                {s.title}
              </Link>
              <span>
                {s.completed}/{s.total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">ÁMi Sing</p>
        <p className="mt-1 font-display text-xl text-ink">
          {summary.sing.songsTouched} songs touched
        </p>
        <p className="text-sm text-ink/55">
          {summary.sing.modesCompletedTotal}/{summary.sing.modeSlots || "—"} mode slots stamped ·{" "}
          {summary.sing.vocabSaved} song words saved
        </p>
        <p className="mt-1 text-xs text-ink/40">
          Karaoke songs count Learn·Sing·Practice (3). Legacy songs use the five-tab path.
        </p>
        <Link href="/sing" className="teacher-btn-secondary mt-3 w-full text-center text-sm">
          Open Sing
        </Link>
      </section>

      <section className="ami-card mt-4 px-4 py-4">
        <p className="quiet-label">Practice volume</p>
        <p className="mt-1 font-display text-xl text-ink">
          {summary.pronunciation.compareAttempts} compare takes
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink/60">
          <li>{summary.pronunciation.lettersWithSayPractice} letters practiced</li>
          <li>{summary.pronunciation.saySetsFinished} say sets finished</li>
          <li>{summary.pronunciation.phonicsAttempts} Đánh Vần attempts</li>
          <li>{summary.alphabet.levelsComplete}/{summary.alphabet.levelsTotal} alphabet levels</li>
        </ul>
        <p className="mt-3 text-sm text-ink/55">{summary.pronunciation.note}</p>
      </section>

      <p className="mt-6 text-xs text-ink/40">
        Progress saves on this device. Tone accuracy % and AI pronunciation grades stay off until
        Azure (or another validated scorer) is wired.
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="ami-card px-2 py-4 text-center">
      <p className="font-display text-xl text-ink">{value}</p>
      <p className="mt-1 text-[11px] text-ink/50">{label}</p>
    </div>
  );
}
