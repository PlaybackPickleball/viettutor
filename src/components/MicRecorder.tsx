"use client";

import { useEffect, useRef, useState } from "react";
import { pronunciationScorer, type ScoreResult } from "@/lib/pronunciation";
import { FeedbackCue } from "./FeedbackCue";

type Props = {
  letterId: string;
  grapheme: string;
  listened: boolean;
  attemptIndex: number;
  onScored: (result: ScoreResult) => void;
};

export function MicRecorder({
  letterId,
  grapheme,
  listened,
  attemptIndex,
  onScored,
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

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setMicBlocked(true);
      setError(
        "Microphone needs a secure context (HTTPS or localhost). Use the demo practice take below.",
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicBlocked(true);
      setError("This browser can’t open the mic. Use the demo practice take below.");
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
      setError(
        "Mic permission denied or unavailable. Allow the mic, or use a demo practice take.",
      );
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function simulatePractice() {
    if (!listened || scoring || recording) return;
    setError(null);
    setResult(null);
    setBlobUrl(null);
    // ~1.2s take so the mock doesn’t treat it as unscoreable
    await runScore(1200);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center py-4">
        {recording ? (
          <span
            aria-hidden
            className="absolute h-24 w-24 animate-pulseRing rounded-full border-2 border-amber/50"
          />
        ) : null}
        {!recording ? (
          <button
            type="button"
            className="teacher-btn-amber min-w-[10rem] disabled:opacity-40"
            disabled={!listened || scoring}
            onClick={start}
          >
            Record
          </button>
        ) : (
          <button type="button" className="teacher-btn-primary min-w-[10rem]" onClick={stop}>
            Stop
          </button>
        )}
      </div>

      {!listened ? (
        <p className="text-center text-sm text-ink/55">
          Mic stays closed until you’ve heard the reference.
        </p>
      ) : null}

      {(micBlocked || listened) && !recording ? (
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
          Mic needs HTTPS (or localhost) and browser permission. Demo take still shows simulated
          why-wrong feedback.
        </p>
      ) : null}

      {blobUrl ? (
        <div className="rounded-2xl bg-paper/70 px-4 py-3">
          <p className="quiet-label mb-2">Your take</p>
          <audio controls src={blobUrl} className="w-full" />
        </div>
      ) : null}

      {scoring ? (
        <p className="text-center text-sm text-ink/55">Checking pronunciation…</p>
      ) : null}

      {result ? <FeedbackCue result={result} /> : null}
      {error ? <p className="text-center text-sm text-amber">{error}</p> : null}
    </div>
  );
}
