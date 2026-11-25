"use client";

import { useState } from "react";
import { TonePitchGraph } from "@/components/tones/TonePitchGraph";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import {
  pitchPathFor,
  syllableAudioPath,
  TONE_CARDS,
  type ToneDialect,
} from "@/lib/tones";

type Props = {
  dialect: ToneDialect;
  onContinue: () => void;
};

/** Chapter 1 — six tones side by side with sequential playback. */
export function ToneOverview({ dialect, onContinue }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const [busy, setBusy] = useState(false);

  async function playSequence() {
    if (busy) return;
    setBusy(true);
    try {
      for (const card of TONE_CARDS) {
        setActive(card.id);
        setPlayKey((k) => k + 1);
        const nativePath = syllableAudioPath(dialect, card.written);
        await speakVietnamese(card.utterance, {
          nativePath,
          preferNative: true,
        });
        await new Promise((r) => setTimeout(r, 280));
      }
    } finally {
      setActive(null);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 animate-riseIn">
      <header>
        <p className="quiet-label">Chapter 1</p>
        <h1 className="mt-1 font-display text-3xl text-ink">The 6 Vietnamese Tones</h1>
        <p className="mt-1 text-sm text-ink/60">
          Same letters. Different tones. Different meanings.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Vietnamese has <strong className="font-semibold text-ink">six written tone
          categories</strong> but only <strong className="font-semibold text-ink">five tone
          marks</strong> — ngang has no mark. Changing the tone can completely change the
          meaning, even when the letters stay the same.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TONE_CARDS.map((card) => {
          const on = active === card.id;
          return (
            <button
              key={card.id}
              type="button"
              className={`rounded-2xl px-1.5 py-3 text-center transition ${card.rowClass} ${
                on ? "ring-2 ring-coral scale-[1.02]" : ""
              }`}
              onClick={async () => {
                stopSpeaking();
                setActive(card.id);
                setPlayKey((k) => k + 1);
                await speakVietnamese(card.utterance, {
                  nativePath: syllableAudioPath(dialect, card.written),
                  preferNative: true,
                });
                setActive(null);
              }}
            >
              <span className="block text-lg" style={{ color: card.accentStroke }} aria-hidden>
                {card.id === "ngang" ? "—" : card.markChar}
              </span>
              <span className="mt-0.5 block text-[11px] font-semibold capitalize text-ink">
                {card.nameVi}
              </span>
              <span
                className="mt-1 block font-hand text-xl"
                style={{ color: card.accentStroke }}
                lang="vi"
              >
                {card.written}
              </span>
              <span className="mt-0.5 block text-[10px] leading-tight text-ink/45">
                {card.meaningEn}
              </span>
            </button>
          );
        })}
      </div>

      <TonePitchGraph
        playKey={playKey}
        showNaturalPitch
        naturalLabel="Mid · natural pitch"
        curves={TONE_CARDS.map((c) => ({
          path: pitchPathFor(c, dialect),
          color: active && active !== c.id ? `${c.accentStroke}55` : c.accentStroke,
          label: active === c.id ? c.nameVi : undefined,
        }))}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="teacher-btn-primary flex-1"
          disabled={busy}
          onClick={() => void playSequence()}
        >
          {busy ? "Playing sequence…" : "Play all six tones"}
        </button>
        <button type="button" className="teacher-btn-secondary flex-1" onClick={onContinue}>
          Find your natural pitch →
        </button>
      </div>

      <p className="text-xs text-ink/45">
        Tap any column to replay that tone. Native Southern/Northern clips play when available;
        otherwise AI TTS is a temporary placeholder.
      </p>
    </div>
  );
}
