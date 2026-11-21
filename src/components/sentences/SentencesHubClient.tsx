"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  isEssentialLessonComplete,
  isEssentialLessonUnlocked,
  isSentenceComplete,
  listEssentialLessons,
  loadSentencesProgress,
  SENTENCES_PRONOUN_NOTE,
} from "@/lib/sentences";

export function SentencesHubClient() {
  const [progress] = useState(() => loadSentencesProgress());
  const lessons = useMemo(() => listEssentialLessons(), []);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl text-ink">100 Essential Sentences</h1>
      <p className="mt-2 text-ink/60">
        After First 100 Words — Phase 1: lessons 1–5 (50 sentences). Southern Vietnamese.
      </p>
      <p className="mt-3 rounded-2xl bg-soft px-3 py-2.5 text-sm text-ink/65">
        {SENTENCES_PRONOUN_NOTE}
      </p>
      <p className="mt-2 text-xs text-ink/40">
        Content flagged <span className="font-medium">pending review</span> for native check · XP{" "}
        {progress.totalXp}
      </p>

      <ol className="mt-6 space-y-3">
        {lessons.map((lesson) => {
          const unlocked = isEssentialLessonUnlocked(lesson.id, progress);
          const done = isEssentialLessonComplete(lesson.id, progress);
          const doneCount = lesson.sentenceIds.filter((id) => isSentenceComplete(id, progress))
            .length;
          return (
            <li key={lesson.id}>
              {unlocked ? (
                <Link
                  href={`/sentences/${lesson.id}`}
                  className="ami-card block px-4 py-4 transition hover:bg-paper/60"
                >
                  <p className="quiet-label">
                    Lesson {lesson.order}
                    {done ? " · complete" : ` · ${doneCount}/10`}
                  </p>
                  <p className="mt-1 font-display text-xl text-ink">{lesson.titleEn}</p>
                  <p className="text-sm text-ink/50" lang="vi">
                    {lesson.titleVi}
                  </p>
                </Link>
              ) : (
                <div className="ami-card px-4 py-4 opacity-55">
                  <p className="quiet-label">Lesson {lesson.order} · locked</p>
                  <p className="mt-1 font-display text-xl text-ink">{lesson.titleEn}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-2">
        <Link href="/vocab/pack" className="teacher-btn-secondary w-full text-center">
          Back to First 100 Words
        </Link>
        <Link href="/learn" className="teacher-btn-secondary w-full text-center">
          Learn path
        </Link>
      </div>
    </div>
  );
}
