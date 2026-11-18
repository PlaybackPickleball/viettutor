import type { ScoreResult } from "@/lib/pronunciation";
import { CompareReplayPanel } from "@/components/CompareReplayPanel";

const DIMENSION_LABEL: Record<ScoreResult["dimension"], string> = {
  tone: "Tone / pitch",
  vowel: "Vowel",
  final: "Final sound",
  timing: "Timing",
  unscoreable: "Couldn’t score",
  ok: "On track",
};

type Props = {
  result: ScoreResult;
  takeNumber?: number;
  takeTotal?: number;
  blobUrl?: string | null;
  onPlayTeacher?: () => void;
};

export function FeedbackCue({
  result,
  takeNumber,
  takeTotal,
  blobUrl,
  onPlayTeacher,
}: Props) {
  if (!result.scoringAvailable || result.quality == null) {
    return (
      <CompareReplayPanel
        tip={result.tip}
        experimentalLabel={result.experimentalLabel ?? "Scoring unavailable"}
        takeNumber={takeNumber}
        takeTotal={takeTotal}
        blobUrl={blobUrl}
        onPlayTeacher={onPlayTeacher}
      />
    );
  }

  const good = result.passed && result.dimension === "ok";
  return (
    <div
      className={`animate-riseIn ami-card px-4 py-4 ${
        good ? "border-emerald-200/80" : "border-coral/35"
      }`}
      role="status"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="quiet-label">{DIMENSION_LABEL[result.dimension]}</span>
        {result.simulated ? (
          <span className="rounded-md bg-ink/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-paper">
            Simulated scoring
          </span>
        ) : null}
        {takeNumber != null && takeTotal != null ? (
          <span className="text-xs text-ink/45">
            Take {takeNumber}/{takeTotal}
          </span>
        ) : null}
        <span className="ml-auto font-display text-lg text-coral">{result.quality}</span>
      </div>
      <p className="text-base leading-relaxed text-ink">{result.tip}</p>
      {result.evidence ? (
        <p className="mt-2 text-xs text-ink/45">{result.evidence}</p>
      ) : null}
    </div>
  );
}
