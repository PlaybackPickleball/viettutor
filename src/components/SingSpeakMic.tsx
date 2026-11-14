"use client";

import { useEffect, useRef, useState } from "react";
import { pickRecorderMime, watchVoiceActivity } from "@/lib/audioRecord";
import { pronunciationScorer, type ScoreResult } from "@/lib/pronunciation";
import { FeedbackCue } from "./FeedbackCue";

type Props = {
  phrase: string;
  songId: string;
  attemptIndex: number;
  onScored?: (result: ScoreResult) => void;
};

/** Speak Mode mic — clear speech practice (not singing pitch scoring). */
export function SingSpeakMic({ phrase, songId, attemptIndex, onScored }: Props) {
  const [recording, setRecording] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [level, setLevel] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const stoppingRef = useRef(false);
  const mimeRef = useRef("audio/webm");

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    vadRef.current?.stop();
    vadRef.current = null;
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      try {
        mediaRef.current.stop();
      } catch {
        /* */
      }
    }
    mediaRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    stoppingRef.current = false;
  }

  async function finish(reason: "silence" | "max" | "no-speech") {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    vadRef.current?.stop();
    setLevel(0);
    const recorder = mediaRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecording(false);
      stoppingRef.current = false;
      return;
    }
    try {
      recorder.requestData();
    } catch {
      /* */
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
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRef.current = null;
    setRecording(false);
    stoppingRef.current = false;

    if (reason === "no-speech" || chunksRef.current.length === 0) {
      setError("I didn’t catch your voice — speak clearly, then pause.");
      return;
    }

    setScoring(true);
    setError(null);
    setStatus(reason === "silence" ? "Stopped after silence." : "Stopped.");
    try {
      const scored = await pronunciationScorer.score({
        letterId: `sing:${songId}`,
        grapheme: phrase,
        durationMs,
        attemptIndex,
      });
      setResult(scored);
      onScored?.(scored);
    } finally {
      setScoring(false);
    }
  }

  async function start() {
    setError(null);
    setResult(null);
    setStatus("Listening… speak the line, then pause.");
    chunksRef.current = [];
    stoppingRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickRecorderMime();
      mimeRef.current = mime || "audio/webm";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      startedAt.current = Date.now();
      recorder.start(100);
      setRecording(true);
      vadRef.current = watchVoiceActivity(
        stream,
        (reason) => void finish(reason),
        setLevel,
        { silenceMs: 900, maxMs: 6000, leadInMs: 350 },
      );
    } catch {
      setError("Microphone permission needed for Speak Mode.");
    }
  }

  return (
    <div>
      {!recording ? (
        <button
          type="button"
          className="teacher-btn-primary w-full"
          onClick={() => void start()}
          disabled={scoring}
        >
          {scoring ? "Scoring…" : "Hold to speak — tap to start"}
        </button>
      ) : (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${Math.min(100, level * 220)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-ink/55">{status}</p>
          <button
            type="button"
            className="teacher-btn-secondary mt-3 w-full"
            onClick={() => void finish("max")}
          >
            Stop
          </button>
        </div>
      )}
      {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
      {result ? (
        <div className="mt-3">
          <FeedbackCue result={result} />
        </div>
      ) : null}
    </div>
  );
}
