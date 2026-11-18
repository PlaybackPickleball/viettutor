"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  continuePhonicsHref,
  isLessonComplete,
  isLessonUnlocked,
  loadPhonicsProgress,
  PHONICS_LESSONS,
  phonicsMastery,
  type PhonicsProgressState,
} from "@/lib/phonics";

export function DanhVanHomeClient() {
  const [progress, setProgress] = useState<PhonicsProgressState | null>(null);

  useEffect(() => {
    setProgress(loadPhonicsProgress());
  }, []);

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading…</p>
      </div>
    );
  }

  const mastery = phonicsMastery(progress);
  const href = continuePhonicsHref(progress);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Learn · Build syllables</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Đánh Vần</h1>
          <p className="mt-1 text-ink/60">Build & Speak Vietnamese</p>
        </div>
        <Link href="/" className="teacher-btn-secondary px-4 py-2 text-sm">
          Home
        </Link>
      </header>

      <section className="ami-card px-4 py-5">
        <p className="quiet-label">Path</p>
        <p className="mt-2 text-sm text-ink/65">
          Alphabet → <span className="font-medium text-ink">Build Syllables</span> → Tones → Read
          Words → Sentences → Karaoke
        </p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-ink/60">
            <span>Intro pack</span>
            <span>
              {mastery.completed}/{mastery.total}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${mastery.pct}%` }}
            />
          </div>
        </div>
        <Link href={href} className="teacher-btn-primary mt-5 w-full text-center">
          Start practicing
        </Link>
        <Link
          href="/danh-van/lesson/ba-sac"
          className="teacher-btn-secondary mt-3 w-full text-center"
        >
          Intro: bờ → a → ba → sắc → bá
        </Link>
      </section>

      <section className="mt-8 space-y-3" aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="quiet-label">
          12 intro lessons · Southern first
        </h2>
        {PHONICS_LESSONS.map((lesson) => {
          const unlocked = isLessonUnlocked(progress, lesson.id);
          const complete = isLessonComplete(progress, lesson.id);
          return (
            <div
              key={lesson.id}
              className={`ami-card px-4 py-4 ${unlocked ? "" : "opacity-55"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink/45">Lesson {lesson.order}</p>
                  <p className="font-display text-lg text-ink">{lesson.titleEn}</p>
                  <p className="text-sm text-ink/50" lang="vi">
                    {lesson.titleVi}
                  </p>
                </div>
                <p className="text-xs text-ink/45">
                  {complete ? "Done ★" : unlocked ? "Open" : "Locked"}
                </p>
              </div>
              {unlocked ? (
                <Link
                  href={`/danh-van/lesson/${lesson.id}`}
                  className="teacher-btn-secondary mt-3 w-full text-center text-sm"
                >
                  Open lesson
                </Link>
              ) : (
                <p className="mt-2 text-sm text-ink/50">Finish lesson {lesson.order - 1} first.</p>
              )}
            </div>
          );
        })}
      </section>

      <p className="mt-8 text-xs text-ink/45">
        Record/replay only — no invented pronunciation scores. Authored sequences only.
      </p>
    </div>
  );
}
