"use client";

import { useEffect, useRef, useState } from "react";
import { pickRecorderMime, watchVoiceActivity } from "@/lib/audioRecord";
import { pronunciationScorer, type ScoreResult } from "@/lib/pronunciation";
import { FeedbackCue } from "./FeedbackCue";

type Props = {
  letterId: string;
  grapheme: string;
  listened: boolean;
  attemptIndex: number;
  takeTotal: number;
  disabled?: boolean;
  onScored: (result: ScoreResult) => void;
  onReplayLast?: () => void;
};

export function MicRecorder({
  letterId,
  grapheme,
  listened,
  attemptIndex,
  takeTotal,
  disabled,
  onScored,
  onReplayLast,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micBlocked, setMicBlocked] = useState(false);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const stoppingRef = useRef(false);
  const mimeRef = useRef<string>("audio/webm");

  useEffect(() => {
    return () => {
      cleanupCapture();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupCapture() {
    vadRef.current?.stop();
    vadRef.current = null;
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      try {
        mediaRef.current.stop();
      } catch {
        /* already stopped */
      }
    }
    mediaRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    stoppingRef.current = false;
  }

  async function runScore(durationMs: number) {
    setScoring(true);
    try {
      const scored = await pronunciationScorer.score({
        letterId,
        grapheme,
        durationMs,
        attemptIndex,
      });
      setResult(scored);
      onScored(scored);
    } finally {
      setScoring(false);
    }
  }

  async function finishRecording(reason: "silence" | "max" | "no-speech" | "manual") {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    vadRef.current?.stop();
    vadRef.current = null;
    setLevel(0);

    const recorder = mediaRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecording(false);
      stoppingRef.current = false;
      return;
    }

    // Flush final chunk before stop (fixes empty blobs in some browsers)
    try {
      recorder.requestData();
    } catch {
      /* unsupported */
    }

    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      try {
        recorder.stop();
      } catch {
        resolve();
      }
    });

    const durationMs = Date.now() - startedAt.current;
    const mime = mimeRef.current;
    const blob = new Blob(chunksRef.current, { type: mime });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRef.current = null;
    setRecording(false);

    if (reason === "no-speech" || blob.size < 800 || durationMs < 280) {
      setError("I didn’t catch your voice — speak a little louder, then pause.");
      setStatus(null);
      stoppingRef.current = false;
      return;
    }

    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    setStatus(
      reason === "silence"
        ? "Heard you — stopped after silence."
        : reason === "max"
          ? "Stopped at max length."
          : null,
    );
    stoppingRef.current = false;
    await runScore(durationMs);
  }

  async function start() {
    setError(null);
    setResult(null);
    setStatus(null);
    setLevel(0);
    if (!listened) {
      setError("Listen to the teacher first — then open the mic.");
      return;
    }
    if (disabled || recording || scoring) return;

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setMicBlocked(true);
      setError("Microphone needs HTTPS or localhost. Use a demo practice take below.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicBlocked(true);
      setError("This browser can’t open the mic. Use a demo practice take below.");
      return;
    }

    try {
      cleanupCapture();
      chunksRef.current = [];
      stoppingRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mime = pickRecorderMime();
      mimeRef.current = mime ?? "audio/webm";
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onerror = () => {
        setError("Recording failed — try again or use a demo practice take.");
        cleanupCapture();
        setRecording(false);
      };

      mediaRef.current = recorder;
      startedAt.current = Date.now();
      // timeslice keeps chunks flowing so the blob isn’t empty
      recorder.start(120);
      setRecording(true);
      setMicBlocked(false);
      setStatus("Listening… speak, then pause — I’ll stop for you.");

      vadRef.current = watchVoiceActivity(
        stream,
        (reason) => {
          void finishRecording(reason);
        },
        (lvl) => setLevel(lvl),
        { silenceMs: 1600, maxMs: 4000, speechThreshold: 0.04 },
      );
    } catch {
      cleanupCapture();
      setMicBlocked(true);
      setRecording(false);
      setError("Mic permission denied. Allow the mic, or use a demo practice take.");
    }
  }

  async function simulatePractice() {
    if (!listened || scoring || recording || disabled) return;
    setError(null);
    setResult(null);
    setBlobUrl(null);
    setStatus(null);
    await runScore(1200);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex flex-col items-center gap-3 py-2">
        <div className="relative flex items-center justify-center gap-5">
          {recording ? (
            <span
              aria-hidden
              className="absolute h-24 w-24 animate-pulseRing rounded-full border-2 border-coral/50"
            />
          ) : null}

          <button
            type="button"
            className="circle-btn-primary disabled:opacity-40"
            disabled={!listened || scoring || disabled || recording}
            onClick={start}
            aria-label={recording ? "Recording" : "Record"}
          >
            <MicIcon />
          </button>

          {onReplayLast ? (
            <button type="button" className="circle-btn" onClick={onReplayLast} aria-label="Replay">
              <ReplayIcon />
            </button>
          ) : null}
        </div>

        {recording ? (
          <div className="flex w-full max-w-xs flex-col items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10" aria-hidden>
              <div
                className="h-full rounded-full bg-coral transition-[width] duration-75"
                style={{ width: `${Math.max(4, Math.round(level * 100))}%` }}
              />
            </div>
            <p className="text-center text-sm text-coral">
              {level > 0.08 ? "Hearing you…" : "Waiting for your voice…"}
            </p>
          </div>
        ) : null}
      </div>

      <p className="text-center text-sm text-ink/55">
        {disabled
          ? "Set complete — see your average below."
          : `Take ${Math.min(attemptIndex + 1, takeTotal)} of ${takeTotal} — say the sound, then pause. No Stop button needed.`}
      </p>

      {status ? <p className="text-center text-sm text-ink/60">{status}</p> : null}

      {!listened ? (
        <p className="text-center text-sm text-ink/55">
          Mic stays closed until you’ve heard the reference.
        </p>
      ) : null}

      {(micBlocked || listened) && !recording && !disabled ? (
        <button
          type="button"
          className="teacher-btn-secondary w-full text-sm"
          disabled={!listened || scoring}
          onClick={simulatePractice}
        >
          {micBlocked ? "Demo practice take (no mic)" : "Demo practice take (optional)"}
        </button>
      ) : null}

      {micBlocked ? (
        <p className="text-center text-xs text-ink/45">
          Mic needs HTTPS (or localhost) and permission. Demo takes still feed the 10-rep average.
        </p>
      ) : null}

      {blobUrl ? (
        <div className="ami-card px-4 py-3">
          <p className="quiet-label mb-2">Your take</p>
          <audio controls src={blobUrl} className="w-full" />
        </div>
      ) : null}

      {scoring ? (
        <p className="text-center text-sm text-ink/55">Checking pronunciation…</p>
      ) : null}

      {result ? (
        <FeedbackCue result={result} takeNumber={attemptIndex + 1} takeTotal={takeTotal} />
      ) : null}
      {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M6 11a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17v3M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h6a5 5 0 1 1-4.9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M7 7V3M7 7h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
