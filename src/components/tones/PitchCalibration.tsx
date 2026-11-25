"use client";

import { useRef, useState } from "react";
import { ListenControls } from "@/components/ListenControls";
import { TonePitchGraph } from "@/components/tones/TonePitchGraph";
import {
  extractPitchContour,
  medianBaseline,
  setToneBaselinePitch,
  type ToneDialect,
} from "@/lib/tones";

type Props = {
  dialect: ToneDialect;
  baselineHz: number | null;
  onDone: (hz: number | null) => void;
  onSkip: () => void;
};

/** Chapter 2 — understand natural pitch + optional calibration. */
export function PitchCalibration({ dialect, baselineHz, onDone, onSkip }: Props) {
  const [takes, setTakes] = useState<number[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function recordOnce() {
    setStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        try {
          const buf = await blob.arrayBuffer();
          const ctx = new AudioContext();
          const decoded = await ctx.decodeAudioData(buf.slice(0));
          const channel = decoded.getChannelData(0);
          const contour = extractPitchContour(channel, decoded.sampleRate);
          await ctx.close();
          if (contour.voicedRatio < 0.15 || contour.baselineHz == null) {
            setStatus("Recording unclear — try again in a quiet place, speaking “ma” clearly.");
            return;
          }
          setTakes((prev) => [...prev, contour.baselineHz!].slice(-3));
          setStatus(`Take ${Math.min(3, takes.length + 1)} captured.`);
        } catch {
          setStatus("Could not read that recording — please try again.");
        }
      };
      setRecording(true);
      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 1600);
    } catch {
      setStatus("Microphone permission needed for optional calibration — you can skip.");
      setRecording(false);
    }
  }

  const estimate = medianBaseline(takes);

  function saveAndContinue() {
    const hz = estimate ?? baselineHz;
    if (hz != null) setToneBaselinePitch(hz);
    onDone(hz);
  }

  return (
    <div className="space-y-4 animate-riseIn">
      <header>
        <p className="quiet-label">Chapter 2</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Your natural speaking pitch</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Everyone has a different voice. Some people naturally speak higher; others lower. You do{" "}
          <strong className="font-semibold text-ink">not</strong> need to match the teacher’s exact
          pitch. Vietnamese tones are about how your voice{" "}
          <em>moves relative to your natural speaking voice</em>.
        </p>
      </header>

      <TonePitchGraph
        showNaturalPitch
        naturalLabel="Your natural speaking pitch"
        curves={[
          { path: "M 12 50 H 40", color: "#2a9d8f", label: "Speaker A · ma" },
          { path: "M 44 42 H 68", color: "#e07a4a", label: "Speaker B · ma" },
          { path: "M 72 58 H 92", color: "#457b9d", label: "Speaker C · ma" },
        ]}
      />
      <p className="text-sm text-ink/60">
        These three level tones sit at different absolute pitches — all can be ngang (“ma”). Relative
        shape matters more than matching a fixed frequency.
      </p>

      <div className="ami-card space-y-3 px-4 py-4">
        <p className="quiet-label">Hear ngang · ma ({dialect})</p>
        <ListenControls text="ma" />
      </div>

      <section className="ami-card space-y-3 px-4 py-4">
        <p className="quiet-label">Optional calibration</p>
        <p className="text-sm text-ink/65">
          Say “ma” three times in a comfortable speaking voice. We’ll estimate your baseline from
          voiced parts of the recording — never a fixed target frequency.
        </p>
        <p className="text-sm font-semibold text-ink">
          Takes: {takes.length} / 3
          {estimate ? ` · ~${Math.round(estimate)} Hz baseline` : ""}
        </p>
        <button
          type="button"
          className="teacher-btn-primary w-full"
          disabled={recording || takes.length >= 3}
          onClick={() => void recordOnce()}
        >
          {recording ? "Listening…" : takes.length >= 3 ? "Three takes ready" : "Record “ma”"}
        </button>
        {status ? <p className="text-sm text-ink/60">{status}</p> : null}
      </section>

      <div className="flex flex-col gap-2">
        <button type="button" className="teacher-btn-primary w-full" onClick={saveAndContinue}>
          Continue to each tone →
        </button>
        <button type="button" className="teacher-btn-secondary w-full text-sm" onClick={onSkip}>
          Skip calibration
        </button>
      </div>
    </div>
  );
}
