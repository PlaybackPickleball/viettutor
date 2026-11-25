"use client";

import { useRef, useState } from "react";
import { ListenControls } from "@/components/ListenControls";
import { TonePitchGraph } from "@/components/tones/TonePitchGraph";
import {
  contourToSvgPath,
  extractPitchContour,
  getToneCard,
  normalizeToBaseline,
  pitchPathFor,
  type ToneDialect,
  type ToneId,
} from "@/lib/tones";

type Props = {
  toneId: ToneId;
  dialect: ToneDialect;
  baselineHz: number | null;
};

type Feedback =
  | "Steady pitch — keep practicing."
  | "Good rising pitch."
  | "Try keeping your voice steadier."
  | "Try lowering your voice toward the end."
  | "Try rising toward the end."
  | "Try a short low finish."
  | "Recording unclear. Please try again.";

function feedbackFor(toneId: ToneId, points: { t: number; y: number }[]): Feedback {
  if (points.length < 4) return "Recording unclear. Please try again.";
  const mid = points[Math.floor(points.length / 2)]!.y;
  const end = points[points.length - 1]!.y;
  const start = points[0]!.y;
  // y: 0 = high, 1 = low (normalized display)
  const rise = start - end; // positive => ended higher
  const fall = end - start;
  if (toneId === "ngang") {
    return Math.abs(rise) < 0.22
      ? "Steady pitch — keep practicing."
      : "Try keeping your voice steadier.";
  }
  if (toneId === "sac" || toneId === "nga") {
    return rise > 0.12 ? "Good rising pitch." : "Try rising toward the end.";
  }
  if (toneId === "nang") {
    return end > 0.55 ? "Try a short low finish." : "Try a short low finish.";
  }
  if (toneId === "huyen") {
    return fall > 0.08
      ? "Try lowering your voice toward the end."
      : "Try lowering your voice toward the end.";
  }
  if (toneId === "hoi") {
    return mid > start + 0.05 ? "Good rising pitch." : "Try rising toward the end.";
  }
  return "Recording unclear. Please try again.";
}

/** Exercise D — record, extract local pitch, compare illustratively. No fake %. */
export function TonePronunciationPractice({ toneId, dialect, baselineHz }: Props) {
  const card = getToneCard(toneId);
  const [learnerPath, setLearnerPath] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [recording, setRecording] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  if (!card) return null;

  async function record() {
    setFeedback(null);
    setLearnerPath(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        try {
          const buf = await blob.arrayBuffer();
          const ctx = new AudioContext();
          const decoded = await ctx.decodeAudioData(buf.slice(0));
          const contour = extractPitchContour(decoded.getChannelData(0), decoded.sampleRate);
          await ctx.close();
          const base = baselineHz ?? contour.baselineHz;
          if (!base || contour.voicedRatio < 0.12) {
            setFeedback("Recording unclear. Please try again.");
            return;
          }
          const pts = normalizeToBaseline(contour.samples, base);
          const path = contourToSvgPath(pts);
          setLearnerPath(path);
          setFeedback(feedbackFor(toneId, pts));
          setPlayKey((k) => k + 1);
        } catch {
          setFeedback("Recording unclear. Please try again.");
        }
      };
      setRecording(true);
      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 1800);
    } catch {
      setFeedback("Recording unclear. Please try again.");
      setRecording(false);
    }
  }

  return (
    <section className="space-y-3">
      <p className="quiet-label">Exercise D · Pronounce the tone</p>
      <p className="font-hand text-center text-5xl text-ink" lang="vi">
        {card.written}
      </p>
      <ListenControls text={card.utterance} />
      <TonePitchGraph
        playKey={playKey}
        mode={learnerPath ? "measured" : "illustrative"}
        curves={[
          {
            path: pitchPathFor(card, dialect),
            color: card.accentStroke,
            label: "Native (illustrative)",
          },
          ...(learnerPath
            ? [{ path: learnerPath, color: "#3d2e24", label: "Your voice (measured)" }]
            : []),
        ]}
      />
      <button
        type="button"
        className="teacher-btn-primary w-full"
        disabled={recording}
        onClick={() => void record()}
      >
        {recording ? "Recording…" : "Record your pronunciation"}
      </button>
      {feedback ? <p className="text-sm text-ink/70">{feedback}</p> : null}
      <p className="text-xs text-ink/45">
        Pitch alone cannot prove tone accuracy — duration, voice quality, and region also matter. No
        numerical score until validated against native judgments.
      </p>
    </section>
  );
}
