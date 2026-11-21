"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { VocabFlashcard } from "@/components/vocabulary/VocabFlashcard";
import {
  getPackLesson,
  gradePackWord,
  isPackLessonUnlocked,
  loadPackProgress,
  markPackWordSpoken,
  packLessonWords,
} from "@/lib/vocabulary";
import { introduceWords, loadMasteryState, saveMasteryState } from "@/lib/vocabulary/mastery";

type Props = { lessonId: string };

export function VocabLessonClient({ lessonId }: Props) {
  const router = useRouter();
  const lesson = getPackLesson(lessonId);
  const { neu, review } = useMemo(
    () => (lesson ? packLessonWords(lesson) : { neu: [], review: [] }),
    [lesson],
  );
  const queue = useMemo(() => [...review, ...neu], [review, neu]);
  const [index, setIndex] = useState(0);
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

  function goToQuiz() {
    let state = loadMasteryState();
    state = introduceWords(
      state,
      queue.map((w) => w.id),
    );
    saveMasteryState(state);
    router.push(`/vocab/pack/${lessonId}/quiz`);
  }

  function advance() {
    if (index + 1 >= queue.length) {
      goToQuiz();
      return;
    }
    setIndex((i) => i + 1);
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

      <p className="mt-4 text-center text-sm text-ink/45">
        After cards: short quiz (80% to unlock next)
      </p>
    </div>
  );
}
