"use client";

import { ToneMarkAnimation } from "@/components/tones/ToneMarkAnimation";
import { ToneMarkTrace } from "@/components/tones/ToneMarkTrace";
import { getToneCard, type ToneId } from "@/lib/tones";

type Props = {
  toneId: ToneId;
  onDone?: () => void;
};

/** Exercise C — animated demo then learner trace. */
export function ToneTracingPractice({ toneId, onDone }: Props) {
  const card = getToneCard(toneId);
  if (!card) return null;

  return (
    <section className="space-y-4">
      <p className="quiet-label">Exercise C · Write the tone</p>
      <p className="font-display text-xl text-ink capitalize">
        {card.nameVi}
        <span className="font-sans text-base text-ink/45"> · {card.written}</span>
      </p>
      <ToneMarkAnimation
        strokePath={card.markStrokePath}
        markChar={card.markChar}
        guideEn={card.strokeGuideEn}
        accent={card.accentStroke}
        empty={card.id === "ngang"}
      />
      <ToneMarkTrace
        strokePath={card.markStrokePath}
        guideEn={card.strokeGuideEn}
        markLabel={card.nameVi}
        onStamped={() => onDone?.()}
      />
    </section>
  );
}
