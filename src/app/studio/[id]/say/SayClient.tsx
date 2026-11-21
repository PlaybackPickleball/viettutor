"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AverageReportCard } from "@/components/AverageReportCard";
import { CelebrateBanner } from "@/components/CelebrateBanner";
import { ListenControls } from "@/components/ListenControls";
import { MicRecorder } from "@/components/MicRecorder";
import { StudioChrome } from "@/components/StudioChrome";
import { SAY_TARGET_REPS, type LetterLesson } from "@/lib/letters";
import { praiseForStep } from "@/lib/motivation";
import {
  averageScores,
  type ScoreResult,
} from "@/lib/pronunciation";
import { loadProgress, recordSayAttempt, type ProgressState } from "@/lib/progress";
import { speakVietnamese } from "@/lib/audio";

export function SayClient({ letter }: { letter: LetterLesson }) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [listened, setListened] = useState(false);
  const [sessionResults, setSessionResults] = useState<ScoreResult[]>([]);
  const [justEarned, setJustEarned] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    setListened(Boolean(p.letters[letter.id]?.heard));
    // Restore completed set average view if already mastered this letter
    const quals = p.letters[letter.id]?.sayQualities ?? [];
    if (quals.length >= SAY_TARGET_REPS) {
      setSessionResults(
        quals.map((quality) => ({
          simulated: false,
          scoringAvailable: quality > 0,
          dimension: "ok" as const,
          tip: "Compare set already finished on this device.",
          passed: true,
          quality: quality > 0 ? quality : null,
          experimentalLabel: "Scoring unavailable",
        })),
      );
    } else {
      setSessionResults([]);
    }
  }, [letter.id]);

  const letterProg = progress?.letters[letter.id];
  const mastered = Boolean(letterProg?.sayMastered);
  const completedCount = Math.max(sessionResults.length, letterProg?.sayQualities?.length ?? 0);
  const attemptIndex = Math.min(completedCount, SAY_TARGET_REPS - 1);
  const setDone = completedCount >= SAY_TARGET_REPS || mastered;

  const report = useMemo(() => {
    if (sessionResults.length >= SAY_TARGET_REPS) return averageScores(sessionResults.slice(0, SAY_TARGET_REPS));
    if ((letterProg?.sayQualities?.length ?? 0) >= SAY_TARGET_REPS) {
      const cycles = (letterProg?.sayQualities ?? []).map((quality) => ({
        simulated: false,
        scoringAvailable: quality > 0,
        dimension: "ok" as ScoreResult["dimension"],
        tip: "",
        passed: true,
        quality: quality > 0 ? quality : null,
      }));
      return averageScores(cycles);
    }
    return null;
  }, [sessionResults, letterProg]);

  function onScored(result: ScoreResult) {
    const before = loadProgress().letters[letter.id]?.sayMastered;
    const alreadyDone =
      Boolean(before) ||
      (loadProgress().letters[letter.id]?.sayQualities?.length ?? 0) >= SAY_TARGET_REPS;
    const next = recordSayAttempt(
      loadProgress(),
      letter.id,
      result.passed,
      result.scoringAvailable ? result.quality : null,
      { countTowardSet: !alreadyDone },
    );
    setProgress(next);
    if (!alreadyDone) {
      setSessionResults((prev) => [...prev, result].slice(0, SAY_TARGET_REPS));
    }
    setTick((t) => t + 1);
    if (!before && next.letters[letter.id]?.sayMastered) setJustEarned(true);
  }

  async function replayTeacher() {
    try {
      await speakVietnamese(letter.listenText, { phoneticHint: letter.phoneticHint });
    } catch {
      /* optional */
    }
  }

  return (
    <StudioChrome
      letterId={letter.id}
      grapheme={letter.grapheme}
      step="say"
      caption={`Finish ${SAY_TARGET_REPS} listen→record→compare cycles. Azure vi-VN scores when configured — never invented.`}
      progressTick={tick}
    >
      {justEarned ? <CelebrateBanner message={praiseForStep("say", letter.order)} /> : null}

      <div className="ami-card mb-6 flex flex-col items-center px-4 py-8">
        <p className="quiet-label mb-2">{soundKindLabel(letter)} · Southern</p>
        <p className="font-hand text-7xl font-medium text-ink" lang="vi">
          {letter.grapheme}
        </p>
        <p className="mt-2 text-sm text-ink/50">{letter.soundHint}</p>
        <div className="mt-6 w-full">
          <div className="mb-2 flex justify-between text-xs text-ink/45">
            <span>Set progress</span>
            <span>
              {Math.min(completedCount, SAY_TARGET_REPS)}/{SAY_TARGET_REPS}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{
                width: `${(Math.min(completedCount, SAY_TARGET_REPS) / SAY_TARGET_REPS) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ListenControls
          text={letter.listenText}
          phoneticHint={letter.phoneticHint}
          onListened={() => setListened(true)}
        />
      </div>

      <div className="mb-2 flex justify-center">
        <button type="button" className="circle-btn" onClick={replayTeacher} aria-label="Listen">
          <SpeakerIcon />
        </button>
      </div>

      <MicRecorder
        letterId={letter.id}
        grapheme={letter.grapheme}
        expectedText={letter.listenText || letter.grapheme}
        listened={listened}
        attemptIndex={setDone ? SAY_TARGET_REPS - 1 : completedCount}
        takeTotal={SAY_TARGET_REPS}
        disabled={setDone}
        allowExtraTakes={setDone}
        bestScore={letterProg?.sayBestScore ?? null}
        latestScore={letterProg?.sayLatestScore ?? null}
        onScored={onScored}
        onReplayLast={replayTeacher}
      />

      {report ? (
        <div className="mt-6">
          <AverageReportCard report={report} />
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-ink/50">
          Finish all {SAY_TARGET_REPS} compare cycles to unlock Write.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href={`/studio/${letter.id}/write`}
          className={`teacher-btn-primary w-full text-center ${
            setDone ? "" : "pointer-events-none opacity-40"
          }`}
          aria-disabled={!setDone}
        >
          Next: Write it
        </Link>
        <Link href={`/studio/${letter.id}/hear`} className="teacher-btn-secondary w-full text-center">
          Back to Hear
        </Link>
      </div>
    </StudioChrome>
  );
}

function soundKindLabel(letter: LetterLesson): string {
  if (letter.grapheme.length > 1) return "Letter group";
  if (letter.levelId <= 2 || letter.id === "u" || letter.id === "ư") return "Vowel sound";
  return "Consonant sound";
}

function SpeakerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10v4h3l5 4V6L7 10H4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
