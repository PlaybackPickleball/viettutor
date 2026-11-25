"use client";

import { useEffect, useId, useMemo, useState } from "react";

type Curve = {
  path: string;
  color: string;
  label?: string;
  /** 0..1 progress for draw / playback scrub. */
  progress?: number;
};

type Props = {
  /** Illustrative teaching curves or measured learner/native overlays. */
  curves: Curve[];
  /** Show mid dashed “natural speaking pitch” line. */
  showNaturalPitch?: boolean;
  naturalLabel?: string;
  mode?: "illustrative" | "measured";
  className?: string;
  /** Animate draw on mount / when key changes. */
  playKey?: number;
  /** Playback scrub 0..1 across the primary curve. */
  playhead?: number | null;
  height?: number;
};

const STAFF_YS = [12, 31, 50, 69, 88];

/** Five-line pitch staff with illustrative or measured contours. */
export function TonePitchGraph({
  curves,
  showNaturalPitch = true,
  naturalLabel = "Your natural speaking pitch",
  mode = "illustrative",
  className = "",
  playKey = 0,
  playhead = null,
  height = 160,
}: Props) {
  const gid = useId();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setDrawn(false);
    const t = window.setTimeout(() => setDrawn(true), 30);
    return () => window.clearTimeout(t);
  }, [playKey, curves.map((c) => c.path).join("|")]);

  const primary = curves[0];
  const head = useMemo(() => {
    if (playhead == null || !primary?.path) return null;
    // Approximate playhead x from progress; y stays mid until path sampling exists.
    const x = 8 + Math.max(0, Math.min(1, playhead)) * 84;
    return { x, y: 50 };
  }, [playhead, primary?.path]);

  return (
    <div className={`overflow-hidden rounded-2xl bg-ink/[0.04] px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="quiet-label">
          {mode === "measured" ? "Measured pitch (local)" : "Illustrative pitch patterns"}
        </p>
        {mode === "illustrative" ? (
          <span className="text-[10px] text-ink/40">teaching shape · not a lab plot</span>
        ) : (
          <span className="text-[10px] text-ink/40">normalized to your baseline</span>
        )}
      </div>
      <svg
        key={`${gid}-${playKey}`}
        viewBox="0 0 100 100"
        className="mt-1 w-full"
        style={{ height }}
        role="img"
        aria-label={mode === "measured" ? "Measured pitch contour" : "Illustrative pitch contour"}
      >
        {STAFF_YS.map((y, i) => (
          <line
            key={y}
            x1="4"
            y1={y}
            x2="96"
            y2={y}
            stroke="currentColor"
            strokeOpacity={y === 50 && showNaturalPitch ? 0.35 : 0.12}
            strokeWidth={y === 50 && showNaturalPitch ? 1.2 : 0.8}
            strokeDasharray={y === 50 && showNaturalPitch ? "2 2" : undefined}
          />
        ))}
        <text x="5" y="10" fontSize="4.5" fill="currentColor" opacity="0.45">
          High
        </text>
        <text x="5" y="96" fontSize="4.5" fill="currentColor" opacity="0.45">
          Low
        </text>
        {showNaturalPitch ? (
          <text x="52" y="48" fontSize="3.8" fill="currentColor" opacity="0.5" textAnchor="middle">
            {naturalLabel}
          </text>
        ) : null}
        {curves.map((c, i) => (
          <path
            key={`${i}-${c.path}`}
            d={c.path}
            fill="none"
            stroke={c.color}
            strokeWidth={i === 0 ? 3.2 : 2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={drawn ? (i === 0 ? 1 : 0.85) : 0}
            className={drawn ? "tone-pitch-draw" : undefined}
            pathLength={100}
            strokeDasharray={c.progress != null ? `${c.progress * 100} 100` : undefined}
          />
        ))}
        {head ? (
          <circle cx={head.x} cy={head.y} r="2.2" fill="var(--coral)" stroke="#fff" strokeWidth="0.6" />
        ) : null}
      </svg>
      {curves.some((c) => c.label) ? (
        <ul className="mt-1 flex flex-wrap gap-2 text-[10px] text-ink/55">
          {curves.map((c, i) =>
            c.label ? (
              <li key={i} className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: c.color }}
                  aria-hidden
                />
                {c.label}
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </div>
  );
}
