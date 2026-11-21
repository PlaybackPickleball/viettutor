"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  isPackLessonComplete,
  isPackLessonUnlocked,
  listPackLessons,
  loadPackProgress,
  packMasteryStats,
  packWordCount,
  type PackProgressState,
} from "@/lib/vocabulary";

export function VocabPackHubClient() {
  const [state, setState] = useState<PackProgressState | null>(null);

  useEffect(() => {
    setState(loadPackProgress());
  }, []);

  const lessons = listPackLessons();
  const stats = state ? packMasteryStats(state) : null;

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Unit 4</p>
          <h1 className="mt-1 font-display text-3xl text-ink">First 100 words</h1>
          <p className="mt-2 text-ink/60">
            {packWordCount()} illustrated words · 5–7 new per lesson + review. Deepgram match
            only — no invented scores.
          </p>
        </div>
        <Link href="/vocab" className="teacher-btn-secondary px-3 py-2 text-sm">
          Saved
        </Link>
      </header>

      {stats ? (
        <section className="ami-card mb-6 grid grid-cols-3 gap-2 px-3 py-3 text-center">
          <div>
            <p className="font-display text-xl text-ink">
              {stats.lessonsCompleted}/{stats.lessonsTotal}
            </p>
            <p className="text-[11px] text-ink/45">Lessons</p>
          </div>
          <div>
            <p className="font-display text-xl text-ink">
              {stats.wordsTouched}/{stats.wordsTotal}
            </p>
            <p className="text-[11px] text-ink/45">Touched</p>
          </div>
          <div>
            <p className="font-display text-xl text-ink">{stats.dueCount}</p>
            <p className="text-[11px] text-ink/45">Due</p>
          </div>
        </section>
      ) : null}

      <ol className="space-y-2">
        {lessons.map((lesson) => {
          const unlocked = state ? isPackLessonUnlocked(lesson.id, state) : lesson.order === 1;
          const done = state ? isPackLessonComplete(lesson.id, state) : false;
          const inner = (
            <>
              <span>
                <span className="font-medium text-ink">{lesson.titleEn}</span>
                <span className="mt-0.5 block text-[11px] text-ink/45">
                  {lesson.newWordIds.length} new
                  {lesson.reviewWordIds.length
                    ? ` · ${lesson.reviewWordIds.length} review`
                    : ""}
                  {` · ${lesson.categoryHint}`}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-ink/45">
                {done ? "Done" : unlocked ? "Open" : "Locked"}
              </span>
            </>
          );
          return (
            <li key={lesson.id}>
              {unlocked ? (
                <Link
                  href={`/vocab/pack/${lesson.id}`}
                  className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm ring-1 ${
                    done
                      ? "bg-coral/10 ring-coral/25"
                      : "bg-soft ring-transparent hover:bg-paper"
                  }`}
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-ink/[0.03] px-3 py-3 text-sm text-ink/45">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-xs text-ink/40">
        Illustrations are 128×128 auto-crops — see project docs for art QA flags. Karaoke and
        guided journey stay unchanged.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Link href="/danh-van/review" className="teacher-btn-secondary w-full text-center text-sm">
          Daily Review (SRS)
        </Link>
        <Link href="/learn" className="teacher-btn-secondary w-full text-center text-sm">
          Learn path
        </Link>
      </div>
    </div>
  );
}
