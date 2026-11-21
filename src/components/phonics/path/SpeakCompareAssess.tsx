"use client";

import { useEffect, useRef, useState } from "react";
import { pickRecorderMime, watchVoiceActivity } from "@/lib/audioRecord";
import { PronunciationFeedbackCard } from "@/components/PronunciationFeedbackCard";
import { assessVietnamesePronunciation } from "@/lib/vi/assessClient";
import {
  recordPronunciationAttempt,
  summarizeItem,
} from "@/lib/vi/assessmentProgress";
import type { ViPronunciationFeedback } from "@/lib/vi/feedback";
import { feedbackUnavailable } from "@/lib/vi/feedback";

type Props = {
  itemId: string;
  expectedText: string;
  onPlayNative?: () => void;
  /** Called once when the learner has a usable take (scored or compare-only). */
  onPracticed?: () => void;
};

/**
 * Path speak-compare: record → Deepgram VI transcription match → feedback card.
 * Retries do not invent scores; tone stays unvalidated.
 */
export function SpeakCompareAssess({
  itemId,
  expectedText,
  onPlayNative,
  onPracticed,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ViPronunciationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [summary, setSummary] = useState(() => summarizeItem(itemId));
  const practicedRef = useRef(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const stoppingRef = useRef(false);
  const mimeRef = useRef("audio/webm");

  useEffect(() => {
    return () => {
      vadRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markPracticed() {
    if (practicedRef.current) return;
    practicedRef.current = true;
    onPracticed?.();
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
    const mime = mimeRef.current;
    const blob = new Blob(chunksRef.current, { type: mime });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRef.current = null;
    setRecording(false);
    stoppingRef.current = false;

    if (reason === "no-speech" || blob.size < 800 || durationMs < 280) {
      setError("Unable to assess reliably — please try again (louder, then pause).");
      setFeedback(
        feedbackUnavailable(
          "Unable to assess reliably — please try again.",
          "silence",
        ),
      );
      return;
    }

    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    setError(null);
    setScoring(true);
    try {
      const result = await assessVietnamesePronunciation({
        expected: expectedText,
        mime,
        audio: blob,
        itemId,
        dialect: "southern",
      });
      recordPronunciationAttempt({
        itemId,
        expectedText,
        dialect: "southern",
        accuracyScore: null,
        overallScore: null,
        toneScore: null,
        match: result.match,
        recognizedText: result.recognizedText,
        status: result.status,
      });
      setFeedback(result);
      setSummary(summarizeItem(itemId));
      markPracticed();
    } finally {
      setScoring(false);
    }
  }

  async function start() {
    setError(null);
    setFeedback(null);
    if (recording || scoring) return;
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Microphone needs HTTPS or localhost.");
      return;
    }
    try {
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
        if (e.data?.size) chunksRef.current.push(e.data);
      };
      mediaRef.current = recorder;
      startedAt.current = Date.now();
      recorder.start(120);
      setRecording(true);
      vadRef.current = watchVoiceActivity(
        stream,
        (reason) => void finishRecording(reason),
        (lvl) => setLevel(lvl),
        { silenceMs: 1600, maxMs: 4000, speechThreshold: 0.04 },
      );
    } catch {
      setError("Mic permission denied — allow the mic and try again.");
      setRecording(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="teacher-btn-amber py-2 text-sm"
          disabled={recording || scoring}
          onClick={() => void start()}
        >
          {recording ? "Listening…" : "Record pronunciation"}
        </button>
        {onPlayNative ? (
          <button
            type="button"
            className="teacher-btn-secondary py-2 text-sm"
            onClick={onPlayNative}
          >
            Play native
          </button>
        ) : null}
      </div>

      {recording ? (
        <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral transition-[width] duration-75"
            style={{ width: `${Math.max(4, Math.round(level * 100))}%` }}
          />
        </div>
      ) : null}

      {scoring ? (
        <p className="text-center text-sm text-ink/55">Checking transcription…</p>
      ) : null}

      {error ? <p className="text-center text-sm text-coral">{error}</p> : null}

      {feedback ? (
        <PronunciationFeedbackCard
          feedback={feedback}
          studentUrl={blobUrl}
          onPlayNative={onPlayNative}
          onTryAgain={() => void start()}
          matchCount={summary.matchCount}
          attemptCount={summary.attemptCount}
        />
      ) : (
        <p className="text-xs text-ink/45">
          Deepgram compares what it heard to the expected word (diacritics kept). That is a
          transcription match — not a pronunciation accuracy score. Tone scores stay off until a
          specialized model is validated.
        </p>
      )}
    </div>
  );
}
