"use client";

import { useState } from "react";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";

type Props = {
  text: string;
  onListened?: () => void;
};

export function ListenControls({ text, onListened }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function play(slow = false) {
    setError(null);
    setBusy(true);
    try {
      await Promise.race([
        speakVietnamese(text, { slow }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("TTS timeout")), 4500),
        ),
      ]);
      onListened?.();
    } catch {
      stopSpeaking();
      setError(
        "Browser speech unavailable or timed out — continue anyway (TTS is a placeholder).",
      );
      onListened?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="teacher-btn-primary min-w-[9rem]"
          disabled={busy}
          onClick={() => play(false)}
        >
          {busy ? "Playing…" : "Listen"}
        </button>
        <button
          type="button"
          className="teacher-btn-secondary"
          disabled={busy}
          onClick={() => play(true)}
        >
          Slow
        </button>
        <button type="button" className="teacher-btn-secondary" onClick={() => stopSpeaking()}>
          Stop
        </button>
      </div>
      <p className="text-xs text-ink/40">
        Natural Southern Vietnamese voice when AI TTS is available; otherwise browser speech —
        is preferred when available.
      </p>
      {error ? <p className="text-sm text-amber">{error}</p> : null}
    </div>
  );
}
