"use client";

import { useEffect, useRef, useState } from "react";
import { pickRecorderMime, watchVoiceActivity } from "@/lib/audioRecord";
import { browserStore } from "@/lib/experience/store";
import {
  assessFromTranscript,
  feedbackFromServiceFailure,
  isAzureAudioMime,
  resolveEnglishAssessment,
  type EnglishFeedback,
} from "@/lib/english/feedback";
import { loadEnglishProgress, saveEnglishProgress } from "@/lib/english/progress";
import { recordUnlocked, reduceRecording, type RecPhase } from "@/lib/english/recording";
import { captureEnglishTranscript, speakEnglish, stopEnglishSpeech } from "@/lib/english/speakClient";
import { HEARD_LABEL, RECORD_LABEL, REPLAY_LABEL, RETRY_LABEL, SLOW_LABEL, CONTINUE_LABEL } from "@/lib/english/a11y";
import { primaryBtn, secondaryBtn } from "./EnShell";

type Props = {
  expected: string;
  lessonId: string;
  /** Repeat steps keep the recording but do not score it. */
  score: boolean;
  onContinue: (feedback: EnglishFeedback | null) => void;
};

const playbackNote: EnglishFeedback = {
  source: "none",
  phonemeScoringAvailable: false,
  category: null,
  categoryLabel: null,
  observationVi: "Đã ghi để bạn nghe lại. Bước này không chấm điểm.",
  recognizedText: null,
  providerScore: null,
  failed: false,
  allowPraise: false,
};

export function SpeakTake({ expected, lessonId, score, onContinue }: Props) {
  const [phase, setPhase] = useState<RecPhase>("idle");
  const [heardModel, setHeardModel] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EnglishFeedback | null>(null);
  const [listeningOnly, setListeningOnly] = useState(false);
  const [level, setLevel] = useState(0);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const stoppingRef = useRef(false);
  const mimeRef = useRef("audio/webm");
  const transcriptRef = useRef<{ stop: () => Promise<string | null> } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const progress = loadEnglishProgress(browserStore());
    setListeningOnly(progress.mic === "listening_only" || progress.mic === "denied");
    return () => {
      cleanup();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      stopEnglishSpeech();
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
        /* already stopped */
      }
    }
    mediaRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    stoppingRef.current = false;
  }

  async function playModel(slow: boolean) {
    setSpeechError(null);
    try {
      const kind = await speakEnglish(expected, slow);
      setHeardModel(true);
      setVoiceNote(
        kind === "en-US"
          ? "Giọng mẫu là giọng Mỹ của máy, nếu máy có."
          : "Máy không có giọng en-US riêng. Vẫn đọc bằng giọng tiếng Anh có sẵn.",
      );
    } catch {
      setSpeechError("Máy này chưa đọc được tiếng Anh. Bạn vẫn đi tiếp được.");
      setHeardModel(true);
    }
  }

  function markListeningOnly() {
    const store = browserStore();
    const progress = loadEnglishProgress(store);
    saveEnglishProgress({ ...progress, mic: "listening_only" }, store);
    setListeningOnly(true);
    setPhase(reduceRecording(phase, { type: "use_listen_only" }));
  }

  async function start() {
    if (!recordUnlocked(heardModel)) return;
    setFeedback(null);
    setSpeechError(null);
    setPhase(reduceRecording("idle", { type: "ask" }));
    try {
      cleanup();
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const store = browserStore();
      const progress = loadEnglishProgress(store);
      saveEnglishProgress({ ...progress, mic: "granted" }, store);
      streamRef.current = stream;
      const mime = pickRecorderMime();
      mimeRef.current = mime ?? "audio/webm";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      mediaRef.current = recorder;
      startedAt.current = Date.now();
      transcriptRef.current = captureEnglishTranscript();
      recorder.start(120);
      setPhase("recording");
      vadRef.current = watchVoiceActivity(
        stream,
        (reason) => void finish(reason),
        (value) => setLevel(value),
        { silenceMs: 1400, maxMs: 8000 },
      );
    } catch {
      const store = browserStore();
      const progress = loadEnglishProgress(store);
      saveEnglishProgress({ ...progress, mic: "denied" }, store);
      setPhase("denied");
    }
  }

  async function finish(reason: "silence" | "max" | "no-speech") {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    vadRef.current?.stop();
    setLevel(0);
    const recorder = mediaRef.current;
    const transcriptJob = transcriptRef.current?.stop() ?? Promise.resolve(null);
    if (!recorder || recorder.state === "inactive") {
      stoppingRef.current = false;
      setPhase("idle");
      return;
    }
    try {
      recorder.requestData();
    } catch {
      /* unsupported */
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
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRef.current = null;
    stoppingRef.current = false;
    const transcript = await transcriptJob;

    if (reason === "no-speech" || blob.size < 800 || durationMs < 280) {
      setFeedback({
        source: "none",
        phonemeScoringAvailable: false,
        category: null,
        categoryLabel: null,
        observationVi: "Chưa nghe thấy tiếng nói. Thử lại, hoặc đi tiếp. Không có điểm.",
        recognizedText: null,
        providerScore: null,
        failed: true,
        allowPraise: false,
      });
      setPhase("no_speech");
      return;
    }

    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(URL.createObjectURL(blob));
    if (!score) {
      setFeedback(playbackNote);
      setPhase("result");
      return;
    }

    setPhase("assessing");
    const result = await assessTake(expected, transcript, mimeRef.current, blob);
    setFeedback(result);
    setPhase(result.failed && result.source === "none" ? "service_failed" : "result");
  }

  function replayTake() {
    audioRef.current?.play().catch(() => undefined);
  }

  const showResult = feedback && (phase === "result" || phase === "no_speech" || phase === "service_failed");

  return (
    <div className="space-y-4">
      <p className="text-base">Micro chỉ bật khi bạn bấm Ghi âm. Nghe mẫu trước.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={primaryBtn} onClick={() => void playModel(false)}>
          {REPLAY_LABEL}
        </button>
        <button type="button" className={secondaryBtn} onClick={() => void playModel(true)}>
          {SLOW_LABEL}
        </button>
      </div>
      {voiceNote ? <p className="text-base">{voiceNote}</p> : null}
      {speechError ? <p className="text-base">{speechError}</p> : null}

      {listeningOnly ? (
        <div className="space-y-3">
          <p className="en-instruction">Bạn đang học bằng cách nghe. Không cần ghi âm.</p>
          <button type="button" className={primaryBtn} onClick={() => onContinue(null)}>
            {HEARD_LABEL}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            className={primaryBtn}
            disabled={!recordUnlocked(heardModel) || phase === "recording" || phase === "assessing"}
            onClick={() => void start()}
          >
            <MicIcon />
            {phase === "recording" ? "Đang nghe…" : RECORD_LABEL}
          </button>
          {phase === "recording" ? (
            <div className="h-3 overflow-hidden rounded-full bg-[#1b2a4a]/10" aria-hidden>
              <div className="h-full bg-[#115e59]" style={{ width: `${Math.round(level * 100)}%` }} />
            </div>
          ) : null}
          {!heardModel ? <p className="text-base">Bấm Nghe lại trước khi ghi âm.</p> : null}
        </div>
      )}

      {phase === "denied" ? (
        <div className="space-y-3">
          <p className="en-instruction" role="status">
            Micro chưa được bật. Bạn vẫn học bằng cách nghe.
          </p>
          <button type="button" className={primaryBtn} onClick={markListeningOnly}>
            Học bằng cách nghe
          </button>
        </div>
      ) : null}

      {blobUrl ? (
        <div className="space-y-2">
          <audio ref={audioRef} src={blobUrl} controls className="w-full" />
          <button type="button" className={secondaryBtn} onClick={replayTake}>
            Nghe bản của tôi
          </button>
        </div>
      ) : null}

      {showResult && feedback ? (
        <div className="space-y-3 rounded-2xl border-2 border-[#1b2a4a] p-4" role="status">
          {feedback.categoryLabel && !feedback.failed ? (
            <p className="text-xl font-semibold">{feedback.categoryLabel}</p>
          ) : null}
          <p className="en-instruction">{feedback.observationVi}</p>
          {feedback.recognizedText ? <p>Máy nghe được: {feedback.recognizedText}</p> : null}
          {feedback.providerScore != null ? <p>Điểm dịch vụ: {feedback.providerScore}</p> : null}
          {!feedback.phonemeScoringAvailable ? <p>Chấm từng âm chưa có.</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primaryBtn} onClick={() => onContinue(feedback)}>
              {CONTINUE_LABEL}
            </button>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                setFeedback(null);
                setPhase("idle");
              }}
            >
              {RETRY_LABEL}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function assessTake(
  expected: string,
  transcript: string | null,
  mime: string,
  blob: Blob,
): Promise<EnglishFeedback> {
  try {
    const statusRes = await fetch("/api/english/status");
    const status = statusRes.ok ? ((await statusRes.json()) as { phoneme?: boolean }) : { phoneme: false };
    const phoneme = Boolean(status.phoneme);
    if (phoneme && isAzureAudioMime(mime)) {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch("/api/english/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expected, transcript, mime, audioBase64 }),
      });
      if (!res.ok) throw new Error("assess failed");
      const data = (await res.json()) as { ok?: boolean; feedback?: EnglishFeedback };
      if (!data.ok || !data.feedback) throw new Error("assess failed");
      return data.feedback;
    }
    return resolveEnglishAssessment({
      expected,
      transcript,
      mime,
      phonemeConfigured: phoneme,
    });
  } catch {
    if (transcript) {
      const local = assessFromTranscript(expected, transcript);
      return {
        ...local,
        observationVi: `Không gọi được dịch vụ chấm. ${local.observationVi}`,
      };
    }
    return feedbackFromServiceFailure();
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      resolve(value.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
