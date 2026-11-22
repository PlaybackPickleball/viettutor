"use client";

import { useState } from "react";
import { alphabetNativePathForGrapheme } from "@/lib/alphabetAudio";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";

type Props = {
  text: string;
  phoneticHint?: string;
  /** Verified native file under /public when available; 404 → TTS placeholder. */
  nativePath?: string | null;
  onListened?: () => void;
};

export function ListenControls({ text, phoneticHint, nativePath, onListened }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedNative =
    nativePath?.trim() || alphabetNativePathForGrapheme(text) || null;

  async function play(slow = false) {
    setError(null);
    setBusy(true);
    try {
      // Do not race the full playback against a short timeout — that used to
      // call stopSpeaking() mid-utterance for 2-letter syllables / slower TTS.
      await speakVietnamese(text, {
        slow,
        phoneticHint,
        nativePath: resolvedNative ?? undefined,
        preferNative: Boolean(resolvedNative),
      });
      onListened?.();
    } catch {
      stopSpeaking();
      setError(
        "Audio unavailable right now — continue anyway (TTS is a placeholder until a native take ships).",
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
        Native Southern recording when verified; otherwise AI TTS or browser speech — never a silent
        “verified” fake.
      </p>
      {error ? <p className="text-sm text-amber">{error}</p> : null}
    </div>
  );
}
