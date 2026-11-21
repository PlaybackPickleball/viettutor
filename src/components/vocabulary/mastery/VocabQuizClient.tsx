"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { markJourneyLessonComplete } from "@/lib/journey";
import { speakVietnamese } from "@/lib/audio";
import {
  completePackLesson,
  getPackLesson,
  getPackWord,
  isPackLessonUnlocked,
  loadPackProgress,
  packImageUrl,
  packLessonWordIds,
} from "@/lib/vocabulary";
import {
  buildLessonQuiz,
  completeLessonWithQuiz,
  gradeTypedVi,
  introduceWords,
  loadMasteryState,
  saveMasteryState,
  scoreQuiz,
  type QuizQuestion,
  type QuizResult,
} from "@/lib/vocabulary/mastery";

type Props = { lessonId: string };

export function VocabQuizClient({ lessonId }: Props) {
  const lesson = getPackLesson(lessonId);
  const unlocked = useMemo(() => isPackLessonUnlocked(lessonId, loadPackProgress()), [lessonId]);
  const questions = useMemo(() => buildLessonQuiz(lessonId), [lessonId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizResult["answers"]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [typed, setTyped] = useState("");
  const [typeHint, setTypeHint] = useState<string | null>(null);
  const inputId = useId();

  if (!lesson) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">Lesson not found.</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl text-ink">Locked</h1>
        <Link href="/vocab/pack" className="teacher-btn-secondary mt-4 inline-block">
          Pack map
        </Link>
      </div>
    );
  }

  function finish(all: QuizResult["answers"]) {
    const scored = scoreQuiz(lessonId, all);
    let state = loadMasteryState();
    state = introduceWords(state, packLessonWordIds(lesson!));
    state = completeLessonWithQuiz(state, scored);
    saveMasteryState(state);
    if (scored.passed) {
      completePackLesson(lessonId);
      markJourneyLessonComplete(lessonId);
    }
    setResult(scored);
  }

  function record(q: QuizQuestion, correct: boolean) {
    const next = [
      ...answers,
      { questionId: q.id, vocabularyId: q.vocabularyId, correct, kind: q.kind },
    ];
    setAnswers(next);
    setTyped("");
    setTypeHint(null);
    if (index + 1 >= questions.length) {
      finish(next);
      return;
    }
    setIndex((i) => i + 1);
  }

  if (result) {
    return (
      <div className="studio-shell scene-wash animate-riseIn">
        <BrandMark />
        <h1 className="mt-6 font-display text-3xl text-ink">
          {result.passed ? "Quiz passed" : "Keep practicing"}
        </h1>
        <p className="mt-2 text-ink/60">
          {result.correct}/{result.total} correct · {result.percent}%
          {result.passed ? " · +30 XP (lesson + quiz)" : " · need 80% to unlock next"}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {result.passed ? (
            <Link href="/vocab/pack" className="teacher-btn-primary w-full text-center">
              Pack map
            </Link>
          ) : (
            <Link href={`/vocab/pack/${lessonId}`} className="teacher-btn-primary w-full text-center">
              Review cards, then retry
            </Link>
          )}
          <Link href="/vocab/pack/review" className="teacher-btn-secondary w-full text-center">
            Daily Review
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[index];
  if (!q) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-10 text-ink/50">No quiz questions.</p>
      </div>
    );
  }

  const word = getPackWord(q.vocabularyId);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-4">
        <BrandMark />
        <p className="quiet-label mt-3">
          Lesson quiz · {index + 1}/{questions.length}
        </p>
        <h1 className="mt-1 font-display text-2xl text-ink">{lesson.titleEn}</h1>
        <p className="text-sm text-ink/55">{q.promptEn}</p>
      </header>

      {q.kind === "image" && word ? (
        <div>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={packImageUrl(word)}
              alt=""
              width={1254}
              height={1254}
              className="absolute inset-0 h-full w-full object-contain object-center p-4"
            />
          </div>
          <div className="mt-4 grid gap-2">
            {q.choices.map((c) => (
              <button
                key={c}
                type="button"
                className="teacher-btn-secondary w-full text-left"
                lang="vi"
                onClick={() => record(q, c === q.correctVi)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {q.kind === "listening" && word ? (
        <div>
          <button
            type="button"
            className="teacher-btn-secondary"
            onClick={() => {
              void speakVietnamese(word.vi);
            }}
          >
            Play audio
          </button>
          <div className="mt-4 grid gap-2">
            {q.choices.map((c) => (
              <button
                key={c}
                type="button"
                className="teacher-btn-secondary w-full text-left"
                lang="vi"
                onClick={() => record(q, c === q.correctVi)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {q.kind === "typing" ? (
        <div className="rounded-2xl bg-soft px-4 py-5">
          <label htmlFor={inputId} className="block text-sm text-ink/60">
            Vietnamese spelling
          </label>
          <input
            id={inputId}
            className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-lg text-ink outline-none focus:border-coral"
            lang="vi"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const g = gradeTypedVi(typed, q.correctVi);
                if (!g.ok && g.reason === "wrong_diacritics") {
                  setTypeHint(g.hint);
                  return;
                }
                record(q, g.ok);
              }
            }}
            placeholder="Type here…"
          />
          <button
            type="button"
            className="teacher-btn-primary mt-3 w-full"
            onClick={() => {
              const g = gradeTypedVi(typed, q.correctVi);
              if (!g.ok && g.reason === "wrong_diacritics") {
                setTypeHint(g.hint);
                return;
              }
              record(q, g.ok);
            }}
          >
            Check
          </button>
          {typeHint ? (
            <p className="mt-2 text-sm text-ink/65" role="status">
              {typeHint}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
