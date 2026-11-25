"use client";

import { useEffect, useState } from "react";

type Props = {
  strokePath: string;
  markChar: string;
  guideEn: string;
  accent?: string;
  playKey?: number;
  /** Ngang has no mark. */
  empty?: boolean;
};

/** Animated accent-writing demonstration (mnemonic stroke). */
export function ToneMarkAnimation({
  strokePath,
  markChar,
  guideEn,
  accent = "var(--coral)",
  playKey = 0,
  empty = false,
}: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((t) => t + 1);
  }, [playKey, strokePath]);

  return (
    <div className="ami-card px-4 py-4">
      <p className="quiet-label">How to write the mark</p>
      <div className="mt-2 flex items-center gap-4">
        <span className="font-hand text-5xl" style={{ color: accent }} aria-hidden>
          {empty ? "—" : markChar}
        </span>
        <div className="min-w-0 flex-1">
          {empty || !strokePath ? (
            <p className="text-sm text-ink/60">No written mark for ngang.</p>
          ) : (
            <svg key={tick} viewBox="0 0 100 100" className="h-16 w-full" aria-hidden>
              <circle cx="28" cy="72" r="3.5" fill="#c4b5a5" />
              <path
                d={strokePath}
                fill="none"
                stroke={accent}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tone-pitch-draw"
              />
            </svg>
          )}
          <p className="mt-1 text-sm text-ink/65">{guideEn}</p>
          {!empty && strokePath ? (
            <button
              type="button"
              className="mt-1 text-xs font-semibold text-coral"
              onClick={() => setTick((t) => t + 1)}
            >
              Replay writing
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
