"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { VocabFlashcard } from "@/components/vocabulary/VocabFlashcard";
import { markJourneyLessonComplete } from "@/lib/journey";
import {
  completePackLesson,
  getPackLesson,
  gradePackWord,
  isPackLessonUnlocked,
  loadPackProgress,
  markPackWordSpoken,
  packLessonWords,
} from "@/lib/vocabulary";

type Props = { lessonId: string };

export function VocabLessonClient({ lessonId }: Props) {
  const lesson = getPackLesson(lessonId);
  const { neu, review } = useMemo(
    () => (lesson ? packLessonWords(lesson) : { neu: [], review: [] }),
    [lesson],
  );
  const queue = useMemo(() => [...review, ...neu], [review, neu]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [unlocked] = useState(() => isPackLessonUnlocked(lessonId, loadPackProgress()));

  if (!lesson) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Lesson not found.</p>
        <Link href="/vocab/pack" className="teacher-btn-secondary mt-4 inline-block">
          Back to First 100
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl text-ink">Locked</h1>
        <p className="mt-2 text-ink/60">Finish the previous pack lesson first.</p>
        <Link href="/vocab/pack" className="teacher-btn-secondary mt-4 inline-block">
          Back to First 100
        </Link>
      </div>
    );
  }

  const word = queue[index];

  function finishLesson() {
    completePackLesson(lessonId);
    markJourneyLessonComplete(lessonId);
    setDone(true);
  }

  function advance() {
    if (index + 1 >= queue.length) {
      finishLesson();
      return;
    }
    setIndex((i) => i + 1);
  }

  if (done) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <h1 className="mt-6 font-display text-3xl text-ink">Lesson complete</h1>
        <p className="mt-2 text-ink/60">
          {lesson.titleEn} — spaced review will resurface words when due.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/vocab/pack" className="teacher-btn-primary w-full text-center">
            Pack map
          </Link>
          <Link href="/danh-van/review" className="teacher-btn-secondary w-full text-center">
            Daily Review
          </Link>
          <Link href="/learn" className="teacher-btn-secondary w-full text-center">
            Learn path
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">
            First 100 · {index + 1}/{queue.length}
            {index < review.length ? " · review" : " · new"}
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">{lesson.titleEn}</h1>
          <p className="text-sm text-ink/50" lang="vi">
            {lesson.titleVi} · {lesson.categoryHint}
          </p>
        </div>
        <Link href="/vocab/pack" className="teacher-btn-secondary px-3 py-2 text-sm">
          Map
        </Link>
      </header>

      {word ? (
        <VocabFlashcard
          word={word}
          onSpoken={() => markPackWordSpoken(word.id)}
          onKnow={() => {
            gradePackWord(word.id, "know");
            advance();
          }}
          onAgain={() => {
            gradePackWord(word.id, "again");
            advance();
          }}
        />
      ) : null}
    </div>
  );
}
