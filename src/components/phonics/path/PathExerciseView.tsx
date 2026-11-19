"use client";

import { useState } from "react";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";
import { SyllableBuilder } from "@/components/phonics/SyllableBuilder";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import {
  EXERCISE_TYPE_LABEL,
  type PathExercise,
} from "@/lib/phonics/learningPath";
import { WordArt } from "@/components/phonics/WordArt";
import { WordGloss } from "@/components/phonics/WordGloss";
import { resolveWordArt } from "@/lib/phonics/wordArt";

type Props = {
  exercise: PathExercise;
  index: number;
  total: number;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
};

export function PathExerciseView({ exercise, index, total, onResult, onContinue }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [buildReady, setBuildReady] = useState(false);

  async function playAudio() {
    if (!exercise.audioUtterance) return;
    try {
      await speakVietnamese(exercise.audioUtterance);
    } catch {
      /* TTS optional */
    }
  }

  function judgeChoice(optionId: string) {
    if (solved) return;
    const ok = optionId === exercise.correctOptionId;
    onResult(ok);
    if (ok) {
      setFeedback("Nice — that’s it.");
      setSolved(true);
      setShowHint(false);
    } else {
      setFeedback("Not quite — try again.");
      setShowHint(true);
    }
  }

  function finishUngraded() {
    if (solved) return;
    onResult(true);
    setSolved(true);
    setFeedback("Saved — compare by ear only (no fake score).");
  }

  const choiceTypes = new Set([
    "listen-choose",
    "tone-detective",
    "sound-match",
    "missing-component",
    "review-challenge",
  ]);

  return (
    <div className="animate-riseIn space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs text-ink/45">
        <span>
          {index + 1} / {total} · {EXERCISE_TYPE_LABEL[exercise.type]}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10 mx-3">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${((index + (solved ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="font-display text-xl text-ink">{exercise.promptEn}</p>
      {exercise.promptVi ? (
        <p className="text-sm text-ink/50" lang="vi">
          {exercise.promptVi}
        </p>
      ) : null}

      {exercise.audioUtterance && exercise.type !== "build-syllable" ? (
        <button type="button" className="teacher-btn-primary w-full" onClick={() => void playAudio()}>
          Play audio
        </button>
      ) : null}

      {exercise.type === "build-syllable" && exercise.buildSteps ? (
        <SyllableBuilder
          steps={exercise.buildSteps}
          target={exercise.targetWritten}
          meaningEn={exercise.targetGlossEn}
          onAttempt={() => undefined}
          onComplete={() => {
            setBuildReady(true);
          }}
        />
      ) : null}

      {exercise.type === "build-syllable" && buildReady && !solved ? (
        <button
          type="button"
          className="teacher-btn-primary w-full"
          onClick={() => {
            onResult(true);
            setSolved(true);
            setFeedback("Syllable built — stamped.");
          }}
        >
          Continue
        </button>
      ) : null}

      {exercise.type === "speak-compare" ? (
        <div className="space-y-3">
          {exercise.targetWritten ? (
            resolveWordArt(exercise.targetWritten) ? (
              <WordGloss
                vi={exercise.targetWritten}
                en={exercise.targetGlossEn}
                size="lg"
                viClassName="font-hand text-5xl text-ink"
                enClassName="text-sm text-ink/50"
              />
            ) : (
              <p className="text-center">
                <span className="font-hand text-5xl text-ink" lang="vi">
                  {exercise.targetWritten}
                </span>
                {exercise.targetGlossEn ? (
                  <span className="mt-1 block text-sm text-ink/50" lang="en">
                    {exercise.targetGlossEn}
                  </span>
                ) : null}
              </p>
            )
          ) : null}
          <LocalMicRecorder label="Record & replay — judge by ear" />
          {!solved ? (
            <button type="button" className="teacher-btn-primary w-full" onClick={finishUngraded}>
              I compared — continue
            </button>
          ) : null}
        </div>
      ) : null}

      {exercise.type === "read-without-help" ? (
        <div className="space-y-3 text-center">
          {resolveWordArt(exercise.targetWritten) ? (
            <WordGloss
              vi={exercise.targetWritten}
              en={revealed ? exercise.targetGlossEn : undefined}
              size="lg"
              viClassName="font-hand text-5xl text-ink"
              enClassName="text-sm text-ink/55"
            />
          ) : (
            <p className="font-hand text-5xl text-ink" lang="vi">
              {exercise.targetWritten}
            </p>
          )}
          {revealed && exercise.targetGlossEn && !resolveWordArt(exercise.targetWritten) ? (
            <p className="text-sm text-ink/55" lang="en">
              {exercise.targetGlossEn}
            </p>
          ) : null}
          {!revealed ? (
            <button
              type="button"
              className="teacher-btn-secondary w-full"
              onClick={() => setRevealed(true)}
            >
              Reveal meaning
            </button>
          ) : null}
          {!solved ? (
            <button
              type="button"
              className="teacher-btn-primary w-full"
              onClick={() => {
                onResult(true);
                setSolved(true);
                setFeedback("Reading stamped.");
              }}
            >
              Continue
            </button>
          ) : null}
        </div>
      ) : null}

      {choiceTypes.has(exercise.type) && exercise.options ? (
        <div className="grid grid-cols-2 gap-2">
          {exercise.options.map((opt) => {
            const art = resolveWordArt(opt.label);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={solved}
                className="ami-card flex flex-col items-center px-3 py-4 text-center transition hover:bg-paper disabled:opacity-60"
                onClick={() => judgeChoice(opt.id)}
              >
                <span className="font-hand text-2xl text-ink" lang="vi">
                  {opt.label}
                </span>
                {art ? (
                  <WordArt
                    artId={art.artId}
                    kind={art.kind}
                    alt={art.alt}
                    size="sm"
                    className="mt-2"
                  />
                ) : null}
                {opt.glossEn ? (
                  <span className="mt-1 text-[11px] leading-snug text-ink/40" lang="en">
                    {opt.glossEn}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {showHint && !solved ? (
        <p className="rounded-2xl bg-soft px-4 py-3 text-sm text-ink/70">
          Hint: {exercise.hintEn}
        </p>
      ) : null}

      {feedback ? <p className="text-sm text-ink/70">{feedback}</p> : null}

      {solved ? (
        <button
          type="button"
          className="teacher-btn-primary w-full"
          onClick={() => {
            stopSpeaking();
            onContinue();
          }}
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          className="text-sm text-ink/45 underline-offset-2 hover:underline"
          onClick={() => setShowHint(true)}
        >
          Need a hint?
        </button>
      )}
    </div>
  );
}
