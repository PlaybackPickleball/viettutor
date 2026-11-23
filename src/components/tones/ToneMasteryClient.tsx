"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ListenControls } from "@/components/ListenControls";
import { markJourneyLessonComplete } from "@/lib/journey";
import { loadPathProgress, recordExerciseResult } from "@/lib/phonics/learningPath";
import {
  buildMasteryQuiz,
  getToneCard,
  gradeToneChoice,
  loadToneProgress,
  recordMasteryTest,
  TONE_MASTERY_THRESHOLD,
} from "@/lib/tones";

export function ToneMasteryClient() {
  const dialect = typeof window === "undefined" ? "southern" : loadToneProgress().dialect;
  const quiz = useMemo(() => buildMasteryQuiz(dialect), [dialect]);
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [graded, setGraded] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [passed, setPassed] = useState(false);

  const question = quiz[qIndex];

  function finish(nextCorrect: number, nextGraded: number) {
    const state = recordMasteryTest(nextCorrect, nextGraded);
    setPassed(state.masteryTest.passed);
    setDone(true);
    if (state.masteryTest.passed) {
      markJourneyLessonComplete("u2-l08");
      markJourneyLessonComplete("u2-l10");
    }
    const path = loadPathProgress();
    recordExerciseResult(
      path,
      ["tone-six-ma", "listen-discriminate"],
      nextGraded > 0 && nextCorrect / nextGraded >= TONE_MASTERY_THRESHOLD,
    );
  }

  if (!question && !done) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-8">Preparing quiz…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Dấu Thanh</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Mastery test</h1>
          <p className="mt-1 text-sm text-ink/60">
            ≥{Math.round(TONE_MASTERY_THRESHOLD * 100)}% to pass · retries welcome · no score penalty
          </p>
        </div>
        <Link href="/dau-thanh" className="teacher-btn-secondary px-3 py-2 text-sm">
          Hub
        </Link>
      </header>

      {!done && question ? (
        <section className="space-y-4">
          <p className="quiet-label">
            {qIndex + 1} / {quiz.length}
          </p>
          <p className="font-display text-xl text-ink">{question.promptEn}</p>
          {question.audioUtterance ? (
            <ListenControls text={question.audioUtterance} onListened={() => undefined} />
          ) : null}
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={Boolean(feedback)}
                className="ami-card px-4 py-3 text-left"
                onClick={() => {
                  const { ok, note } = gradeToneChoice(question, opt.id);
                  const nextC = correct + (ok ? 1 : 0);
                  const nextG = graded + 1;
                  setCorrect(nextC);
                  setGraded(nextG);
                  setFeedback(ok ? note ?? "Correct." : `Hint: ${question.hintEn}`);
                  if (!ok) {
                    const skill = getToneCard(question.toneId)?.skillId;
                    if (skill) recordExerciseResult(loadPathProgress(), [skill], false);
                  }
                }}
              >
                <span className="font-hand text-2xl" lang="vi">
                  {opt.label}
                </span>
                {opt.glossEn ? (
                  <span className="mt-0.5 block text-xs text-ink/45">{opt.glossEn}</span>
                ) : null}
              </button>
            ))}
          </div>
          {feedback ? (
            <>
              <p className="text-sm text-ink/70">{feedback}</p>
              <button
                type="button"
                className="teacher-btn-primary w-full"
                onClick={() => {
                  setFeedback(null);
                  if (qIndex + 1 >= quiz.length) {
                    finish(correct, graded);
                  } else {
                    setQIndex((i) => i + 1);
                  }
                }}
              >
                {qIndex + 1 >= quiz.length ? "See results" : "Next"}
              </button>
            </>
          ) : null}
        </section>
      ) : null}

      {done ? (
        <section className="ami-card space-y-3 px-4 py-6 text-center">
          <p className="font-display text-3xl text-ink">
            {Math.round((graded ? correct / graded : 0) * 100)}%
            {passed ? " · Passed" : " · Try again"}
          </p>
          <p className="text-sm text-ink/60">
            Best attempt is kept. Mistakes feed Daily Review when skills are due.
          </p>
          <Link href="/dau-thanh" className="teacher-btn-primary inline-flex w-full justify-center">
            Back to hub
          </Link>
          <Link href="/danh-van/review" className="teacher-btn-secondary inline-flex w-full justify-center">
            Daily Review
          </Link>
          {!passed ? (
            <button
              type="button"
              className="text-sm text-coral underline-offset-2 hover:underline"
              onClick={() => window.location.reload()}
            >
              Retry test
            </button>
          ) : (
            <Link href="/danh-van" className="block text-sm text-ink/50 underline-offset-2 hover:underline">
              Continue to Đánh Vần
            </Link>
          )}
        </section>
      ) : null}
    </div>
  );
}
