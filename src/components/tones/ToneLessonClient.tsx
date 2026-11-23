"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ListenControls } from "@/components/ListenControls";
import { SpeakCompareAssess } from "@/components/phonics/path/SpeakCompareAssess";
import { ToneMarkTrace } from "@/components/tones/ToneMarkTrace";
import { TonePitchContour } from "@/components/tones/TonePitchContour";
import { ViDiacriticHelper } from "@/components/vi/ViDiacriticHelper";
import { markJourneyLessonComplete } from "@/lib/journey";
import { recordExerciseResult, loadPathProgress } from "@/lib/phonics/learningPath";
import {
  buildToneLessonQuiz,
  getToneCard,
  gradeToneChoice,
  loadToneProgress,
  recordToneLessonQuiz,
  TONE_MASTERY_THRESHOLD,
  TONE_PLACEMENT_NOTES,
  type ToneLessonPhase,
  type ToneQuizQuestion,
} from "@/lib/tones";
import { gradeTypedVi } from "@/lib/vocabulary/mastery/typing";

const PHASES: ToneLessonPhase[] = ["listen", "view", "trace", "say", "quiz"];
const PHASE_LABEL: Record<ToneLessonPhase, string> = {
  listen: "Listen",
  view: "View",
  trace: "Trace",
  say: "Say",
  quiz: "Quiz",
};

type Props = { toneId: string };

export function ToneLessonClient({ toneId }: Props) {
  const card = getToneCard(toneId);
  const [phase, setPhase] = useState<ToneLessonPhase>("listen");
  const [heard, setHeard] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [listenOk, setListenOk] = useState(false);
  const [pitchKey, setPitchKey] = useState(0);
  const [progress, setProgress] = useState(() =>
    typeof window === "undefined" ? null : loadToneProgress(),
  );
  const dialect = progress?.dialect ?? "southern";

  const quiz = useMemo(
    () => (card ? buildToneLessonQuiz(card.id, dialect) : []),
    [card, dialect],
  );
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  if (!card) {
    return (
      <div className="studio-shell scene-wash">
        <BrandMark />
        <p className="mt-8 text-ink/55">Unknown tone.</p>
        <Link href="/dau-thanh" className="teacher-btn-secondary mt-4 inline-flex">
          Dấu Thanh
        </Link>
      </div>
    );
  }

  const phaseIdx = PHASES.indexOf(phase);
  const question: ToneQuizQuestion | undefined = quiz[qIndex];

  function goNextPhase() {
    const i = PHASES.indexOf(phase);
    if (i < PHASES.length - 1) setPhase(PHASES[i + 1]!);
  }

  function finishQuiz(nextCorrect: number, nextGraded: number) {
    setQuizDone(true);
    const state = recordToneLessonQuiz(card!.id, nextCorrect, nextGraded);
    setProgress(state);
    markJourneyLessonComplete(card!.journeyLessonId);
    // Feed mistakes / attempts into path SRS for Daily Review.
    const path = loadPathProgress();
    const ratio = nextGraded === 0 ? 1 : nextCorrect / nextGraded;
    recordExerciseResult(path, [card!.skillId, "tone-six-ma", "listen-discriminate"], ratio >= 0.8);
  }

  function submitChoice(optionId: string) {
    if (!question || feedback) return;
    const { ok, note } = gradeToneChoice(question, optionId);
    const nextCorrect = correctCount + (ok ? 1 : 0);
    const nextGraded = gradedCount + 1;
    setCorrectCount(nextCorrect);
    setGradedCount(nextGraded);
    setFeedback(ok ? note ?? "Correct." : `Not quite. ${question.hintEn}`);
    if (!ok) {
      const path = loadPathProgress();
      recordExerciseResult(path, [card!.skillId], false);
    }
  }

  function advanceQuestion() {
    setFeedback(null);
    setTyped("");
    setPicked(null);
    if (qIndex + 1 >= quiz.length) {
      finishQuiz(correctCount, gradedCount);
      return;
    }
    setQIndex((i) => i + 1);
  }

  function submitTyped() {
    if (!question?.expectedWritten || feedback) return;
    const g = gradeTypedVi(typed, question.expectedWritten);
    const nextCorrect = correctCount + (g.ok ? 1 : 0);
    const nextGraded = gradedCount + 1;
    setCorrectCount(nextCorrect);
    setGradedCount(nextGraded);
    setFeedback(g.ok ? "Correct." : g.hint || question.hintEn);
    if (!g.ok) {
      const path = loadPathProgress();
      recordExerciseResult(path, [card!.skillId], false);
    }
  }

  function stampTrace() {
    // Trace is practice — counts toward completion, not against accuracy.
    setFeedback("Trace stamped — shape practice only.");
  }

  const ratio = gradedCount === 0 ? 0 : correctCount / gradedCount;
  const lessonRec = progress?.lessons[card.id];

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">Dấu Thanh · Tone {card.order} / 6</p>
          <h1 className="mt-1 font-display text-3xl text-ink">
            {card.nameVi}
            <span className="text-xl font-sans font-normal text-ink/45"> · {card.nameEn}</span>
          </h1>
          <p className="mt-1 font-hand text-4xl text-coral" lang="vi">
            {card.written}
          </p>
          <p className="text-sm text-ink/55">{card.meaningEn}</p>
        </div>
        <Link href="/dau-thanh" className="teacher-btn-secondary px-3 py-2 text-sm">
          Hub
        </Link>
      </header>

      <ol className="mb-4 flex flex-wrap gap-1.5" aria-label="Lesson phases">
        {PHASES.map((p, i) => (
          <li key={p}>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                p === phase
                  ? "bg-coral text-white"
                  : i < phaseIdx
                    ? "bg-coral/15 text-coral"
                    : "bg-ink/8 text-ink/45"
              }`}
            >
              {PHASE_LABEL[p]}
            </span>
            {i < PHASES.length - 1 ? <span className="mx-1 text-ink/25">→</span> : null}
          </li>
        ))}
      </ol>

      {phase === "listen" ? (
        <section className="space-y-4">
          <p className="text-sm text-ink/60">
            Play native audio (Southern default). Identify the tone before peeking at the mark.
          </p>
          <ListenControls
            text={card.utterance}
            onListened={() => setHeard(true)}
          />
          <div className="grid grid-cols-2 gap-2">
            {(["ngang", "sac", "huyen", "hoi", "nga", "nang"] as const).map((id) => {
              const c = getToneCard(id)!;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!heard || listenOk}
                  className={`ami-card px-3 py-3 text-center ${
                    picked === id ? "ring-2 ring-coral" : ""
                  }`}
                  onClick={() => {
                    setPicked(id);
                    const { ok, note } = gradeToneChoice(
                      {
                        id: "warm",
                        kind: "listen-choose",
                        promptEn: "",
                        toneId: card.id,
                        correctOptionId: card.id,
                        acceptOptionIds:
                          dialect === "southern" && (card.id === "hoi" || card.id === "nga")
                            ? ["hoi", "nga"]
                            : [card.id],
                        hintEn: "",
                      },
                      id,
                    );
                    setListenOk(ok);
                    setFeedback(
                      ok
                        ? note ?? `Yes — ${c.nameVi}.`
                        : `That was ${card.nameVi}. Keep listening.`,
                    );
                  }}
                >
                  <span className="font-hand text-xl" lang="vi">
                    {c.nameVi}
                  </span>
                </button>
              );
            })}
          </div>
          {feedback ? <p className="text-sm text-ink/70">{feedback}</p> : null}
          <button
            type="button"
            className="teacher-btn-primary w-full"
            disabled={!listenOk}
            onClick={() => {
              setFeedback(null);
              goNextPhase();
            }}
          >
            Continue
          </button>
        </section>
      ) : null}

      {phase === "view" ? (
        <section className="space-y-4">
          <div className="ami-card px-4 py-5 text-center">
            <p className="quiet-label">Mark · name · meaning</p>
            <p className="mt-2 font-hand text-6xl text-ink" lang="vi">
              {card.written}
            </p>
            <p className="mt-2 font-display text-2xl text-ink">
              {card.nameVi}
              <span className="text-base font-sans text-ink/45"> · {card.markNameEn}</span>
            </p>
            <p className="mt-1 text-sm text-ink/55">{card.meaningEn}</p>
            <p className="mt-3 text-3xl text-coral" aria-hidden>
              {card.markChar}
            </p>
          </div>
          <TonePitchContour
            path={card.pitchPath}
            label={card.contourHintEn}
            playKey={pitchKey}
          />
          <button
            type="button"
            className="teacher-btn-secondary w-full text-sm"
            onClick={() => setPitchKey((k) => k + 1)}
          >
            Replay contour animation
          </button>
          <p className="text-xs text-ink/50">
            {dialect === "southern" ? card.southernNoteEn : card.northernNoteEn}
          </p>
          <ul className="space-y-1 text-xs text-ink/45">
            {TONE_PLACEMENT_NOTES.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
          <button type="button" className="teacher-btn-primary w-full" onClick={goNextPhase}>
            Continue to trace
          </button>
        </section>
      ) : null}

      {phase === "trace" ? (
        <section className="space-y-4">
          <ToneMarkTrace
            strokePath={card.markStrokePath}
            guideEn={card.strokeGuideEn}
            markLabel={card.nameVi}
            onStamped={() => {
              stampTrace();
              goNextPhase();
            }}
          />
        </section>
      ) : null}

      {phase === "say" ? (
        <section className="space-y-4">
          <p className="text-sm text-ink/60">
            Record and compare by ear. Deepgram match when configured — never a fabricated tone
            score. Side-by-side pitch graphs appear only when a validated detector is available
            (not yet).
          </p>
          <p className="text-center font-hand text-5xl text-ink" lang="vi">
            {card.written}
          </p>
          <SpeakCompareAssess
            itemId={`tone-${card.id}`}
            expectedText={card.utterance}
            onPlayNative={() => undefined}
            onPracticed={() => undefined}
          />
          <button type="button" className="teacher-btn-primary w-full" onClick={goNextPhase}>
            Continue to quiz
          </button>
        </section>
      ) : null}

      {phase === "quiz" && !quizDone && question ? (
        <section className="space-y-4">
          <p className="quiet-label">
            Mini-quiz · {qIndex + 1} / {quiz.length} · need {Math.round(TONE_MASTERY_THRESHOLD * 100)}
            % for mastery · retries OK
          </p>
          <p className="font-display text-xl text-ink">{question.promptEn}</p>

          {question.audioUtterance ? (
            <ListenControls text={question.audioUtterance} onListened={() => undefined} />
          ) : null}

          {question.kind === "type-form" ? (
            <div className="space-y-2">
              <input
                type="text"
                lang="vi"
                value={typed}
                disabled={Boolean(feedback)}
                onChange={(e) => setTyped(e.target.value)}
                className="w-full rounded-2xl border border-[#e8d9c8] bg-paper px-4 py-3 font-hand text-3xl text-ink"
                placeholder="Type with diacritics…"
              />
              <ViDiacriticHelper
                disabled={Boolean(feedback)}
                onInsert={(ch) => setTyped((t) => t + ch)}
              />
              {!feedback ? (
                <button
                  type="button"
                  className="teacher-btn-primary w-full"
                  disabled={!typed.trim()}
                  onClick={submitTyped}
                >
                  Check
                </button>
              ) : null}
            </div>
          ) : null}

          {question.kind === "trace-stamp" ? (
            <ToneMarkTrace
              strokePath={card.markStrokePath}
              guideEn={question.hintEn}
              markLabel={card.nameVi}
              onStamped={() => {
                setFeedback("Practice stamped.");
              }}
            />
          ) : null}

          {(question.kind === "listen-choose" || question.kind === "select-mark") &&
          question.options ? (
            <div className="grid grid-cols-1 gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(feedback)}
                  className="ami-card px-4 py-3 text-left"
                  onClick={() => {
                    setPicked(opt.id);
                    submitChoice(opt.id);
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
          ) : null}

          {feedback ? (
            <>
              <p className="text-sm text-ink/70">{feedback}</p>
              <button type="button" className="teacher-btn-primary w-full" onClick={advanceQuestion}>
                {qIndex + 1 >= quiz.length ? "Finish" : "Next"}
              </button>
            </>
          ) : null}
        </section>
      ) : null}

      {phase === "quiz" && quizDone ? (
        <section className="ami-card space-y-3 px-4 py-6 text-center">
          <p className="quiet-label">Lesson result</p>
          <p className="font-display text-3xl text-ink">
            {Math.round(ratio * 100)}%
            {ratio >= TONE_MASTERY_THRESHOLD ? " · Mastered" : " · Keep practicing"}
          </p>
          <p className="text-sm text-ink/60">
            Best so far: {Math.round((lessonRec?.bestQuizRatio ?? ratio) * 100)}%. Retries never
            lower your best — no penalty.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/dau-thanh" className="teacher-btn-primary w-full text-center">
              Tone hub
            </Link>
            <button
              type="button"
              className="teacher-btn-secondary w-full"
              onClick={() => {
                setQuizDone(false);
                setQIndex(0);
                setCorrectCount(0);
                setGradedCount(0);
                setFeedback(null);
                setPhase("quiz");
              }}
            >
              Retry quiz
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
