"use client";

import { useState } from "react";
import { LetterTraceCanvas } from "@/components/LetterTraceCanvas";
import { ListenControls } from "@/components/ListenControls";
import { StrokeDemo } from "@/components/StrokeDemo";
import { SpeakCompareAssess } from "@/components/phonics/path/SpeakCompareAssess";
import { SyllableBuilder } from "@/components/phonics/SyllableBuilder";
import { WordArt } from "@/components/phonics/WordArt";
import { WordGloss } from "@/components/phonics/WordGloss";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import {
  EXERCISE_TYPE_LABEL,
  STEP_ROLE_LABEL,
  getAudioAsset,
  resolveStepRole,
  type PathExercise,
} from "@/lib/phonics/learningPath";
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
  const [heard, setHeard] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stepRole = resolveStepRole(exercise);
  const asset = exercise.audioAssetId ? getAudioAsset(exercise.audioAssetId) : undefined;
  const audioText = exercise.audioUtterance;
  const nativePath =
    asset?.status === "native" && asset.nativePath
      ? asset.nativePath
      : // Still try placeholder nativePath if present; 404 falls through to TTS.
        asset?.nativePath;

  async function playAudio(slow = false) {
    if (!audioText && !nativePath) return;
    try {
      await speakVietnamese(audioText || asset?.utterance || "", {
        slow,
        nativePath,
        preferNative: Boolean(nativePath),
      });
    } catch {
      /* TTS optional — never invent a silent verified take */
    }
  }

  function judgeChoice(optionId: string) {
    if (solved) return;
    setSelectedId(optionId);
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

  function finishUngraded(message: string) {
    if (solved) return;
    onResult(true);
    setSolved(true);
    setFeedback(message);
  }

  const choiceTypes = new Set([
    "listen-choose",
    "tone-detective",
    "sound-match",
    "missing-component",
    "review-challenge",
  ]);

  const showListenReplay =
    Boolean(audioText) &&
    exercise.type !== "build-syllable" &&
    exercise.type !== "hear-sound";

  return (
    <div className="animate-riseIn space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs text-ink/45">
        <span>
          {index + 1} / {total} · {STEP_ROLE_LABEL[stepRole]} · {EXERCISE_TYPE_LABEL[exercise.type]}
        </span>
        <div className="mx-3 h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
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

      {asset ? (
        <p className="text-[11px] text-ink/40">
          Audio · {asset.id}
          {asset.status === "native"
            ? " · verified native"
            : " · TTS placeholder (native pending — never silent fake verified)"}
        </p>
      ) : null}

      {exercise.type === "hear-sound" && audioText ? (
        <div className="space-y-3">
          {exercise.targetWritten ? (
            <p className="text-center">
              <span className="font-hand text-6xl text-ink" lang="vi">
                {exercise.targetWritten}
              </span>
              {exercise.targetGlossEn ? (
                <span className="mt-1 block text-sm text-ink/50" lang="en">
                  {exercise.targetGlossEn}
                </span>
              ) : null}
            </p>
          ) : null}
          <ListenControls
            text={audioText}
            nativePath={nativePath}
            onListened={() => setHeard(true)}
          />
          {!solved ? (
            <button
              type="button"
              className="teacher-btn-primary w-full"
              disabled={!heard}
              onClick={() => finishUngraded("Heard — continue when ready.")}
            >
              {heard ? "I heard it — continue" : "Listen first"}
            </button>
          ) : null}
        </div>
      ) : null}

      {showListenReplay ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="teacher-btn-primary flex-1" onClick={() => void playAudio(false)}>
            Play audio
          </button>
          <button type="button" className="teacher-btn-secondary" onClick={() => void playAudio(true)}>
            Slow
          </button>
        </div>
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
          <SpeakCompareAssess
            itemId={exercise.id}
            expectedText={exercise.targetWritten || exercise.audioUtterance || ""}
            onPlayNative={() => void playAudio(false)}
            onPracticed={() => {
              if (!solved) {
                finishUngraded(
                  "Practice saved — Deepgram match when configured; otherwise compare by ear.",
                );
              }
            }}
          />
          {!solved ? (
            <button
              type="button"
              className="teacher-btn-secondary w-full"
              onClick={() =>
                finishUngraded("Continue without a new take — you can retry any time (no XP farm).")
              }
            >
              Continue
            </button>
          ) : null}
        </div>
      ) : null}

      {exercise.type === "write-trace" && exercise.traceGrapheme ? (
        <div className="space-y-3">
          <p className="text-center text-xs text-ink/45">
            Mali handwriting · shape practice — no accuracy claim
          </p>
          {(exercise.traceStrokes?.length ?? 0) > 0 ? (
            <StrokeDemo
              strokes={exercise.traceStrokes!}
              grapheme={exercise.traceGrapheme}
              autoPlay
            />
          ) : (
            <p className="text-center font-hand text-6xl text-ink/30" lang="vi">
              {exercise.traceGrapheme}
            </p>
          )}
          <LetterTraceCanvas
            strokes={exercise.traceStrokes ?? []}
            grapheme={exercise.traceGrapheme}
            praiseMode="unrecognized"
            idleHint="Trace the Mali model — practice only."
            onTraceComplete={() =>
              finishUngraded("Trace stamped — handwriting is practice, not scored.")
            }
          />
          {!solved ? (
            <button
              type="button"
              className="teacher-btn-secondary w-full"
              onClick={() =>
                finishUngraded("Write stamped — continue (no handwriting accuracy score).")
              }
            >
              Skip trace / continue
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
            const selected = selectedId === opt.id;
            const correctPick = solved && opt.id === exercise.correctOptionId;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={solved}
                aria-pressed={selected}
                className={`ami-card flex flex-col items-center px-3 py-4 text-center transition disabled:opacity-100 ${
                  selected || correctPick
                    ? "bg-coral/15 ring-2 ring-coral border-coral shadow-[0_0_0_1px_rgba(224,122,74,0.45)]"
                    : "hover:bg-paper hover:ring-1 hover:ring-coral/30"
                } ${solved && !correctPick ? "opacity-45" : ""}`}
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
