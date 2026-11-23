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
  /** Single speaker button for dense lists (tone rows, compare pairs). */
  compact?: boolean;
  className?: string;
};

export function ListenControls({
  text,
  phoneticHint,
  nativePath,
  onListened,
  compact = false,
  className,
}: Props) {
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

  if (compact) {
    return (
      <button
        type="button"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-coral shadow-sm ring-1 ring-[#e8d9c8] disabled:opacity-50 ${className ?? ""}`}
        disabled={busy}
        aria-label={`Play ${text}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void play(false);
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
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

