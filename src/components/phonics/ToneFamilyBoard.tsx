"use client";

import { useState } from "react";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import type { ToneCard } from "@/lib/phonics";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";

type Props = {
  cards: ToneCard[];
  onHeardAll?: () => void;
  onAttempt?: () => void;
};

export function ToneFamilyBoard({ cards, onHeardAll, onAttempt }: Props) {
  const [activeId, setActiveId] = useState(cards[0]?.id);
  const [heard, setHeard] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const active = cards.find((c) => c.id === activeId) ?? cards[0];

  async function play(card: ToneCard) {
    setActiveId(card.id);
    setBusy(true);
    onAttempt?.();
    try {
      await speakVietnamese(card.utterance);
      const next = { ...heard, [card.id]: true };
      setHeard(next);
      if (cards.every((c) => next[c.id])) onHeardAll?.();
    } catch {
      const next = { ...heard, [card.id]: true };
      setHeard(next);
      if (cards.every((c) => next[c.id])) onHeardAll?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="ami-card px-4 py-5 text-center">
        <p className="quiet-label">Six tones · Southern</p>
        {active ? (
          <>
            <p className="mt-3 font-hand text-6xl text-ink animate-riseIn" lang="vi">
              {active.written}
            </p>
            {active.meaningEn ? (
              <p className="mt-2 text-base leading-snug text-ink/55" lang="en">
                {active.meaningEn}
              </p>
            ) : null}
            <p className="mt-2 font-display text-xl text-ink">
              {active.nameVi}
              <span className="text-base font-sans font-normal text-ink/45"> · {active.nameEn}</span>
            </p>
            <div className="mx-auto mt-4 h-16 w-full max-w-xs" aria-hidden>
              <ToneContour hint={active.contourHint} toneId={active.id} />
            </div>
            <p className="mt-1 text-xs text-ink/45">{active.contourHint}</p>
          </>
        ) : null}
      </div>

      <ul className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const on = card.id === activeId;
          const done = Boolean(heard[card.id]);
          return (
            <li key={card.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => void play(card)}
                className={`flex w-full flex-col items-center rounded-2xl px-2 py-3 transition ${
                  on
                    ? "bg-coral text-paper shadow-soft"
                    : done
                      ? "bg-amber/20 text-ink ring-1 ring-coral/30"
                      : "bg-soft text-ink/60"
                }`}
                lang="vi"
              >
                <span className="font-hand text-2xl font-medium">{card.written}</span>
                <span className="mt-1 text-[10px] opacity-90">{card.nameVi}</span>
                {card.meaningEn ? (
                  <span
                    className={`mt-1 line-clamp-2 text-center text-[9px] leading-tight ${
                      on ? "text-paper/80" : "text-ink/40"
                    }`}
                    lang="en"
                  >
                    {card.meaningEn}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="teacher-btn-primary"
          disabled={busy || !active}
          onClick={() => active && void play(active)}
        >
          Listen
        </button>
        <button type="button" className="teacher-btn-secondary" onClick={() => stopSpeaking()}>
          Stop
        </button>
      </div>

      <div className="ami-card px-4 py-4">
        <p className="quiet-label">Compare</p>
        <p className="mt-1 text-sm text-ink/60">
          Record and replay. Contours are teaching hints — not scored pitch grades. No cross-dialect
          grading.
        </p>
        <LocalMicRecorder label="Record this tone" />
      </div>
    </div>
  );
}

function ToneContour({ hint, toneId }: { hint: string; toneId: string }) {
  const paths: Record<string, string> = {
    ngang: "M 8 32 H 152",
    sac: "M 8 48 L 152 12",
    huyen: "M 8 16 L 152 48",
    hoi: "M 8 24 Q 48 48, 80 36 Q 120 16, 152 20",
    nga: "M 8 28 L 60 20 L 70 40 L 152 16",
    nang: "M 8 20 L 90 44 L 152 48",
  };
  return (
    <svg viewBox="0 0 160 60" className="h-full w-full" role="img" aria-label={hint}>
      <path
        d={paths[toneId] ?? paths.ngang}
        fill="none"
        stroke="var(--coral)"
        strokeWidth="4"
        strokeLinecap="round"
        className="animate-riseIn"
      />
    </svg>
  );
}
