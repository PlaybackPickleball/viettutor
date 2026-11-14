"use client";

import { useRef, useState } from "react";
import {
  deleteLocalMp3,
  probeAudioDuration,
  saveLocalMp3,
  type LocalMp3Record,
} from "@/lib/sing/localMedia";

type Props = {
  songId: string;
  songTitle: string;
  existing: LocalMp3Record | null;
  onChanged: () => void;
};

/**
 * Dev Mode only: import an MP3 from this device into IndexedDB.
 * Never uploads or creates a public URL route.
 */
export function LocalMp3Importer({ songId, songTitle, existing, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    const okType =
      file.type.includes("audio") ||
      /\.mp3$/i.test(file.name) ||
      /\.m4a$/i.test(file.name) ||
      /\.wav$/i.test(file.name);
    if (!okType) {
      setError("Please choose an audio file (MP3 preferred).");
      return;
    }
    setBusy(true);
    try {
      const durationSec = await probeAudioDuration(file);
      await saveLocalMp3(songId, file, durationSec);
      onChanged();
    } catch {
      setError("Could not save the file on this device.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteLocalMp3(songId);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ami-card mt-5 px-4 py-5">
      <p className="quiet-label">Dev Mode · Local import</p>
      <h2 className="mt-1 font-display text-xl text-ink">Import MP3 for {songTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        File stays in this browser’s IndexedDB only — not uploaded, not in Git, not served by a
        public URL. Use your own copy of the reference track for timing tests.
      </p>

      {existing ? (
        <div className="mt-4 rounded-2xl bg-soft px-3 py-3 text-sm text-ink/70">
          <p className="font-medium text-ink">{existing.fileName}</p>
          <p className="mt-1 text-xs text-ink/45">
            {(existing.byteSize / (1024 * 1024)).toFixed(2)} MB
            {existing.durationSec
              ? ` · ${Math.round(existing.durationSec)}s`
              : ""}{" "}
            · imported {new Date(existing.importedAt).toLocaleString("en-GB", {
              timeZone: "Asia/Saigon",
            })}{" "}
            (Asia/Saigon)
          </p>
          <button
            type="button"
            className="teacher-btn-secondary mt-3 w-full py-2 text-sm"
            disabled={busy}
            onClick={() => void remove()}
          >
            Remove from this device
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink/50">No local file yet — import to unlock the player.</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/*,.mp3,.m4a,.wav"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        className="teacher-btn-primary mt-4 w-full"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Saving…" : existing ? "Replace local MP3" : "Import local MP3"}
      </button>
      {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
    </section>
  );
}
