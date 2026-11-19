"use client";

import { useEffect, useState } from "react";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";
import type { PhonicsStep } from "@/lib/phonics";
import { sequenceLabel } from "@/lib/phonics";
import { LocalMicRecorder } from "@/components/LocalMicRecorder";

type Speed = "normal" | "slow" | "step";

type Props = {
  steps: PhonicsStep[];
  target?: string;
  meaningEn?: string;
  onComplete?: () => void;
  onAttempt?: () => void;
};

export function SyllableBuilder({ steps, target, meaningEn, onComplete, onAttempt }: Props) {
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState<Speed>("step");
  const [busy, setBusy] = useState(false);
  const [heardFinal, setHeardFinal] = useState(false);

  const current = steps[index];
  const label = sequenceLabel(steps);

  useEffect(() => {
    setIndex(0);
    setHeardFinal(false);
    stopSpeaking();
  }, [steps]);

  async function playStep(i: number, slow: boolean) {
    const step = steps[i];
    if (!step) return;
    setBusy(true);
    onAttempt?.();
    try {
      await speakVietnamese(step.utterance, { slow });
      if (i === steps.length - 1) {
        setHeardFinal(true);
        onComplete?.();
      }
    } catch {
      if (i === steps.length - 1) {
        setHeardFinal(true);
        onComplete?.();
      }
    } finally {
      setBusy(false);
    }
  }

  async function playAll() {
    setBusy(true);
    onAttempt?.();
    const slow = speed === "slow";
    try {
      for (let i = 0; i < steps.length; i += 1) {
        setIndex(i);
        await speakVietnamese(steps[i].utterance, { slow });
        if (speed === "step") {
          await new Promise((r) => setTimeout(r, 380));
        } else {
          await new Promise((r) => setTimeout(r, slow ? 220 : 120));
        }
      }
      setHeardFinal(true);
      onComplete?.();
    } catch {
      setHeardFinal(true);
      onComplete?.();
    } finally {
      setBusy(false);
    }
  }

  function go(delta: number) {
    stopSpeaking();
    setIndex((i) => Math.min(steps.length - 1, Math.max(0, i + delta)));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="ami-card px-4 py-5 text-center">
        <p className="quiet-label">Đánh Vần</p>
        <p className="mt-2 font-display text-lg text-ink/70" lang="vi">
          {label}
        </p>
        {target ? (
          <p className="mt-4 font-hand text-6xl font-medium text-ink animate-riseIn" lang="vi">
            {target}
          </p>
        ) : null}
        {meaningEn ? (
          <p className="mt-2 text-base leading-snug text-ink/55" lang="en">
            {meaningEn}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-2" aria-label="Build steps">
        {steps.map((step, i) => {
          const active = i === index;
          const done = i < index;
          return (
            <button
              key={`${step.display}-${i}`}
              type="button"
              disabled={busy}
              onClick={() => {
                setIndex(i);
                void playStep(i, speed !== "normal");
              }}
              className={`flex min-w-[3.5rem] max-w-[5.5rem] flex-col items-center rounded-2xl px-2.5 py-3 transition ${
                active
                  ? "bg-coral text-paper shadow-soft scale-105"
                  : done
                    ? "bg-amber/25 text-ink ring-1 ring-coral/30"
                    : "bg-soft text-ink/55"
              }`}
            >
              <span className="font-hand text-2xl font-medium leading-none" lang="vi">
                {step.display}
              </span>
              <span className="mt-1 text-[10px] opacity-80" lang="vi">
                {step.utterance}
              </span>
              {step.glossEn ? (
                <span
                  className={`mt-1 line-clamp-2 text-center text-[10px] leading-tight ${
                    active ? "text-paper/85" : "text-ink/45"
                  }`}
                  lang="en"
                >
                  {step.glossEn}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {current ? (
        <div className="ami-card px-4 py-4 text-center animate-riseIn" key={index}>
          <p className="quiet-label">{current.kind}</p>
          <p className="mt-2 font-hand text-5xl text-ink" lang="vi">
            {current.display}
          </p>
          <p className="mt-1 text-sm text-ink/55" lang="vi">
            Say: {current.utterance}
          </p>
          {current.glossEn ? (
            <p className="mt-2 text-sm leading-snug text-ink/50" lang="en">
              {current.glossEn}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["step", "slow", "normal"] as Speed[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`teacher-btn-secondary py-2 text-sm capitalize ${
              speed === s ? "ring-2 ring-coral/50" : ""
            }`}
            onClick={() => setSpeed(s)}
          >
            {s === "step" ? "Step by step" : s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="teacher-btn-primary"
          disabled={busy}
          onClick={() => void playAll()}
        >
          {busy ? "Playing…" : "Play sequence"}
        </button>
        <button
          type="button"
          className="teacher-btn-secondary"
          disabled={busy || index <= 0}
          onClick={() => go(-1)}
        >
          Prev
        </button>
        <button
          type="button"
          className="teacher-btn-secondary"
          disabled={busy || index >= steps.length - 1}
          onClick={() => {
            go(1);
            void playStep(Math.min(steps.length - 1, index + 1), speed !== "normal");
          }}
        >
          Next part
        </button>
        <button type="button" className="teacher-btn-secondary" onClick={() => stopSpeaking()}>
          Stop
        </button>
      </div>

      <div className="ami-card px-4 py-4">
        <p className="quiet-label">Practice</p>
        <p className="mt-1 text-sm text-ink/60">
          Record and replay yourself. No automatic score yet — compare to the teacher model.
        </p>
        <LocalMicRecorder label="Record this syllable" />
        {!heardFinal ? (
          <p className="mt-3 text-xs text-ink/45">Play through to the final syllable to stamp progress.</p>
        ) : (
          <p className="mt-3 text-sm text-coral">Heard the full sequence — you can mark this lesson done.</p>
        )}
      </div>
    </div>
  );
}
