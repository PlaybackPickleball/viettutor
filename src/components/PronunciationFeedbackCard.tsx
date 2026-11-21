"use client";

import type { ViPronunciationFeedback } from "@/lib/vi/feedback";

type Props = {
  feedback: ViPronunciationFeedback;
  nativeUrl?: string | null;
  studentUrl?: string | null;
  onPlayNative?: () => void;
  onTryAgain?: () => void;
  /** Match streak helpers — not numerical pronunciation scores. */
  matchCount?: number | null;
  attemptCount?: number | null;
};

/**
 * Transcription match card — never shows invented pronunciation/tone scores.
 */
export function PronunciationFeedbackCard({
  feedback,
  nativeUrl,
  studentUrl,
  onPlayNative,
  onTryAgain,
  matchCount,
  attemptCount,
}: Props) {
  const decided = feedback.match === true || feedback.match === false;

  return (
    <div className="ami-card animate-riseIn px-4 py-4" role="status">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="quiet-label">Speech check</span>
        <span className="rounded-md bg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink/60">
          {feedback.experimentalLabel ?? "Deepgram transcription"}
        </span>
        {decided ? (
          <span
            className={`ml-auto font-display text-xl ${
              feedback.match ? "text-emerald-700" : "text-coral"
            }`}
          >
            {feedback.match ? "Match" : "No match"}
          </span>
        ) : null}
      </div>

      {feedback.expectedText || feedback.recognizedText ? (
        <div className="mb-3 space-y-1 text-sm text-ink/70">
          {feedback.expectedText ? (
            <p>
              Expected:{" "}
              <span className="font-hand text-2xl text-ink" lang="vi">
                {feedback.expectedText}
              </span>
            </p>
          ) : null}
          {feedback.recognizedText ? (
            <p>
              Heard:{" "}
              <span className="font-hand text-2xl text-ink" lang="vi">
                {feedback.recognizedText}
              </span>
            </p>
          ) : (
            <p className="text-ink/45">Heard: —</p>
          )}
        </div>
      ) : null}

      {attemptCount != null ? (
        <p className="mb-2 text-xs text-ink/45">
          Takes {attemptCount}
          {matchCount != null ? ` · matches ${matchCount}` : ""}
        </p>
      ) : null}

      <p className="text-base leading-relaxed text-ink">
        {feedback.tip || "Unable to assess reliably — please try again."}
      </p>

      <p className="mt-2 text-xs text-ink/45">
        This is a transcription match check, not a pronunciation accuracy score. Tone scores stay
        off until a specialized model is validated.
      </p>

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
