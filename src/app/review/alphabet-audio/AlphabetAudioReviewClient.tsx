"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  ALPHABET_AUDIO_CATALOG,
  ALPHABET_AUDIO_SOURCE_PATH,
  ALPHABET_LETTER_AUDIO_ENABLED,
  type AlphabetAudioClip,
  type AlphabetAudioFlag,
} from "@/lib/alphabetAudio";
import { stopSpeaking } from "@/lib/audio";

const STORAGE_KEY = "ami-lingua.alphabet-audio-review.v1";

type Nudge = { startMs: number; endMs: number };
type ReviewState = {
  nudges: Record<string, Nudge>;
  flags: Record<string, AlphabetAudioFlag[]>;
  notes: Record<string, string>;
};

const EMPTY: ReviewState = { nudges: {}, flags: {}, notes: {} };

const FLAG_OPTIONS: { id: AlphabetAudioFlag; label: string }[] = [
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

function effectiveBounds(clip: AlphabetAudioClip, nudge?: Nudge) {
  const start = Math.max(0, clip.speechStart + (nudge?.startMs ?? 0) / 1000);
  const end = Math.max(start + 0.05, clip.speechEnd + (nudge?.endMs ?? 0) / 1000);
  return { start, end };
}

export function AlphabetAudioReviewClient() {
  const [review, setReview] = useState<ReviewState>(EMPTY);
  const [playing, setPlaying] = useState<string | null>(null);
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

  async function playClipFile(clip: AlphabetAudioClip) {
    stopAll();
    const audio = new Audio(clip.path);
    audioRef.current = audio;
    setPlaying(clip.slug);
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

  async function playAdjusted(clip: AlphabetAudioClip) {
    const nudge = review.nudges[clip.slug];
    const { start, end } = effectiveBounds(clip, nudge);
    // No nudge → play the padded file as shipped.
    if (!nudge || (nudge.startMs === 0 && nudge.endMs === 0)) {
      await playClipFile(clip);
      return;
    }
    stopAll();
    const audio = new Audio(ALPHABET_AUDIO_SOURCE_PATH);
    sourceRef.current = audio;
    setPlaying(clip.slug);
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

  function nudge(slug: string, edge: "start" | "end", deltaMs: number) {
    const cur = review.nudges[slug] ?? { startMs: 0, endMs: 0 };
    const nextNudge =
      edge === "start"
        ? { ...cur, startMs: cur.startMs + deltaMs }
        : { ...cur, endMs: cur.endMs + deltaMs };
    persist({
      ...review,
      nudges: { ...review.nudges, [slug]: nextNudge },
    });
  }

  function toggleFlag(slug: string, flag: AlphabetAudioFlag) {
    const auto = ALPHABET_AUDIO_CATALOG.find((c) => c.slug === slug)?.autoFlags ?? [];
    const current = new Set(review.flags[slug] ?? auto);
    if (current.has(flag)) current.delete(flag);
    else current.add(flag);
    persist({
      ...review,
      flags: { ...review.flags, [slug]: [...current] },
    });
  }

  function setNote(slug: string, note: string) {
    persist({
      ...review,
      notes: { ...review.notes, [slug]: note },
    });
  }

  const flaggedCount = useMemo(() => {
    return ALPHABET_AUDIO_CATALOG.filter((c) => {
      const flags = review.flags[c.slug] ?? c.autoFlags;
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
            Alphabet audio review
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink/60">
            29 ElevenLabs clips (Thanh Ngọc). Silence-split estimates only — splitting is not
            linguistic validation. ElevenLabs may misread letters (especially look-alikes).
          </p>
        </div>
        <Link href="/" className="teacher-btn-secondary shrink-0 text-sm">
          Home
        </Link>
      </header>

      <div className="ami-card mb-5 border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-ink/80">
        <p className="font-medium text-ink">Pending Nicola approval</p>
        <p className="mt-1">
          Studio Hear/Say will keep using TTS until{" "}
          <code className="text-xs">ALPHABET_LETTER_AUDIO_ENABLED</code> is flipped after you
          approve. Do not publish these clips as verified native audio yet.
        </p>
        <p className="mt-2 text-ink/55">
          Flag status: {ALPHABET_LETTER_AUDIO_ENABLED ? "ENABLED in studio" : "disabled in studio"} ·
          flagged rows: {flaggedCount}/29 · source{" "}
          <a className="underline" href={ALPHABET_AUDIO_SOURCE_PATH}>
            master MP3
          </a>
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {ALPHABET_AUDIO_CATALOG.map((clip) => {
          const nudgeVal = review.nudges[clip.slug] ?? { startMs: 0, endMs: 0 };
          const flags = review.flags[clip.slug] ?? clip.autoFlags;
          const { start, end } = effectiveBounds(clip, nudgeVal);
          const isPlaying = playing === clip.slug;
          return (
            <li key={clip.slug} className="ami-card px-4 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-hand text-4xl text-ink" lang="vi">
                  {clip.grapheme}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    #{clip.index} · {clip.filename}
                  </p>
                  <p className="text-xs text-ink/45">
                    speech {start.toFixed(3)}s–{end.toFixed(3)}s (
                    {(end - start).toFixed(3)}s)
                    {clip.letterId ? ` · studio /studio/${clip.letterId}/hear` : " · no studio letter (q)"}
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
                  onClick={() => nudge(clip.slug, "start", -40)}
                >
                  −40ms
                </button>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.slug, "start", 40)}
                >
                  +40ms
                </button>
                <span className="ml-2 text-ink/50">End</span>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.slug, "end", -40)}
                >
                  −40ms
                </button>
                <button
                  type="button"
                  className="teacher-btn-secondary px-2 py-1"
                  onClick={() => nudge(clip.slug, "end", 40)}
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
                      delete nudges[clip.slug];
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
                      onClick={() => toggleFlag(clip.slug, opt.id)}
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
                  value={review.notes[clip.slug] ?? ""}
                  onChange={(e) => setNote(clip.slug, e.target.value)}
                  placeholder="e.g. sounds like a, not ă"
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
