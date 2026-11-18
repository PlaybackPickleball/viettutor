"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { pickRecorderMime } from "@/lib/audioRecord";
import { completeViOnboarding } from "@/lib/viOnboarding";

const MINUTES = [5, 10, 15, 20] as const;

export function ViOnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [minutes, setMinutes] = useState<(typeof MINUTES)[number]>(10);
  const [mic, setMic] = useState<"granted" | "listening_only" | null>(null);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  function finish(micStatus: "granted" | "listening_only") {
    completeViOnboarding({ dailyMinutes: minutes, mic: micStatus });
    router.push("/studio/a/hear");
  }

  async function testMic() {
    setMicError(null);
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickRecorderMime();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      const stopped = new Promise<void>((resolve) => {
        recorder.addEventListener("stop", () => resolve(), { once: true });
      });
      recorder.start();
      await new Promise((r) => setTimeout(r, 1400));
      recorder.stop();
      await stopped;
      stream.getTracks().forEach((t) => t.stop());
      setMic("granted");
      setRecording(false);
    } catch {
      setRecording(false);
      setMic("listening_only");
      setMicError("Mic unavailable — you can still listen and write.");
    }
  }

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <p className="quiet-label mt-5">Learn Vietnamese · setup</p>
      <h1 className="mt-1 font-display text-3xl text-ink">A few steps first</h1>

      {step === 0 ? (
        <section className="ami-card mt-6 px-4 py-5">
          <p className="quiet-label">Dialect</p>
          <p className="mt-2 font-display text-2xl text-ink">Southern Vietnamese first</p>
          <p className="mt-2 text-sm text-ink/60">
            ÁMi Lingua starts with giọng Nam — the sounds you will hear in alphabet, Đánh Vần, and
            Sing. Northern can come later.
          </p>
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={() => setStep(1)}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="ami-card mt-6 px-4 py-5">
          <p className="quiet-label">Daily practice</p>
          <p className="mt-2 font-display text-xl text-ink">How many minutes today?</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                className={`rounded-2xl py-3 text-sm font-medium ${
                  minutes === m ? "bg-coral text-paper" : "bg-soft text-ink/70"
                }`}
                onClick={() => setMinutes(m)}
              >
                {m}m
              </button>
            ))}
          </div>
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={() => setStep(2)}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="ami-card mt-6 px-4 py-5">
          <p className="quiet-label">Microphone</p>
          <p className="mt-2 font-display text-xl text-ink">Optional mic check</p>
          <p className="mt-2 text-sm text-ink/60">
            Say practice uses record/replay. Automatic scores stay off until validated.
          </p>
          <button
            type="button"
            className="teacher-btn-primary mt-5 w-full"
            disabled={recording}
            onClick={() => void testMic()}
          >
            {recording ? "Listening…" : mic === "granted" ? "Mic works ★" : "Test microphone"}
          </button>
          {micError ? <p className="mt-2 text-sm text-coral">{micError}</p> : null}
          <button
            type="button"
            className="teacher-btn-secondary mt-3 w-full"
            onClick={() => finish(mic ?? "listening_only")}
          >
            {mic === "granted" ? "Start with letter a" : "Skip for now · Start with letter a"}
          </button>
        </section>
      ) : null}

      <Link href="/welcome" className="mt-6 text-center text-sm text-ink/45 underline">
        Back to course chooser
      </Link>
    </div>
  );
}
