"use client";

type Props = {
  tip: string;
  experimentalLabel?: string;
  takeNumber?: number;
  takeTotal?: number;
  blobUrl?: string | null;
  onPlayTeacher?: () => void;
};

/** Honest compare UI — never shows invented scores. */
export function CompareReplayPanel({
  tip,
  experimentalLabel = "Scoring unavailable",
  takeNumber,
  takeTotal,
  blobUrl,
  onPlayTeacher,
}: Props) {
  return (
    <div className="ami-card animate-riseIn px-4 py-4" role="status">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="quiet-label">Compare by ear</span>
        <span className="rounded-md bg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink/60">
          {experimentalLabel}
        </span>
        {takeNumber != null && takeTotal != null ? (
          <span className="text-xs text-ink/45">
            Take {takeNumber}/{takeTotal}
          </span>
        ) : null}
      </div>
      <p className="text-base leading-relaxed text-ink">{tip}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {onPlayTeacher ? (
          <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={onPlayTeacher}>
            Hear teacher
          </button>
        ) : null}
      </div>
      {blobUrl ? (
        <div className="mt-3">
          <p className="quiet-label mb-1">Your take</p>
          <audio controls src={blobUrl} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}
