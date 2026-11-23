"use client";

type Props = {
  path: string;
  label: string;
  playKey?: number;
};

/** Animated pitch teaching line — mnemonic contour, not a scored measurement. */
export function TonePitchContour({ path, label, playKey = 0 }: Props) {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-soft/80 px-3 py-2">
      <p className="quiet-label">Pitch contour (teaching)</p>
      <svg
        key={playKey}
        viewBox="0 0 100 100"
        className="mt-1 h-14 w-full"
        role="img"
        aria-label={label}
      >
        <line
          x1="4"
          y1="50"
          x2="96"
          y2="50"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--coral)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="tone-pitch-draw"
        />
      </svg>
      <p className="mt-0.5 text-[11px] text-ink/45">{label}</p>
    </div>
  );
}
