"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { PathExerciseView } from "@/components/phonics/path/PathExerciseView";
import { usePracticeClock } from "@/hooks/usePracticeClock";
import {
  completePathLesson,
  getNextPathLesson,
  getWorld,
  isPathLessonUnlocked,
  loadPathProgress,
  recordExerciseResult,
  type LearningLesson,
  type PathProgressState,
  XP_PER_LESSON,
  XP_REVIEW_BONUS,
} from "@/lib/phonics/learningPath";

export function PathLessonClient({ lesson }: { lesson: LearningLesson }) {
  const [progress, setProgress] = useState<PathProgressState | null>(null);
  const [exIndex, setExIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [praise, setPraise] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [gotReviewBonus, setGotReviewBonus] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [wasReplay, setWasReplay] = useState(false);

  const correctRef = useRef(0);
  const gradedRef = useRef(0);
  const reviewBonusRef = useRef(false);

  usePracticeClock(true);

  useEffect(() => {
    setProgress(loadPathProgress());
    setExIndex(0);
    setFinished(false);
    setPraise(null);
    setStars(0);
    setGotReviewBonus(false);
    setXpAwarded(0);
    setWasReplay(false);
    correctRef.current = 0;
    gradedRef.current = 0;
    reviewBonusRef.current = false;
  }, [lesson.id]);

  const world = getWorld(lesson.worldId);
  const next = getNextPathLesson(lesson.id);
  const exercise = lesson.exercises[exIndex];
  const unlocked = progress ? isPathLessonUnlocked(progress, lesson.id) : lesson.order <= 1;

  if (!progress) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Loading lesson…</p>
      </div>
    );
  }

  if (!lesson.playable) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-8 font-display text-2xl text-ink">Coming later</p>
        <p className="mt-2 text-ink/60">
          This world is outlined in the curriculum but not playable in the MVP yet.
        </p>
        <Link href="/danh-van" className="teacher-btn-primary mt-6 w-full text-center">
          Back to path
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-8 font-display text-2xl text-ink">Lesson locked</p>
        <p className="mt-2 text-ink/60">Finish the previous lesson to continue this path.</p>
        <Link href="/danh-van" className="teacher-btn-primary mt-6 w-full text-center">
          Back to path
        </Link>
      </div>
    );
  }

  function handleResult(ok: boolean) {
    if (!exercise) return;
    gradedRef.current += 1;
    if (ok) {
      correctRef.current += 1;
      if (exercise.reviewBonus) {
        reviewBonusRef.current = true;
        setGotReviewBonus(true);
      }
    }
    setProgress(recordExerciseResult(loadPathProgress(), exercise.skillIds, ok));
  }

  function handleContinue() {
    if (exIndex + 1 >= lesson.exercises.length) {
      const before = loadPathProgress();
      const replay = Boolean(before.lessons[lesson.id]?.completed);
      const once = completePathLesson(
        before,
        lesson.id,
        correctRef.current,
        gradedRef.current,
        reviewBonusRef.current,
      );
      const gain = once.xp - before.xp;
      setProgress(once);
      setXpAwarded(gain);
      setWasReplay(replay);
      const earned = once.lessons[lesson.id]?.stars ?? 1;
      setStars(earned);
      setPraise(praiseFor(earned, once.xp, gain, replay));
      setFinished(true);
      return;
    }
    setExIndex((i) => i + 1);
  }

  if (finished) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <p className="quiet-label mt-6">
          {world?.titleEn ?? "Đánh Vần"} · Lesson {lesson.order}
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Lesson complete</h1>
        <p className="mt-2 text-ink/60">{praise}</p>
        <p className="mt-6 text-center text-3xl tracking-widest text-coral">
          {"★".repeat(stars)}
          <span className="text-ink/20">{"★".repeat(Math.max(0, 3 - stars))}</span>
        </p>
        <p className="mt-2 text-center text-sm text-ink/50">
          {xpAwarded > 0
            ? `+${xpAwarded}${gotReviewBonus && xpAwarded > XP_PER_LESSON ? ` (incl. +${XP_REVIEW_BONUS} review)` : ""} XP · teacher-paced`
            : wasReplay
              ? "Replay — no extra XP (stars can still improve)"
              : `+${XP_PER_LESSON} XP · teacher-paced`}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {next?.playable ? (
            <Link
              href={`/danh-van/path/${next.id}`}
              className="teacher-btn-primary w-full text-center"
            >
              Next: {next.titleEn}
            </Link>
          ) : null}
          <Link href="/danh-van" className="teacher-btn-secondary w-full text-center">
            Path map
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
          <p className="quiet-label mt-3">
            {world?.titleEn} · ~{lesson.durationMin} min
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">{lesson.titleEn}</h1>
          <p className="text-sm text-ink/50" lang="vi">
            {lesson.titleVi}
          </p>
        </div>
        <Link href="/danh-van" className="teacher-btn-secondary px-4 py-2 text-sm">
          Map
        </Link>
      </header>

      <p className="mb-5 text-sm text-ink/60">{lesson.summaryEn}</p>

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

function praiseFor(starCount: number, xp: number, xpGain: number, replay: boolean): string {
  if (replay && xpGain === 0) {
    if (starCount >= 3) return `Three stars locked — replay complete, no XP farm. Path XP ${xp}.`;
    return `Replay stamped — stars updated if higher. No extra XP. Path XP ${xp}.`;
  }
  if (starCount >= 3) return `Excellent work — three stars. Path XP ${xp}.`;
  if (starCount >= 2) return `Solid practice — two stars. Keep the steady pace.`;
  return `Lesson stamped — one star. Replay anytime for a stronger set (no XP farm).`;
}
