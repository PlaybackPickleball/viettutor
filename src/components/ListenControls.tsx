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
      await speakVietnamese(text, { slow });
      onListened?.();
    } catch {
      setError("Audio placeholder — enable browser speech, or use a bundled sample later.");
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
        <button
          type="button"
          className="teacher-btn-secondary"
          onClick={() => stopSpeaking()}
        >
          Stop
        </button>
      </div>
      <p className="text-xs text-ink/40">
        Reference audio via Web Speech TTS (vi-VN). Bundled native samples can replace this later.
      </p>
      {error ? <p className="text-sm text-amber">{error}</p> : null}
    </div>
  );
}
