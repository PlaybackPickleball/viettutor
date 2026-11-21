"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { stopSpeaking } from "@/lib/audio";
import {
  VOCAB_AUDIO_CATALOG,
  VOCAB_PACK_AUDIO_ENABLED,
  type VocabAudioClip,
  type VocabAudioFlag,
} from "@/lib/vocabulary/audio";

const STORAGE_KEY = "ami-lingua.vocab-audio-review.v1";

type Nudge = { startMs: number; endMs: number };
type ReviewState = {
  nudges: Record<string, Nudge>;
  flags: Record<string, VocabAudioFlag[]>;
  notes: Record<string, string>;
};

const EMPTY: ReviewState = { nudges: {}, flags: {}, notes: {} };

const FLAG_OPTIONS: { id: VocabAudioFlag; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "silent", label: "Silent" },
  { id: "overlap", label: "Overlap" },
  { id: "wrong-sound", label: "Wrong sound" },
];

function loadReview(): ReviewState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ReviewState;
    return {
      nudges: parsed.nudges ?? {},
      flags: parsed.flags ?? {},
      notes: parsed.notes ?? {},
    };
  } catch {
    return EMPTY;
  }
}

function saveReview(state: ReviewState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function effectiveBounds(clip: VocabAudioClip, nudge?: Nudge) {
  const start = Math.max(0, clip.speechStart + (nudge?.startMs ?? 0) / 1000);
  const end = Math.max(start + 0.05, clip.speechEnd + (nudge?.endMs ?? 0) / 1000);
  return { start, end };
}

export function VocabAudioReviewClient() {
  const [review, setReview] = useState<ReviewState>(EMPTY);
  const [playing, setPlaying] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "suspects" | "male" | "female">("all");
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<HTMLAudioElement | null>(null);
  const stopTimer = useRef<number | null>(null);

  useEffect(() => {
    setReview(loadReview());
    setReady(true);
  }, []);

  const persist = useCallback((next: ReviewState) => {
    setReview(next);
    saveReview(next);
  }, []);

  const stopAll = useCallback(() => {
    if (stopTimer.current) {
      window.clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.pause();
      sourceRef.current = null;
    }
    setPlaying(null);
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  async function playClipFile(clip: VocabAudioClip) {
    stopAll();
    const audio = new Audio(clip.path);
    audioRef.current = audio;
    setPlaying(clip.wordId);
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        setPlaying(null);
        resolve();
      };
      audio.onerror = () => {
        setPlaying(null);
        reject(new Error("clip play failed"));
      };
      void audio.play().catch(reject);
    });
  }

  async function playAdjusted(clip: VocabAudioClip) {
    const nudge = review.nudges[clip.wordId];
    const { start, end } = effectiveBounds(clip, nudge);
    if (!nudge || (nudge.startMs === 0 && nudge.endMs === 0)) {
      await playClipFile(clip);
      return;
    }
    stopAll();
    const audio = new Audio(clip.sourcePath);
    sourceRef.current = audio;
    setPlaying(clip.wordId);
    await new Promise<void>((resolve, reject) => {
      audio.onerror = () => {
        setPlaying(null);
        reject(new Error("source play failed"));
      };
      audio.onloadedmetadata = () => {
        audio.currentTime = start;
        void audio.play().then(() => {
          const ms = Math.max(50, (end - start) * 1000);
          stopTimer.current = window.setTimeout(() => {
            audio.pause();
            setPlaying(null);
            resolve();
          }, ms);
        }, reject);
      };
    });
  }

  function nudge(wordId: string, edge: "start" | "end", deltaMs: number) {
    const cur = review.nudges[wordId] ?? { startMs: 0, endMs: 0 };
    const nextNudge =
      edge === "start"
        ? { ...cur, startMs: cur.startMs + deltaMs }
        : { ...cur, endMs: cur.endMs + deltaMs };
    persist({
      ...review,
      nudges: { ...review.nudges, [wordId]: nextNudge },
    });
  }

  function toggleFlag(wordId: string, flag: VocabAudioFlag) {
    const auto = VOCAB_AUDIO_CATALOG.find((c) => c.wordId === wordId)?.autoFlags ?? [];
    const current = new Set(review.flags[wordId] ?? auto);
    if (current.has(flag)) current.delete(flag);
    else current.add(flag);
    persist({
      ...review,
      flags: { ...review.flags, [wordId]: [...current] },
    });
  }

  function setNote(wordId: string, note: string) {
    persist({
      ...review,
      notes: { ...review.notes, [wordId]: note },
    });
  }

  const visible = useMemo(() => {
    return VOCAB_AUDIO_CATALOG.filter((c) => {
      if (filter === "male") return c.voice === "male";
      if (filter === "female") return c.voice === "female";
      if (filter === "suspects") {
        const flags = review.flags[c.wordId] ?? c.autoFlags;
        return flags.length > 0;
      }
      return true;
    });
  }, [filter, review.flags]);

  const flaggedCount = useMemo(() => {
    return VOCAB_AUDIO_CATALOG.filter((c) => {
      const flags = review.flags[c.wordId] ?? c.autoFlags;
      return flags.length > 0;
    }).length;
  }, [review.flags]);

  if (!ready) {
    return (
      <div className="studio-shell">
        <p className="text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="studio-shell pb-24">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <BrandMark />
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
            Vocabulary audio review
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink/60">
            100 First-pack clips (male 10 + female 90). Mapped by original pack ID, not file
            position. Silence-split estimates only — not linguistic validation.
          </p>
        </div>
        <Link href="/" className="teacher-btn-secondary shrink-0 text-sm">
          Home
        </Link>
      </header>

      <div className="ami-card mb-5 border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-ink/80">
        <p className="font-medium text-ink">
          {VOCAB_PACK_AUDIO_ENABLED ? "Enabled for learners" : "Pending Nicola approval"}
        </p>
        <p className="mt-1">
          {VOCAB_PACK_AUDIO_ENABLED ? (
            <>
              Pack Hear / quiz / Listen-and-Type use these native clips (
              <code className="text-xs">VOCAB_PACK_AUDIO_ENABLED</code>). Keep nudging or re-flagging
              any bad cuts here.
            </>
          ) : (
            <>
              Learners keep TTS until <code className="text-xs">VOCAB_PACK_AUDIO_ENABLED</code> is
              flipped after you approve.
            </>
          )}
        </p>
        <p className="mt-2 text-ink/55">
          Flag status: {VOCAB_PACK_AUDIO_ENABLED ? "ENABLED for learners" : "disabled for learners"}{" "}
          · flagged rows: {flaggedCount}/100
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All 100"],
            ["suspects", "Suspects"],
            ["male", "Male 10"],
            ["female", "Female 90"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === id ? "bg-coral/20 text-ink ring-1 ring-coral/50" : "bg-ink/5 text-ink/60"
            }`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {visible.map((clip) => {
          const nudgeVal = review.nudges[clip.wordId] ?? { startMs: 0, endMs: 0 };
          const flags = review.flags[clip.wordId] ?? clip.autoFlags;
          const { start, end } = effectiveBounds(clip, nudgeVal);
          const isPlaying = playing === clip.wordId;
          return (
            <li key={clip.wordId} className="ami-card px-4 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="min-w-[3.5rem] font-mono text-sm text-ink/50">
                  #{String(clip.packId).padStart(3, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl text-ink" lang="vi">
                    {clip.vi}
                  </p>
                  <p className="text-sm text-ink/55">
                    {clip.en} · {clip.voice} · {clip.filename}
                  </p>
                  <p className="text-xs text-ink/40">
                    speech {start.toFixed(3)}s–{end.toFixed(3)}s ({(end - start).toFixed(3)}s)
                    {clip.meanVolumeDb != null ? ` · mean ${clip.meanVolumeDb.toFixed(1)} dB` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="teacher-btn-primary min-w-[5.5rem]"
                  disabled={Boolean(playing) && !isPlaying}
                  onClick={() => void playAdjusted(clip)}
                >
                  {isPlaying ? "Playing…" : "Play"}
                </button>
                <button type="button" className="teacher-btn-secondary" onClick={stopAll}>
                  Stop
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-ink/50">Start</span>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.wordId, "start", -40)}
                >
                  −40ms
                </button>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.wordId, "start", 40)}
                >
                  +40ms
                </button>
                <span className="ml-2 text-ink/50">End</span>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.wordId, "end", -40)}
                >
                  −40ms
                </button>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.wordId, "end", 40)}
                >
                  +40ms
                </button>
                <span className="text-ink/40">
                  nudge {nudgeVal.startMs}/{nudgeVal.endMs} ms
                </span>
                {(nudgeVal.startMs !== 0 || nudgeVal.endMs !== 0) && (
                  <button
                    type="button"
                    className="teacher-btn-secondary px-2 py-1"
                    onClick={() => {
                      const nudges = { ...review.nudges };
                      delete nudges[clip.wordId];
                      persist({ ...review, nudges });
                    }}
                  >
                    Reset bounds
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {FLAG_OPTIONS.map((opt) => {
                  const on = flags.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`rounded-md px-2.5 py-1 text-xs ${
                        on ? "bg-coral/20 text-ink ring-1 ring-coral/50" : "bg-ink/5 text-ink/60"
                      }`}
                      onClick={() => toggleFlag(clip.wordId, opt.id)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                {clip.autoFlags.length > 0 ? (
                  <span className="self-center text-xs text-amber">
                    auto: {clip.autoFlags.join(", ")}
                  </span>
                ) : null}
              </div>

              <label className="mt-3 block text-xs text-ink/50">
                Note
                <input
                  className="ami-card mt-1 w-full px-3 py-2 text-sm text-ink"
                  value={review.notes[clip.wordId] ?? ""}
                  onChange={(e) => setNote(clip.wordId, e.target.value)}
                  placeholder="e.g. cuts into next word"
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
