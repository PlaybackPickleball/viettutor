"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { LessonLoopRail } from "@/components/phonics/path/LessonLoopRail";
import { PathExerciseView } from "@/components/phonics/path/PathExerciseView";
import { usePracticeClock } from "@/hooks/usePracticeClock";
import {
  isJourneyUnitUnlocked,
  journeyLessonStatus,
  loadJourneyProgress,
  markJourneyLessonComplete,
  nextJourneyEngineLesson,
} from "@/lib/journey";
import type { LearningLesson } from "@/lib/phonics/learningPath/types";

/** Reusable journey lesson player — same exercise UI as Đánh Vần path. */
export function JourneyLessonClient({ lesson }: { lesson: LearningLesson }) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [exIndex, setExIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [replay, setReplay] = useState(false);
  const correctRef = useRef(0);
  const gradedRef = useRef(0);

  usePracticeClock(true);

  useEffect(() => {
    const journey = loadJourneyProgress();
    const status = journeyLessonStatus(
      {
        id: lesson.id,
        unitId: "u1",
        order: lesson.order,
        titleEn: lesson.titleEn,
        durationMin: lesson.durationMin,
        kind: "live",
        href: `/learn/${lesson.id}`,
      },
      journey,
    );
    setLocked(status === "locked");
    setReplay(status === "completed");
    setExIndex(0);
    setFinished(false);
    correctRef.current = 0;
    gradedRef.current = 0;
    setReady(true);
  }, [lesson.id, lesson.order, lesson.titleEn, lesson.durationMin]);

  const next = nextJourneyEngineLesson(lesson.id);
  const exercise = lesson.exercises[exIndex];

  if (!ready) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading lesson…</p>
      </div>
    );
  }

  if (locked || !isJourneyUnitUnlocked("u1")) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-8 font-display text-2xl text-ink">Lesson locked</p>
        <p className="mt-2 text-ink/60">Finish the previous Discover lesson to continue.</p>
        <Link href="/learn" className="teacher-btn-primary mt-6 w-full text-center">
          Back to Learn
        </Link>
      </div>
    );
  }

  function handleResult(ok: boolean) {
    gradedRef.current += 1;
    if (ok) correctRef.current += 1;
  }

  function handleContinue() {
    if (exIndex + 1 >= lesson.exercises.length) {
      markJourneyLessonComplete(lesson.id);
      setFinished(true);
      return;
    }
    setExIndex((i) => i + 1);
  }

  if (finished) {
    const ratio = gradedRef.current === 0 ? 1 : correctRef.current / gradedRef.current;
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.65 ? 2 : 1;
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <p className="quiet-label mt-6">Unit 1 · Discover · Lesson {lesson.order}</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Lesson complete</h1>
        <p className="mt-2 text-ink/60">
          {replay
            ? "Replay stamped — completed lessons stay reviewable."
            : "Nice work — unlock the next Discover lesson."}
        </p>
        <p className="mt-6 text-center text-3xl tracking-widest text-coral">
          {"★".repeat(stars)}
          <span className="text-ink/20">{"★".repeat(Math.max(0, 3 - stars))}</span>
        </p>
        <p className="mt-2 text-center text-sm text-ink/50">
          Stars reflect exercise accuracy — not a pronunciation score.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {next ? (
            <Link href={`/learn/${next.id}`} className="teacher-btn-primary w-full text-center">
              Next: {next.titleEn}
            </Link>
          ) : (
            <Link href="/sing" className="teacher-btn-primary w-full text-center">
              Fun challenge · Karaoke
            </Link>
          )}
          <Link href="/learn" className="teacher-btn-secondary w-full text-center">
            Learn path
          </Link>
          <Link href="/" className="teacher-btn-secondary w-full text-center">
            Home · Daily Journey
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Unit 1 · Discover · ~{lesson.durationMin} min</p>
          <h1 className="mt-1 font-display text-2xl text-ink">{lesson.titleEn}</h1>
          <p className="text-sm text-ink/50" lang="vi">
            {lesson.titleVi}
          </p>
        </div>
        <Link href="/learn" className="teacher-btn-secondary px-4 py-2 text-sm">
          Path
        </Link>
      </header>

      <p className="mb-3 text-sm text-ink/60">{lesson.summaryEn}</p>
      <LessonLoopRail lesson={lesson} currentIndex={exIndex} />

      {exercise ? (
        <PathExerciseView
          key={exercise.id}
          exercise={exercise}
          index={exIndex}
          total={lesson.exercises.length}
          onResult={handleResult}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
