"use client";

import { useEffect, useRef, useState } from "react";
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
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, [blobUrl]);

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

  async function start() {
    setError(null);
    setResult(null);
    if (!listened) {
      setError("Listen to the teacher first — then open the mic.");
      return;
    }
    if (disabled) return;

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setMicBlocked(true);
      setError("Microphone needs HTTPS or localhost. Use a demo practice take below.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicBlocked(true);
      setError("This browser can’t open the mic. Use a demo practice take below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const durationMs = Date.now() - startedAt.current;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        await runScore(durationMs);
      };
      mediaRef.current = recorder;
      startedAt.current = Date.now();
      recorder.start();
      setRecording(true);
      setMicBlocked(false);
    } catch {
      setMicBlocked(true);
      setError("Mic permission denied. Allow the mic, or use a demo practice take.");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function simulatePractice() {
    if (!listened || scoring || recording || disabled) return;
    setError(null);
    setResult(null);
    setBlobUrl(null);
    await runScore(1200);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center gap-5 py-2">
        {recording ? (
          <span
            aria-hidden
            className="absolute h-24 w-24 animate-pulseRing rounded-full border-2 border-coral/50"
          />
        ) : null}

        {!recording ? (
          <button
            type="button"
            className="circle-btn-primary disabled:opacity-40"
            disabled={!listened || scoring || disabled}
            onClick={start}
            aria-label="Record"
          >
            <MicIcon />
          </button>
        ) : (
          <button type="button" className="circle-btn-primary" onClick={stop} aria-label="Stop">
            <StopIcon />
          </button>
        )}

        {onReplayLast ? (
          <button type="button" className="circle-btn" onClick={onReplayLast} aria-label="Replay">
            <ReplayIcon />
          </button>
        ) : null}
      </div>

      <p className="text-center text-sm text-ink/55">
        {disabled
          ? "Set complete — see your average below."
          : `Take ${Math.min(attemptIndex + 1, takeTotal)} of ${takeTotal} — say the sound clearly.`}
      </p>

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

function StopIcon() {
  return <span className="h-5 w-5 rounded-sm bg-paper" />;
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
