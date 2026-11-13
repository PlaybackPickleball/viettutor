"use client";

import { useEffect, useRef, useState } from "react";
import { pickRecorderMime, watchVoiceActivity } from "@/lib/audioRecord";
import { assessPronunciation } from "@/lib/services/speechService";
import type { SpeechAssessmentResult } from "@/lib/services/types";

type Props = {
  expectedText: string;
  lessonId: string;
};

/** Record + playback for reading practice. Never invents a pronunciation score. */
export function ReadingPracticeMic({ expectedText, lessonId }: Props) {
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<SpeechAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
      if (blobUrl) URL.revokeObjectURL(blobUrl);
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
    const blob = new Blob(chunksRef.current, { type: mimeRef.current });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRef.current = null;
    setRecording(false);
    stoppingRef.current = false;

    if (reason === "no-speech" || blob.size < 800) {
      setError("I didn’t catch your voice — speak, then pause.");
      return;
    }
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(URL.createObjectURL(blob));
    setStatus(reason === "silence" ? "Stopped after silence." : "Stopped.");
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    const result = await assessPronunciation({
      expectedText,
      audioBlob: blob,
      durationMs,
      lessonId,
      dialect: "southern",
      attemptNumber: nextAttempt,
    });
    setAssessment(result);
  }

  async function start() {
    setError(null);
    setAssessment(null);
    setStatus(null);
    try {
      cleanup();
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickRecorderMime();
      mimeRef.current = mime ?? "audio/webm";
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data);
      };
      mediaRef.current = recorder;
      startedAt.current = Date.now();
      recorder.start(120);
      setRecording(true);
      setStatus("Listening… speak, then pause.");
      vadRef.current = watchVoiceActivity(
        stream,
        (reason) => void finish(reason),
        (lvl) => setLevel(lvl),
        { silenceMs: 1600, maxMs: 5000 },
      );
    } catch {
      setError("Microphone permission needed (HTTPS or localhost).");
    }
  }

  return (
    <div className="ami-card px-4 py-4">
      <p className="quiet-label mb-2">Practice saying</p>
      <p className="font-display text-2xl text-ink" lang="vi">
        {expectedText}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="circle-btn-primary disabled:opacity-40"
          disabled={recording}
          onClick={start}
          aria-label="Record"
        >
          <MicIcon />
        </button>
        {recording ? (
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-coral"
                style={{ width: `${Math.max(4, Math.round(level * 100))}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-coral">Auto-stops after silence</p>
          </div>
        ) : null}
      </div>
      {status ? <p className="mt-2 text-sm text-ink/55">{status}</p> : null}
      {blobUrl ? <audio className="mt-3 w-full" controls src={blobUrl} /> : null}
      {assessment ? (
        <div className="mt-3 rounded-xl border border-[#e0d0bc] bg-soft/80 px-3 py-3 text-sm text-ink/75">
          <p className="quiet-label mb-1">
            {assessment.scoringAvailable ? "Assessment" : "Scoring unavailable"}
            {assessment.experimentalLabel ? ` · ${assessment.experimentalLabel}` : ""}
          </p>
          <p>{assessment.practiceTip}</p>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M6 11a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17v3M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
