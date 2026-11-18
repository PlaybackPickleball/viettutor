"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { pickRecorderMime } from "@/lib/audioRecord";
import {
  VI_GOALS,
  VI_LEVEL_OPTIONS,
  canLeaveViGoals,
  completeViOnboarding,
  toggleViGoal,
  type ViGoalId,
  type ViLevelId,
} from "@/lib/viOnboarding";

const MINUTES = [5, 10, 15, 20] as const;

export function ViOnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<ViGoalId[]>([]);
  const [level, setLevel] = useState<ViLevelId>("none");
  const [minutes, setMinutes] = useState<(typeof MINUTES)[number]>(10);
  const [mic, setMic] = useState<"granted" | "listening_only" | null>(null);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  function finish(micStatus: "granted" | "listening_only") {
    completeViOnboarding({
      dailyMinutes: minutes,
      mic: micStatus,
      goals,
      level,
    });
    const first = goals.includes("songs")
      ? "/sing"
      : goals.includes("alphabet") || goals.length === 0
        ? "/studio/a/hear"
        : "/danh-van";
    router.push(first);
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
      <p className="mt-1 text-sm text-ink/50">Step {step + 1} / 5</p>

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
          <p className="quiet-label">Goals</p>
          <p className="mt-2 font-display text-xl text-ink">What do you want Vietnamese for?</p>
          <p className="mt-1 text-sm text-ink/55">Pick one or more.</p>
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Goals</legend>
            {VI_GOALS.map((goal) => (
              <label
                key={goal.id}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 ${
                  goals.includes(goal.id) ? "bg-coral/15 ring-1 ring-coral/40" : "bg-soft"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={goals.includes(goal.id)}
                  onChange={() => setGoals(toggleViGoal(goals, goal.id))}
                />
                <span className="text-sm text-ink">{goal.label}</span>
              </label>
            ))}
          </fieldset>
          <button
            type="button"
            className="teacher-btn-primary mt-5 w-full"
            disabled={!canLeaveViGoals(goals)}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="ami-card mt-6 px-4 py-5">
          <p className="quiet-label">Starting point</p>
          <p className="mt-2 font-display text-xl text-ink">Where are you now?</p>
          <div className="mt-4 space-y-2">
            {VI_LEVEL_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                  level === option.id ? "bg-coral text-paper" : "bg-soft text-ink/75"
                }`}
                onClick={() => setLevel(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink/45">
            Everyone still starts with letter <span lang="vi">a</span> — this just helps pace the
            path.
          </p>
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={() => setStep(3)}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 3 ? (
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
          <button type="button" className="teacher-btn-primary mt-5 w-full" onClick={() => setStep(4)}>
            Continue
          </button>
        </section>
      ) : null}

      {step === 4 ? (
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
            {mic === "granted" ? "Start learning" : "Skip for now · Start learning"}
          </button>
        </section>
      ) : null}

      <Link href="/welcome" className="mt-6 text-center text-sm text-ink/45 underline">
        Back to course chooser
      </Link>
    </div>
  );
}
