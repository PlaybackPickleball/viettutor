"use client";

import { starsForLetter, type StepId } from "@/lib/motivation";
import type { LetterProgress } from "@/lib/progress";

const ORDER: StepId[] = ["hear", "say", "write", "object"];

type Props = {
  progress?: LetterProgress;
  current: StepId;
};

function earned(p: LetterProgress | undefined, step: StepId): boolean {
  if (!p) return false;
  if (step === "hear") return p.heard;
  if (step === "say") return p.sayMastered;
  if (step === "write") return p.written;
  return p.objectSeen;
}

/** Soft star trail — teacher stamp motivation, not XP. */
export function StepStars({ progress, current }: Props) {
  const count = starsForLetter(progress);
  return (
    <div className="mb-5 flex items-center justify-between gap-3" aria-label={`${count} of 4 stars`}>
      <div className="flex gap-1.5">
        {ORDER.map((step) => {
          const on = earned(progress, step);
          const active = step === current;
          return (
            <span
              key={step}
              title={step}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm transition ${
                on
                  ? "bg-amber/90 text-ink shadow-soft animate-pop"
                  : active
                    ? "bg-soft text-amber ring-1 ring-amber/50"
                    : "bg-paper/60 text-ink/25"
              }`}
              aria-hidden
            >
              ★
            </span>
          );
        })}
      </div>
      <p className="text-xs text-ink/45">{count}/4 stars this sound</p>
    </div>
  );
}
