"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pickRecorderMime } from "@/lib/audioRecord";
import { browserStore } from "@/lib/experience/store";
import {
  DEFAULT_LEVEL,
  GOALS,
  LEVEL_OPTIONS,
  MINUTE_OPTIONS,
  RECOMMENDED_MINUTES,
  TRACK_NOTE,
  canLeaveGoals,
  toggleGoal,
  type DailyMinutes,
  type GoalId,
  type LevelId,
} from "@/lib/english/onboarding";
import { loadEnglishProgress, saveEnglishProgress } from "@/lib/english/progress";
import { primaryBtn, secondaryBtn } from "./EnShell";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<GoalId[]>([]);
  const [level, setLevel] = useState<LevelId>(DEFAULT_LEVEL);
  const [minutes, setMinutes] = useState<DailyMinutes>(RECOMMENDED_MINUTES);
  const [micError, setMicError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  function finish(mic: "granted" | "listening_only") {
    const store = browserStore();
    const progress = loadEnglishProgress(store);
    saveEnglishProgress(
      {
        ...progress,
        onboardingCompleted: true,
        goals,
        level,
        dailyMinutes: minutes,
        mic,
      },
      store,
    );
    router.push("/en");
  }

  async function testMic() {
    setMicError(null);
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickRecorderMime();
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      const stopped = new Promise<void>((resolve) => {
        recorder.addEventListener("stop", () => resolve(), { once: true });
      });
      recorder.start();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      recorder.stop();
      await stopped;
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: mime ?? "audio/webm" });
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(URL.createObjectURL(blob));
      setRecording(false);
    } catch {
      setRecording(false);
      setMicError("Chưa bật được micro. Bạn vẫn học bằng cách nghe.");
    }
  }

  return (
    <div className="en-ui studio-shell">
      <main id="en-main">
        <p className="text-base">Bước {step + 1} / 5</p>
        {step === 0 ? (
          <section className="mt-4 space-y-5">
            <h1 className="en-instruction font-display text-4xl">Chào mừng bạn đến với lớp học tiếng Anh.</h1>
            <p className="text-lg">Không cần tài khoản để học bài đầu. Tiến độ lưu trên máy này.</p>
            <button type="button" className={primaryBtn} onClick={() => setStep(1)}>
              Tiếp tục
            </button>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="mt-4 space-y-4">
            <h1 className="en-instruction">Bạn muốn dùng tiếng Anh để làm gì?</h1>
            <p>Chọn một hoặc nhiều mục.</p>
            <fieldset className="space-y-3">
              <legend className="sr-only">Mục tiêu</legend>
              {GOALS.map((goal) => (
                <label key={goal.id} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-[#1b2a4a] px-4">
                  <input
                    type="checkbox"
                    className="h-6 w-6"
                    checked={goals.includes(goal.id)}
                    onChange={() => setGoals(toggleGoal(goals, goal.id))}
                  />
                  <span className="text-lg">{goal.label}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" className={primaryBtn} disabled={!canLeaveGoals(goals)} onClick={() => setStep(2)}>
              Tiếp tục
            </button>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-4 space-y-4">
            <h1 className="en-instruction">Bạn đã biết tiếng Anh đến đâu?</h1>
            <fieldset className="space-y-3">
              <legend className="sr-only">Trình độ</legend>
              {LEVEL_OPTIONS.map((option) => (
                <label key={option.id} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-[#1b2a4a] px-4">
                  <input
                    type="radio"
                    name="level"
                    className="h-6 w-6"
                    checked={level === option.id}
                    onChange={() => setLevel(option.id)}
                  />
                  <span className="text-lg">{option.label}</span>
                </label>
              ))}
            </fieldset>
            <p>{TRACK_NOTE}</p>
            <button type="button" className={primaryBtn} onClick={() => setStep(3)}>
              Tiếp tục
            </button>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="mt-4 space-y-4">
            <h1 className="en-instruction">Mỗi ngày bạn muốn học bao lâu?</h1>
            <fieldset className="grid gap-3">
              <legend className="sr-only">Số phút</legend>
              {MINUTE_OPTIONS.map((option) => (
                <label key={option} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-[#1b2a4a] px-4">
                  <input
                    type="radio"
                    name="minutes"
                    className="h-6 w-6"
                    checked={minutes === option}
                    onChange={() => setMinutes(option)}
                  />
                  <span className="text-lg">
                    {option} phút{option === RECOMMENDED_MINUTES ? " · Gợi ý" : ""}
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="button" className={primaryBtn} onClick={() => setStep(4)}>
              Tiếp tục
            </button>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="mt-4 space-y-4">
            <h1 className="en-instruction">Thử micro</h1>
            <p className="text-lg">
              Micro chỉ bật khi bạn bấm nút bên dưới. Nói một câu ngắn, rồi nghe lại. Nếu bạn không muốn bật micro, hãy học bằng cách nghe.
            </p>
            <button type="button" className={primaryBtn} disabled={recording} onClick={() => void testMic()}>
              <MicIcon />
              {recording ? "Đang nghe…" : "Bật micro và thử"}
            </button>
            {blobUrl ? (
              <div className="space-y-2">
                <p>Nghe lại bản thử:</p>
                <audio src={blobUrl} controls className="w-full" />
                <button type="button" className={primaryBtn} onClick={() => finish("granted")}>
                  Micro ổn, vào lớp
                </button>
              </div>
            ) : null}
            {micError ? <p role="status">{micError}</p> : null}
            <button type="button" className={secondaryBtn} onClick={() => finish("listening_only")}>
              Học bằng cách nghe
            </button>
            <Link href="/en/lesson/d01" className="inline-block text-lg underline">
              Học thử bài chào hỏi
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
