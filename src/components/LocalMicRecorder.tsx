"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  disabled?: boolean;
  label?: string;
};

/**
 * Private mic take: MediaRecorder → local blob URL playback. Never uploaded.
 */
export function LocalMicRecorder({ disabled, label = "Record yourself" }: Props) {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (url) URL.revokeObjectURL(url);
        setUrl(URL.createObjectURL(blob));
        setRecording(false);
      };
      mediaRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setError("Microphone permission needed — or unavailable on this device.");
      setRecording(false);
    }
  }

  function stop() {
    mediaRef.current?.stop();
  }

  function clear() {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
  }

  return (
    <div className="mt-3">
      <p className="quiet-label">{label}</p>
      <p className="mt-1 text-xs text-ink/45">Stays on this device — not uploaded.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {!recording ? (
          <button
            type="button"
            className="teacher-btn-amber py-2 text-sm"
            disabled={disabled}
            onClick={() => void start()}
          >
            Start recording
          </button>
        ) : (
          <button type="button" className="teacher-btn-primary py-2 text-sm" onClick={stop}>
            Stop
          </button>
        )}
        {url ? (
          <>
            <audio controls src={url} className="h-10 w-full max-w-xs" />
            <button type="button" className="teacher-btn-secondary py-2 text-sm" onClick={clear}>
              Delete take
            </button>
          </>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
    </div>
  );
}
