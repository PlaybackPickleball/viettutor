"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  getEssentialLesson,
  isEssentialLessonUnlocked,
  isSentenceComplete,
  lessonSentences,
  loadSentencesProgress,
} from "@/lib/sentences";

type Props = { lessonId: string };

export function SentenceLessonClient({ lessonId }: Props) {
  const lesson = getEssentialLesson(lessonId);
  const [progress] = useState(() => loadSentencesProgress());
  const unlocked = useMemo(
    () => (lesson ? isEssentialLessonUnlocked(lesson.id, progress) : false),
    [lesson, progress],
  );
  const sentences = useMemo(() => (lesson ? lessonSentences(lesson) : []), [lesson]);

  if (!lesson) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Lesson not found.</p>
        <Link href="/sentences" className="teacher-btn-secondary mt-4 inline-block">
          Map
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl text-ink">Locked</h1>
        <Link href="/sentences" className="teacher-btn-secondary mt-4 inline-block">
          Map
        </Link>
      </div>
    );
  }

  const firstTodo = sentences.find((s) => !isSentenceComplete(s.id, progress)) ?? sentences[0];

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <p className="quiet-label mt-4">Lesson {lesson.order}</p>
      <h1 className="mt-1 font-display text-3xl text-ink">{lesson.titleEn}</h1>
      <p className="text-ink/55" lang="vi">
        {lesson.titleVi}
      </p>

      {firstTodo ? (
        <Link
          href={`/sentences/${lessonId}/${firstTodo.id}`}
          className="teacher-btn-primary mt-6 inline-block w-full text-center"
        >
          Continue · {firstTodo.vi}
        </Link>
      ) : null}

      <ol className="mt-6 space-y-2">
        {sentences.map((s) => {
          const done = isSentenceComplete(s.id, progress);
          return (
            <li key={s.id}>
              <Link
                href={`/sentences/${lessonId}/${s.id}`}
                className="flex items-start justify-between gap-2 rounded-2xl bg-soft px-3 py-2.5 text-sm transition hover:bg-paper"
              >
                <span>
                  <span className="text-[11px] text-ink/40">{s.order}.</span>{" "}
                  <span className="font-medium text-ink" lang="vi">
                    {s.vi}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink/45">{s.en}</span>
                </span>
                <span className="shrink-0 text-[11px] text-coral">{done ? "Done" : "Start"}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <Link href="/sentences" className="teacher-btn-secondary mt-6 inline-block w-full text-center">
        All lessons
      </Link>
    </div>
  );
}
