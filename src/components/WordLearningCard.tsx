"use client";

import { speakVietnamese } from "@/lib/audio";
import type { TutorExplanation } from "@/lib/services/types";

type Props = {
  explanation: TutorExplanation;
  onSave?: () => void;
  saved?: boolean;
  onPractice?: () => void;
};

export function WordLearningCard({ explanation, onSave, saved, onPractice }: Props) {
  async function listen(slow = false) {
    try {
      await speakVietnamese(explanation.expression, { slow });
    } catch {
      /* TTS optional */
    }
  }

  return (
    <div className="ami-card animate-pop px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl text-ink" lang="vi">
            {explanation.expression}
          </p>
          <p className="mt-1 text-lg text-ink/60">{explanation.meaningEn}</p>
        </div>
        <button type="button" className="circle-btn" onClick={() => listen(false)} aria-label="Listen">
          <SpeakerIcon />
        </button>
      </div>

      {explanation.note ? <p className="mt-3 text-sm text-ink/65">{explanation.note}</p> : null}
      {explanation.inContext ? (
        <p className="mt-2 text-sm text-ink/55">{explanation.inContext}</p>
      ) : null}
      {explanation.toneHint ? (
        <p className="mt-2 text-xs text-ink/45">Tone note: {explanation.toneHint}</p>
      ) : null}
      <p className="mt-2 text-[11px] uppercase tracking-wider text-ink/35">
        Source · {explanation.source}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={() => listen(true)}>
          Slow
        </button>
        {onPractice ? (
          <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={onPractice}>
            Speak
          </button>
        ) : null}
        {onSave ? (
          <button type="button" className="teacher-btn-primary py-2 text-sm" onClick={onSave}>
            {saved ? "Saved ✓" : "Save word"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10v4h3l5 4V6L7 10H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
