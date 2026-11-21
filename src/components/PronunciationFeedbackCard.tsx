"use client";

import type { ViPronunciationFeedback } from "@/lib/vi/feedback";

type Props = {
  feedback: ViPronunciationFeedback;
  nativeUrl?: string | null;
  studentUrl?: string | null;
  onPlayNative?: () => void;
  onTryAgain?: () => void;
  bestScore?: number | null;
  latestScore?: number | null;
  improvement?: number | null;
};

/**
 * Phase 3 feedback card — overall score only when the provider returned one.
 * Tone numerical scores stay hidden until validation.
 */
export function PronunciationFeedbackCard({
  feedback,
  nativeUrl,
  studentUrl,
  onPlayNative,
  onTryAgain,
  bestScore,
  latestScore,
  improvement,
}: Props) {
  const scored =
    feedback.scoringAvailable &&
    feedback.status === "scored" &&
    (feedback.overallScore != null || feedback.accuracyScore != null);
  const displayScore = feedback.overallScore ?? feedback.accuracyScore;

  return (
    <div className="ami-card animate-riseIn px-4 py-4" role="status">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="quiet-label">Pronunciation</span>
        {!scored ? (
          <span className="rounded-md bg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink/60">
            {feedback.experimentalLabel ?? "Unable to assess"}
          </span>
        ) : null}
        {scored && displayScore != null ? (
          <span className="ml-auto font-display text-2xl text-coral">{displayScore}</span>
        ) : null}
      </div>

      {scored ? (
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-ink/55">
          {feedback.accuracyScore != null ? (
            <span>Accuracy {feedback.accuracyScore}</span>
          ) : null}
          {latestScore != null ? <span>Latest {latestScore}</span> : null}
          {bestScore != null ? <span>Best {bestScore}</span> : null}
          {improvement != null && improvement !== 0 ? (
            <span>
              {improvement > 0 ? `+${improvement}` : improvement} vs first scored take
            </span>
          ) : null}
        </div>
      ) : null}

      <p className="text-base leading-relaxed text-ink">
        {scored
          ? feedback.tip
          : feedback.tip || "Unable to assess reliably — please try again."}
      </p>

      {feedback.toneStatus === "not_validated" ? (
        <p className="mt-2 text-xs text-ink/45">
          Tone feedback is experimental and not shown as a score yet.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {onPlayNative || nativeUrl ? (
          <div>
            <p className="quiet-label mb-1">Native recording</p>
            {nativeUrl ? (
              <audio controls src={nativeUrl} className="w-full" />
            ) : onPlayNative ? (
              <button
                type="button"
                className="teacher-btn-secondary py-2 text-sm"
                onClick={onPlayNative}
              >
                Play native
              </button>
            ) : null}
          </div>
        ) : null}

        {studentUrl ? (
          <div>
            <p className="quiet-label mb-1">Your recording</p>
            <audio controls src={studentUrl} className="w-full" />
          </div>
        ) : null}
      </div>

      {onTryAgain ? (
        <button
          type="button"
          className="teacher-btn-primary mt-4 w-full"
          onClick={onTryAgain}
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}
